# Hebraico Fluente - pre-launch security audit

Date: 2026-09-20. Scope: the whole platform as deployed from this repository
(Next.js static export in `app/`, Cloudflare Worker + D1 in `worker/`, the
Mercado Pago integration, the GitHub Actions operations, the secrets and the
deployment pipeline). Method: ten independent Opus-level agents, each with a
different adversarial brief, working from source and from local execution of
the real handlers against the production schema; findings merged by a lead,
every material claim re-read in the code by the lead before it entered this
document; safe fixes applied and tested; sensitive fixes prepared as a patch
and held for the owner's decision (approved and applied the same day); a
fresh eleventh agent then tried to defeat the fixes.

One correction to the brief before anything else: **this platform has no
Supabase.** The database is Cloudflare D1, reachable only from the Worker.
Section 6 is the equivalent audit for that architecture.

Everything below uses the labels the brief asked for: CONFIRMED (executed or
read directly in the code), HIGHLY LIKELY, NEEDS MANUAL VALIDATION,
INFORMATIONAL; severities CRITICAL / HIGH / MEDIUM / LOW.

---

## 1. Executive launch verdict

**NOT READY FOR PRODUCTION as the code stood at the start of the audit.
READY AFTER REQUIRED FIXES now, with three items left, all listed in section 2
(B2 was closed when the payment patch was approved and applied).**

Why not ready: three of the ways a person could get the course without paying
were real and required no skill. The whole course content ships inside the
public JavaScript bundle that the free homepage loads; a second copy of the
entire product, with a checkout that approves itself in three seconds, was
being published automatically to a public `github.io` address on every push;
and the server-side route gate was defeated by one request header. On top of
that, the payment path had a defect that would have made every PIX purchase
fail silently once PIX is enabled on the Mercado Pago account: the buyer pays,
no access is ever granted, and the cron reports it as "liberado".

Why ready after fixes: the payment API itself holds up well under attack
(section 4), the authentication design is sound (section 5), no credential
exists anywhere in the repository or its history (section 7), and the applied
batch closed the route-gate bypass, the CSRF gap, the abuse amplifiers, the
PII leaks and the open redirect. What remains is short, concrete, and mostly a
matter of decisions rather than code.

---

## 2. Launch blockers

Only what should stop you publishing to paying customers today.

| # | Blocker | What to do | Who |
|---|---|---|---|
| B1 | **The GitHub Pages copy is live** at `moshikgueta.github.io/hebraicofluente` with the full course and a self-approving demo checkout. The workflow no longer publishes automatically (fixed), but the site already published stays up. | Settings → Pages → **Unpublish site**. Two clicks. | you |
| B2 | **The payment defect** (`payment_events` keyed by payment id): with PIX enabled at Mercado Pago, every PIX purchase would be paid and never granted. Refunds and chargebacks never revoke access. | **CLOSED** - the patch was approved and applied the same day (section 9, "Applied on approval"). What remains is the production check in `audit/README.md`: one real PIX purchase with the screen open, one refund from the panel, and the query for orders wedged before the fix. | done; production check is yours |
| B3 | **The repository is public** and 14 runs of the `Acesso` workflow already wrote customer emails into public run summaries (yours and test accounts, from what I saw; still public). New runs are masked (fixed). | Either make the repository private (closes this entirely), or delete the logs of those 14 runs (`Actions → Acesso → each run → Delete logs`; I can do it if you say so). | you |
| B4 | **The course content is public** in `/_next/static/chunks/26-*.js` (117 KB: all 22 letters, 7 modules, exercises data, culture cards). This is a known, documented limitation of a static-export app (`worker/src/gate.js:12-21`). The fix is architectural: content served from `/api/content/*` behind the session cookie. | Decide explicitly: (a) ship knowing the raw course data is downloadable by anyone who opens the network tab, and never describe the product as content-protected; or (b) do the `/api/content/*` work before launch. Under your own definition of CRITICAL, (a) is an accepted risk, not a fixed one. | you |

Not blockers, but do them in the first week: enable PIX on the Mercado Pago
account and run the production check in `audit/README.md`; confirm the
webhook in the Mercado Pago panel covers `payment` events on the production
URL (refund revocation depends on it); add a Cloudflare rate-limiting rule on `/api/*` (Bot
Fight Mode is off by design, and nothing replaced it at the edge); create a
protected `main` branch and point the deploy at it.

---

## 3. Security findings

Grouped by area. "Applied" means fixed in commits `36e9126` and `2cb7551` and
covered by `app/tests/auditoria.test.ts`; "Proposed" means it was held in
`audit/` as a patch until the owner approved it - it was, the same day, and
those items are now applied too, covered by `app/tests/pagamento.test.ts`
(section 9); "Open" means for you to act on.

### 3.1 Access to paid content

**F-01 · CRITICAL · CONFIRMED · Open (B4)** - `app/src/lib/content.ts:8-14`, `worker/src/gate.js`
Course content is imported at build time and lands in a shared chunk that the
public homepage loads. Attack: `curl https://hebraicofluente.com.br/_next/static/chunks/26-<hash>.js`,
no account. Impact: 100 percent of the product. Remediation: move
`letters/*`, `extras`, `real-world`, `culture` out of the bundle into
`GET /api/content/:id` behind `requireAccount` + `hasEntitlement`; stop
prerendering lesson bodies; add `/audio` to the gate before clips exist (done).
Verification: the chunk no longer contains letter data; `/api/content?id=alef`
returns 401 without a cookie.

**F-02 · CRITICAL · CONFIRMED · Open (B1)** - `.github/workflows/deploy-app.yml`
A full copy of the app in demo mode (`LocalApi`: accounts in localStorage,
`orderStatus` flips any order to paid after 3 s and grants 12 months) was
published on every push, 39 runs to date, indexable. Applied: the workflow is
`workflow_dispatch` only. Open: unpublish the existing site.

**F-03 · HIGH · CONFIRMED · Applied** - `worker/src/gate.js:58-59` (old)
`if (dest && dest !== 'document') return null` ran before the session was
read. `curl -H 'Sec-Fetch-Dest: empty' /licao/alef/` returned the lesson HTML
and its RSC `index.txt` with no cookie. Fix: every gated request is
authenticated; the header only selects 302 (document) vs 403 (sub-resource);
path canonicalised (decode, lowercase, collapse slashes; undecodable → gated).
Verification: `auditoria.test.ts` "o portão não acredita em cabeçalho do cliente".

**F-04 · MEDIUM · CONFIRMED · Applied** - `worker/src/worker.js`
No security headers on any HTML response; gated pages carried
`Cache-Control: public`. Fix: CSP (`default-src 'self'`, scripts `'self'
'unsafe-inline'` because a static export cannot nonce its bootstrap,
`connect-src 'self'`, `frame-ancestors 'none'`), X-Frame-Options, HSTS,
Referrer-Policy, Permissions-Policy; gated paths `private, no-store`. The CSP
was loaded in Chromium against nine pages at two widths (`npm run csp`): no
violation, no blank page.

### 3.2 Payments (detail in section 4)

**F-05 · CRITICAL (business) · CONFIRMED by four agents and by the lead · Proposed (B2), now Applied** - `worker/schema.sql:75`, `worker/src/lib/db.js:293-305`, `worker/src/api/pay.js:322-326`
`payment_events.event_id` is the Mercado Pago payment id. The first
observation of a payment (the checkout polls `/api/pay/verify` 3 s after the
QR appears, while it is `pending`) consumes the only row; the `approved`
notification collides and is dropped by every path (webhook, verify, cron).
The cron counts it as settled. Proposed fix: key on `id:status`; the
double-grant guard is the order status; grant the entitlement before marking
the order paid so an interrupted settlement is recoverable on retry.

**F-06 · HIGH · CONFIRMED · Proposed (B2), now Applied** - `pay.js:327-332`
`refunded`/`charged_back` after a paid order do nothing: no revoke, no status
change, no log. `revokeAccess` had no caller. Proposed: revoke, mark
`refunded`, log `estorno`.

**F-07 · MEDIUM · CONFIRMED · Proposed, now Applied** - `pay.js:284,299` (old)
`return applyPayment(...)` inside try/catch without `await`: a rejected
promise escapes the catch, is never logged, and aborts the whole reconcile
batch. Proposed: `return await`; per-order try/catch in reconcile (applied);
webhook returns 500 on internal failure so Mercado Pago retries, 200 when the
payment is not ours.

**F-08 · MEDIUM · CONFIRMED · Applied** - `pay.js` create/verify
No rate limit on order creation (each call is a real Mercado Pago payment) or
on verify (each call an outbound search). Applied: 6/min per account and
12/min per IP on create; 20/min on verify plus a 5-second reuse of the last
provider answer.

**F-09 · MEDIUM · CONFIRMED · Applied** - `pay.js` webhook
Every bad-signature request wrote an `access_log` row: an unauthenticated,
unthrottled D1 write. Applied: `data.id` must be 1-24 digits before the
signature is even checked; bad-signature logging capped at 30/min/IP.

**F-10 · MEDIUM · CONFIRMED · Proposed, now Applied** - `pay.js:95`
Renewal impossible while any entitlement is active: "Renovar acesso" is shown
for 30 days and led to a 409 rendered as "alguma coisa quebrou". Proposed: a
new order is accepted in the last 45 days (`grantAccess` already extends from
the expiry) and refused with `already-owned` otherwise.

**F-11 · LOW · CONFIRMED · Applied** - `worker/src/lib/mercadopago.js:216`
`getPayment` interpolated the id into the URL path unencoded. Only reachable
behind a valid HMAC, but a `../../v1/account/settings` id would have been sent
with the merchant token. Applied: numeric check plus `encodeURIComponent`.

**F-12 · LOW · INFORMATIONAL** - `mercadopago.js:123`
`authorized` maps to paid before capture. Checkout Pro auto-captures; noted.

**F-13 · MEDIUM (revenue) · CONFIRMED · Open** - your Mercado Pago account
`/v1/payment_methods` reports **card enabled, PIX not enabled**. The checkout
preselects PIX. Until PIX is enabled at Mercado Pago (Seu negócio → Meios de
pagamento) the default purchase path fails with "o problema é nosso". Do not
enable it before B2.

### 3.3 Authentication and sessions

**F-14 · MEDIUM · CONFIRMED · Proposed, now Applied** - `worker/src/api/auth.js:214`
Logout only cleared the browser cookie; the value stayed valid for 7 days.
Proposed: bump `session_version` on logout (all devices).

**F-15 · MEDIUM · CONFIRMED · Applied** - `auth.js:121` (old)
The per-email login throttle counted every attempt: 9 wrong passwords a
minute from anyone locked the real owner out with the correct password.
Applied: only failures count, on `email:ip` (5/min) and `email` (30/min);
proven: seven failures from one IP, the owner logs in from another.

**F-16 · LOW · CONFIRMED · Applied** - `worker/src/lib/session.js:53`
The parser took the first `hf_session=` cookie rather than the first that
verifies; a planted decoy with a longer Path logged the victim out
permanently. Applied: first verifying candidate (max 4). Also dropped `em`
and `nm` from the payload; nothing read them.

**F-17 · LOW · CONFIRMED (deliberate) · Open** - `auth.js:92-96`
Signup answers 409 `email-taken`: an account-existence oracle, throttled
10/min/IP. The file documents the trade-off; login and forgot are silent.
Accepting it is reasonable for a checkout flow; the edge rate limit below
reduces bulk use.

**F-18 · LOW · CONFIRMED · Applied (third pass)** - `auth.js:99-105`, `db.js:215-237`
No email verification at signup, and gifted invites redeemed on bare email
match: whoever registered a gifted address first took the course. Applied:
`inviteRedeem` is gone. A signup or login on an address with a pending invite
now notifies the **owner** (one email to `SUPPORT_EMAIL`, capped at one per
address per day) and grants nothing; the owner confirms with `liberar`, which
grants directly because the account then exists. The person is not told a gift
is waiting - that confirmation is what an impostor would use. Fails closed:
with no mail provider the trail records it and the gift keeps waiting. Note
that full signup-time email verification was NOT added: it would put friction
in front of every paying customer, who verifies themselves by paying, to close
a hole that only exists for gifts.

**F-19 · MEDIUM · CONFIRMED · Applied** - `worker/src/worker.js`
No CSRF defence beyond `SameSite=Lax`; `readJson` ignored Content-Type, so a
cross-site `text/plain` form reached every POST handler (login-CSRF today; a
full CSRF the day someone relaxes the cookie for a payment redirect). Applied:
non-GET `/api/*` with a foreign `Origin` or `Sec-Fetch-Site: cross-site` is
refused before dispatch; the webhook is exempt (HMAC is its lock).

### 3.4 Abuse and availability

**F-20 · MEDIUM-HIGH · CONFIRMED · Applied** - `worker/src/lib/db.js:316-332` (old)
`throttled()` wrote before it decided: a blocked request still cost a D1
write, so the limiter was the amplifier. On the free plan the daily write
quota was exhaustible in minutes from one machine, after which every login,
signup, order and progress save fails. Applied: read first; blocked keys cost
nothing; hourly windows; `estourou()` read-only check. A bug I introduced
while doing this (window index collision across scales) was caught by the
test and fixed before commit; `window_at` is now the window start in ms.

**F-21 · MEDIUM · CONFIRMED · Applied** - `auth.js:188-189`
Password-reset bombing: 3 sends/min/address, 4,320/day, at your Resend cost
and sender reputation. Applied: 5 per hour per address, same response body so
the cap is not an existence oracle.

**F-22 · MEDIUM · HIGHLY LIKELY · Applied** - `auth.js:39-40` (old)
`X-Forwarded-For` was the fallback IP source (client-controlled) and IPv6 was
keyed per address (a /64 is an infinite key supply). Applied:
`CF-Connecting-IP` only, IPv6 keyed by /64 (expanded from the compressed form
Cloudflare sends; v4-mapped addresses keyed as v4 - second pass).

**F-23 · LOW · CONFIRMED · Applied** - `worker/src/lib/http.js:38-42`
Body limits measured UTF-16 units, not bytes (2-3x looser than written), and
the whole body was buffered before the check. Applied: Content-Length precheck
and byte-accurate measurement; progress limit set to 512 KB bytes so nothing
that passed before is rejected.

**F-24 · LOW · CONFIRMED · Applied** - `auth.js:37`
Email validation had no length cap and allowed control characters: two
accounts that render identically. Applied: 6..254 chars, no control chars,
typeof checks on email/password.

**F-25 · LOW · CONFIRMED · Applied** - `/api/health`
Unauthenticated, unthrottled, and reported the PBKDF2 cost. Applied: 10/min
per IP; `iterations` removed. `modo` and `tokenFormato` stay: they exist so
you can check the credential without a terminal, and they name a shape, never
a value.

### 3.5 Privacy and data

**F-26 · HIGH · CONFIRMED · Applied + Open (B3)** - `.github/workflows/acesso.yml`
Read-only actions printed customer emails and order data into public run
summaries. Applied: every output passes through `mascara` (`a***@domain`);
`envios`, `consultar`, `listar`, `pagamento`, `pedido` all masked. Open: the
14 existing runs, and the fact that the email typed as a workflow input is
visible in the run metadata on a public repository.

**F-27 · HIGH · CONFIRMED · Applied** - `access_log`
The trail stored emails on signup, login-failed, forgot, password changes,
including addresses of non-customers who mistyped into the reset form, never
purged, no FK, surviving account deletion. Applied: the trail stores the
account id only; 180-day purge in the cron; e2e cleanup deletes its rows.

**F-28 · HIGH · HIGHLY LIKELY · Applied** - `payment_events.raw`
The full Mercado Pago payment object was stored forever: payer email, CPF,
cardholder name, card BIN and last four. Applied: `enxuto()` keeps only id,
status, amounts, currency, reference, dates, method. Verify after the first
real payment: `SELECT raw FROM payment_events LIMIT 1` must show no `payer`.

**F-29 · MEDIUM · CONFIRMED · Open (text)** - `app/src/app/privacidade/page.tsx`
Three mismatches between policy and code: Resend (US sub-processor receiving
email and first name) is not named; "não pedimos documento" was contradicted
by F-28 (now fixed in code); "os dados do seu cartão nunca passam pelos nossos
servidores" was too absolute (BIN/last4/name did, now not stored). Add a
Resend bullet to "Com quem compartilhamos" and a row for payment data
returned by the provider.

**F-30 · LOW · CONFIRMED · Applied** - `worker/src/api/auth.js`
Reset-token URLs on `/nova-senha/?token=` had no `Referrer-Policy`; now
`strict-origin-when-cross-origin` on every page.

### 3.6 Operations, CI and secrets

**F-31 · MEDIUM · CONFIRMED · Applied** - `acesso.yml` liberar
Granted the entitlement AND wrote a pending invite for an existing account;
the next login redeemed the invite and extended the term: 12 months requested,
24 delivered. Applied: entitlement or invite, never both. Check any account
you already granted by hand: `consultar` should show ~12 months, not ~24.

**F-32 · MEDIUM · CONFIRMED · Applied** - `acesso.yml` meses
Unbounded; a typo (`1200000000`) overflowed into a REAL expiry that made
every login of that account return 500 while the gate still let it in.
Applied: 1..120.

**F-33 · MEDIUM · CONFIRMED · Applied** - `scripts/cloudflare-setup.sh:169`
`wrangler secret list` failures were swallowed; an empty list read as "no
SESSION_SECRET" and a fresh one was generated: silent mass logout on a green
deploy. Applied: failure aborts the deploy.

**F-34 · MEDIUM · CONFIRMED · Open** - deploy pipeline
Production deploys from the development branch, the only branch; no
protection, no review, no environment gate; repo write access equals
production and database access. Applied: `environment: producao` on the
`Acesso` job (add required reviewers in Settings → Environments to make it
bite). Open: create `main`, protect it, point `deploy-worker.yml` at it.

**F-35 · LOW · CONFIRMED · Applied** - supply chain
`npx --yes wrangler@4` resolved the newest 4.x on every run with all
production secrets in the environment. Applied: pinned to 4.135.0 (the
version already running in CI) in both workflows and the setup script.
Actions are first-party tags; pinning them to SHAs is a nice-to-have.

**F-36 · LOW · CONFIRMED · Applied** - `cloudflare-setup.sh:392`
Cloudflare token in `curl -H` argv; now via a `-K` config file.

**F-37 · MEDIUM · CONFIRMED · Open (decision)** - `cloudflare-setup.sh:365-441`
The deploy turns Bot Fight Mode off zone-wide (it challenged the site's own
API, a real problem) and asks for zone-level permissions on the deploy token.
Nothing replaced it. Recommended: keep it off, and add Cloudflare Rate
Limiting rules: `/api/pay/webhook` 20/min/IP block; `/api/auth/*` 30/min/IP
managed challenge (log mode for a day first); `/api/auth/signup` 10/hour/IP;
`/api/auth/forgot` 5/hour/IP; `/api/pay/*` 30/min/IP; `/api/*` 300/min/IP.
The `workers.dev` hostname is not covered by zone rules on the custom domain;
**disabled in the third pass** (`workers_dev = false`), so the rules below,
once created, cover every way in. Turn it back on only to diagnose a DNS or
certificate problem, then off again.

**F-38 · LOW · CONFIRMED · Applied** - `scripts/cloudflare-setup.sh:227`
With `HF_SKIP_BUILD=1` the script published whatever `app/out` held,
including a demo-mode build. Applied: refuses an `app/out` whose homepage
carries the demo banner.

### 3.7 Frontend

**F-39 · MEDIUM · CONFIRMED in Chromium · Applied** - `app/src/lib/safe-next.ts`
Open redirect on the login `?next=`: `/%09/evil.example` survived the check
and, after a real login, the browser landed on `evil.example` (TAB/LF/CR are
stripped by the URL parser). Applied: strip control characters, then verify
the resolved origin with the same parser.

**F-40 · LOW-MEDIUM · CONFIRMED in Chromium · Applied** - `app/src/lib/account/worker-api.ts:24`
`process.env.NEXT_PUBLIC_API_BASE` was never set at build, so webpack left a
runtime lookup of `globalThis.process`; a script running first could point
the login POST (with the password) at another host. Applied: `BASE = ''`.

**F-41 · LOW · CONFIRMED · Applied (third pass)** - `app/src/lib/state/merge.ts:67-69`
The client merge assigned `__proto__` from parsed state onto a fresh object
(local, per-account, no global pollution). Applied: `chaves()` drops
`__proto__`, `constructor` and `prototype`, and `progress.write` rejects a
state containing any of them anywhere (iterative walk with a node budget, so
a deeply nested body cannot turn the check into a stack overflow).

**F-42 · MEDIUM · CONFIRMED · Applied (third pass)** - `db.js:449-455`
Found while adding the once-a-day cap for F-18, and latent until then: the
throttle's opportunistic cleanup deleted every row older than two hours,
while a row is stamped with the START of its window. Any window longer than
two hours therefore had its own row deleted by the call that created it, so
the counter never passed one and the cap never capped. The one-hour caps in
use (`forgot-h`) were unaffected, which is why it had gone unnoticed. Applied:
the horizon is 48 hours, with the invariant written in place - it must exceed
the largest window in use - and a test that a 24-hour window survives the
cleanup a one-minute key triggers.

**F-42 · INFORMATIONAL** - `app/src/lib/state/supabase.ts` is dead code with
no dependency and no env; it is what led the brief to assume Supabase. Delete
it.

### 3.8 Dependencies

`npm audit --omit=dev` ran. One advisory: `postcss 8.4.31` nested under
`next 15.5.25` (`</style>` stringify XSS, sourceMappingURL file read). **Not
reachable**: postcss runs at build time over CSS authored in this repository;
no attacker input reaches it. Do not `npm audit fix --force` (it wants
`next@16`). The well-known Next.js server CVEs (middleware bypass, image
optimizer, cache poisoning) require a running Next server; this is a static
export served by a Worker, so none applies. The Worker has **zero
dependencies**. `sharp` and 28 platform binaries are dead weight given
`images: { unoptimized: true }`. Node 20 runner deprecation: bump
`actions/checkout` and `actions/setup-node` to v5 when convenient.

---

## 4. Payment security report

Lifecycle: product page → `/api/pay/create` (price from `data/courses.json`
via `catalog.js`, slug validated against the catalog and `isSellable`,
installments clamped, order bound to the session's account) → Mercado Pago
(PIX `/v1/payments` with `external_reference = order.id`; card via Checkout
Pro preference with `back_urls` to `/checkout/<slug>/obrigado/?order=<id>`)
→ three settlement paths (signed webhook, `/api/pay/verify` on the buyer's
screen, 5-minute cron) → one function, `applyPayment` → `grantAccess`.

Executed by three agents against the real handlers with a fake Mercado Pago:

| Question | Answer | Evidence |
|---|---|---|
| Can a user obtain the course without paying? | **Yes, today, by two non-payment routes**: the public JS chunk (F-01) and the GitHub Pages copy (F-02). **Yes after a refund** (F-06, proposed fix). **No through the payment API.** | curl of the chunk; Pages run history; refund test in `audit/pagamento.test.ts` |
| Can a user fake a successful payment? | No. Access is granted only by `applyPayment`, reached only after a server-side `/v1/payments/{id}` or search with the merchant token. Unsigned webhook → 401; unknown `external_reference` → ignored; R$1 on a R$132,30 order → `pay-mismatch`, no grant; USD → refused. | executed |
| Can a payment be reused? | No. `payment_events` uniqueness plus the `order.status === 'paid'` guard; a consumed payment re-pointed at a second order settled nothing. The 5-minute `ts` window rejects recorded deliveries. | executed |
| Can one user use another user's payment? | No. The order comes from the payment's `external_reference`, the account from the order row; nothing from the client. `verify` on another account's order → 404, same as nonexistent. | executed |
| Can checkout parameters be manipulated? | No. `amountCents:1, currency:'USD', installments:999, accessMonths:999` stored the catalog price, BRL, 12x. `hebraico-a1` (soon) and unknown slugs → 404. | executed |
| Can changing frontend state unlock the course? | Not on the server: the gate reads `entitlements` from D1 on every request; the cookie carries identity only. It only reveals content already public (F-01). In the Pages demo it unlocks everything (F-02). | executed + code |
| Can opening the success URL unlock it? | No. `ObrigadoClient` reads only `?order=` and asks the server; `status=approved` in the URL has no reader. | code |
| Can a forged webhook unlock it? | No. HMAC over `id;request-id;ts` with a 5-minute window, constant-time compare, fail-closed without the secret; the status is re-fetched, never trusted. | executed |
| Can a refunded/cancelled payment retain access? | **Yes, today.** Nothing revokes. Fixed in the proposed patch; until then, `Acesso → revogar` by hand after every refund. | executed |

Additional payment facts: `MP_SANDBOX="1"` in `wrangler.toml` is correct and
safe (the token prefix decides; the var only matters for an unknown prefix,
and then the default is "do not charge"). `.env.example` and
`DEPLOY-CLOUDFLARE.md` still tell the operator to set it to 0: fix the docs,
not the value. The webhook manifest matches Mercado Pago's spec byte for byte
for a normal delivery; the absent-`x-request-id` template variant is not
implemented (fail-closed, cosmetic). Whether Mercado Pago sends `ts` in
seconds for this account is confirmed only by a real delivery: check the first
one in the Worker log.

---

## 5. Authorization matrix

Verified against the router (`worker/src/worker.js:23-52`) and the gate, by
execution. There is no admin principal: privileged operations exist only as
GitHub Actions (`acesso.yml`), gated by repository write access.

| Resource | Anonymous | Signed in, unpaid | Paid Alfabetização | Other paid course | "Admin" |
|---|---|---|---|---|---|
| Public site, sales pages, legal pages, auth screens, checkout page | allow | allow | allow | allow | n/a |
| `/licao/*`, `/modulo/*`, `/checkpoint/*`, `/extra/*`, `/revisao`, `/academia`, `/mapa`, `/desafio-final`, `/certificado`, `/concluido`, `/conquistas`, `/historia`, `/workbook`, `/inicio`, `/onboarding`, `/meu-hebraico`, `/audio/*` (HTML and RSC) | 302 to login (403 for sub-resource requests) | 302 to sales page | allow | 302 (gate hardcodes `alfabetizacao`; change to a prefix map when A1 ships) | n/a |
| `/_next/static/**` (contains the course data) | **allow (F-01)** | allow | allow | allow | n/a |
| `/perfil/` (HTML shell) | allow (shell only; data comes from session-scoped APIs) | allow | allow | allow | n/a |
| `GET /api/me`, `/api/orders`, `/api/progress` | 401 | own only | own only | own only | n/a |
| `PUT/DELETE /api/progress` | 401 | own row, rev CAS, 60/min | own | own | n/a |
| `POST /api/pay/create` | 401 | allow (price server-side, 6/min) | 409 outside the renewal window (proposed) | allow | n/a |
| `GET /api/pay/verify?order=` | 401 | own order; others 404 | own | own | n/a |
| `POST /api/auth/password` | 401 | self, needs current password | self | self | n/a |
| `POST /api/pay/webhook` | valid HMAC only | same | same | same | n/a |
| Grant / revoke / list accounts / read the trail | unreachable over HTTP | same | same | same | GitHub Actions with repo write |

Cells no agent could verify: none for the HTTP surface. The gate's behaviour
for the case-variant and double-slash paths was verified end to end by one
agent under `wrangler dev`: the asset server normalises them and they land in
the gate as 302.

---

## 6. Database security report (D1, in place of Supabase)

Tables: `accounts` (email UNIQUE, PBKDF2 hash/salt/iter, `session_version`),
`entitlements` (PK account+course, FK → accounts), `orders` (server-minted
random id, FK → accounts), `payment_events` (PK event id), `throttle`,
`password_resets` (PK = sha256 of the token, FK → accounts),
`access_log` (no FK, never purged - now purged at 180 days), `invites`
(keyed by email), `progress` (PK account, rev counter).

RLS: not applicable; there is no client-reachable database endpoint. The
equivalent property, verified query by query: every one of the 36 statements
in `worker/src/lib/db.js` is parameterised; the one dynamic fragment
(`updateOrder`) allow-lists column names; every query on user data is scoped
by the account id taken from the signed cookie, never from a parameter;
expiry is enforced on every entitlement read; entitlements are written by
exactly two callers (`applyPayment`, `inviteRedeem`) plus the operator SQL in
`acesso.yml`. Foreign keys are enforced on D1 (proven locally and by a real
production failure in the deploy history).

Potential bypasses examined and closed or accepted: operator SQL in
`acesso.yml` is built by string but the email is quote-doubled and `xargs`
rejects unbalanced quotes; `curso` and `acao` are `type: choice` (server
validated) - if either is ever changed to `type: string` it becomes injectable
at seven places, so keep them as choices. `meses` clamped (F-32).

Service-role usage: the deploy token (`CLOUDFLARE_API_TOKEN`) has D1 write on
the whole database and is used by both workflows; a separate read-only token
for the read actions would be better.

Backup and recovery: nothing in the repository backs up D1. Assumption, not
verified: D1 Time Travel gives ~30 days of point-in-time restore, whole
database only, and does not survive database or account deletion. Recommended
first-week item: a weekly `wrangler d1 export` into an encrypted, access
controlled location, and one rehearsed restore.

No migration mechanism: `schema.sql` is `CREATE TABLE IF NOT EXISTS` only;
adding a column to an existing table does nothing in production, silently.
`accounts.pass_iter DEFAULT 310000` disagrees with the code's 25,000; harmless
today, a trap for a future manual insert.

---

## 7. Secret exposure report

Every candidate, redacted:

| Candidate | Where | Real? | Exposure | Action |
|---|---|---|---|---|
| `SESSION_SECRET=teste-lo...REDACTED` | `.dev.vars:1` | no (placeholder) | local disk, gitignored, never committed | none |
| `MP_ACCESS_TOKEN=TEST-nao...REDACTED` | `.dev.vars:2` | no | same | none |
| `APP_USR-12345678...REDACTED`, `TEST-1234567890...` | `app/tests/senha.test.ts` | no (format fixtures) | public repo, harmless | none |
| D1 `database_id` | `wrangler.toml:67` | real id, not a credential | public | none |
| PIX key (CNPJ) `51041290000152` | `data/empresa.json` | real, public by design | printed on the payment screen | none |
| Cloudflare token, Resend key, real Mercado Pago token | nowhere | - | - | - |

1,086 blobs across all refs and the reflog were scanned individually; zero
real credentials. No server-only value reaches the browser bundle (286 files
checked; the only inlined env is `NEXT_PUBLIC_PLATFORM_API=worker`). No source
maps. Secrets are pushed to the Worker through stdin, never argv, never
printed; the credential guard prints presence and length only. No workflow
uses `pull_request`/`pull_request_target`, so fork PRs never see secrets.

Classification: `SESSION_SECRET`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`,
`RESEND_API_KEY`, `CLOUDFLARE_API_TOKEN` are server-only and correctly placed.
`SITE_ORIGIN`, `EMAIL_FROM`, `SUPPORT_EMAIL`, `MP_SANDBOX`, all `NEXT_PUBLIC_*`
are safe public. Customer emails were the one misplaced item (public Actions
summaries, F-26): fixed going forward, existing runs open (B3).

---

## 8. Attack chains

**Chain A - the course for free, no account.** Entry: any browser. Steps:
open the homepage, read the chunk name from the HTML, fetch it (F-01); or
open the Pages copy and click buy (F-02). Impact: the whole product. Why
defenses fail: the gate covers routes, not the bundle; the second deployment
was automatic. Remediation: B1 today, B4 as an explicit decision.

**Chain B - buy once, keep forever, pay nothing.** Entry: a normal purchase.
Steps: pay (card works today), study, request the 7-day refund the site
advertises or charge back; the refund event is swallowed (F-05) or ignored
(F-06); access stands 12 months; nothing shows it. Remediation: B2, and
`revogar` by hand until then.

**Chain C - the support desk becomes the vulnerability.** Entry: PIX enabled
before B2. Steps: every PIX buyer pays and gets nothing (F-05); support's
routine becomes "run liberar when someone says they paid"; an attacker just
needs to be one of those emails; there was no way to look up an order by the
PIX identifier (fixed: `pedido` action) and the FAQ said "no receipt needed".
Remediation: B2 first; use `pedido` before every manual grant.

**Chain D - the gifted course, taken.** Entry: knowledge of a gifted address
(F-18). Steps: register it first; the invite redeems into the attacker's
account; the real recipient hits `email-taken`; support grants again.
Remediation: create invites only for people who already have an account
(now the default when the account exists), or verify email before redeeming.

**Chain E - one header, one lesson.** Closed. Was: `Sec-Fetch-Dest: empty`
(F-03) plus `Cache-Control: public` (F-04) on the served lesson.

**Chain F - cheap outage.** Closed. Was: unauthenticated writes on the webhook
(F-09) plus the write-before-decide throttle (F-20) against a daily D1 write
quota.

---

## 9. Automated fixes applied

Commit `36e9126` on `claude/practical-babbage-veufcz`, deployed by run 53
(green, including the production e2e). Files:

- `worker/src/gate.js` - authenticate every gated request; header selects
  302 vs 403; `canonical()`; `/audio` gated.
- `worker/src/worker.js` - origin check on non-GET API; `blindar()` security
  headers; `private, no-store` on gated paths.
- `worker/src/lib/http.js` - byte-accurate `readJson` with Content-Length precheck.
- `worker/src/lib/session.js` - payload `{uid, sv, exp}`; first verifying cookie.
- `worker/src/lib/db.js` - `throttled` read-first with windows; `estourou`;
  `enxuto` projection; `logPurge`.
- `worker/src/api/auth.js` - `ip()`; `emailOk` bounds; typeof checks; login
  failure-only counters; forgot hourly cap; no emails in the trail; health
  throttle, no `iterations`.
- `worker/src/api/pay.js` - create/verify throttles; numeric `data.id`;
  bad-signature log cap. `worker/src/lib/mercadopago.js` - `getPayment` guard.
- `worker/src/api/progress.js` - DELETE throttle; 512 KB bytes.
- `worker/src/reconcile.js` - per-order try/catch; `logPurge`.
- `app/src/lib/safe-next.ts` (new), `AuthForm.tsx` - open redirect closed.
- `app/src/lib/account/worker-api.ts` - `BASE = ''`.
- `.github/workflows/acesso.yml` - masking, `meses` clamp, entitlement-or-invite,
  `pedido`, `environment: producao`, wrangler pinned.
- `.github/workflows/deploy-app.yml` - dispatch only.
- `.github/workflows/deploy-worker.yml` - cleanup includes `access_log`; wrangler pinned.
- `scripts/cloudflare-setup.sh` - secret list fail-closed; curl config file;
  demo-build refusal; wrangler pinned.
- `app/tests/auditoria.test.ts` (new, 35 tests), `app/csp.mjs` (new), `app/package.json`.

**Second pass**, commit `2cb7551`, deployed by run 55 (green, including the
production e2e), after the independent verification in section 10:

- `worker/src/lib/db.js` - `throttled` decides from the atomic
  `INSERT ... ON CONFLICT ... RETURNING hits`; the read-first only saves writes.
- `worker/src/lib/session.js` - up to 32 cookie candidates of at most 512
  chars (was 4, which five decoys defeated).
- `worker/src/lib/http.js` - `readJson` streams and cancels at the byte cap.
- `worker/src/api/auth.js` - IP throttle before the body read in login, forgot
  and reset; IPv6 `::` expansion; v4-mapped → v4.
- `worker/src/worker.js` - every response passes through `blindar()`,
  including the www 301, the gate 302/403 and the API.
- `.github/workflows/acesso.yml` - `LC_ALL=C.UTF-8`, byte-safe mask, writes
  routed through the mask (`grava`), `meses` rejects anything but digits.
- `.github/workflows/deploy-worker.yml` - e2e cleanup deletes `payment_events`.
- `app/csp.mjs` - three more routes. `app/tests/auditoria.test.ts` - 44 tests.

**Applied on approval** (same day, after the report was delivered and the
owner asked for it): the payment patch, previously held in `audit/` as
`pagamento-proposto.patch`, touching `worker/src/api/pay.js`,
`worker/src/lib/db.js`, `worker/src/api/auth.js`, `worker/src/reconcile.js`,
`app/src/lib/account/types.ts`, `app/src/lib/account/worker-api.ts`,
`app/src/app/checkout/[slug]/CheckoutClient.tsx`. Covers F-05, F-06, F-07,
F-10, F-14, plus the four concerns the verification raised against its first
version (section 10, C1-C4). Its 16 tests now live in
`app/tests/pagamento.test.ts` in the regular suite (378 tests); before the
patch 14 of them failed. The patch file itself was removed once applied (it
is in the git history); `audit/README.md` stays as the record, with the
production check to run (one real PIX purchase with the screen open, one
refund from the panel, the query for orders wedged before the fix) and the
two product decisions it embeds (partial refunds below the course price
close access; logout closes every device).

Why this batch was held until asked: the brief said not to redesign payment,
authentication or entitlement logic silently. Everything in it changes when
access is granted or removed, so it was explained here first and applied on
an explicit word.

---

## 10. Post-fix security test

An eleventh agent, which had written none of the fixes, was given the applied
diff and the proposed patch with instructions to defeat them and to look for
regressions. It found eight ways past the first batch and four defects in the
first proposal. None of them reopened a launch blocker; all of them were real.
What it found, and what happened to each:

**Bypasses of the applied fixes**

| # | Finding | Status |
|---|---|---|
| V1 | `throttled` read the counter, then wrote. Fifty requests fired in parallel all read "zero" and all passed; the limit only held for sequential traffic. | **Fixed** (`2cb7551`): one atomic `INSERT ... ON CONFLICT DO UPDATE ... RETURNING hits`; the pre-read can only deny. Test: 50 parallel calls, exactly 5 pass. |
| V2 | The session parser capped candidates at 4. Five planted `hf_session` decoys with a longer `Path` pushed the real cookie out of the loop - the exact logout attack the fix was for. | **Fixed**: cap is on work, not count - 32 candidates, each ≤ 512 chars. Test: 20 decoys and a 3 KB decoy, session still found. |
| V3 | Per-email failure cap of 30/min could still lock an account from six or more addresses. | **Residual, documented.** The per-(email, IP) cap of 5 and the per-IP cap of 20 make this cost ≥ 6 distinct IPs per minute, sustained, per victim. Closing it needs a CAPTCHA or a proof-of-work on the login form - product change, not in scope. Effect is denial of login for one minute at a time, never access. |
| V4 | `readJson` trusted `Content-Length`; a chunked body with none was read in full before the byte check. Login, forgot and reset also read the body before their IP throttle. | **Fixed**: streaming read cancelled at the first byte past the cap (test: 200 × 1 KB chunks, fewer than 20 delivered); throttle before the body read in all three routes (test: body left unread on 429). |
| V5 | The email mask in `acesso.yml` used `[[:alnum:]]`, which under `LC_ALL=C` does not match `é`, so `josé@…` printed in full; the three write commands were not masked at all. | **Fixed**: `LC_ALL=C.UTF-8`, a negated byte class, and every write piped through the mask (`grava`). Checked under both locales. |
| V6 | IPv6 keys were cut before expanding `::`, so `2001:db8::1` and `2001:db8:0:0:1::` got different keys - separate budgets in one /64. | **Fixed**: full expansion, then the first four hextets; v4-mapped keyed as v4. Test covers seven forms. |
| V7 | `blindar()` wrapped only asset responses; the www 301, the gate 302/403 and every API response left without HSTS or nosniff. | **Fixed**: one exit for every response. Test asserts the headers on all three. |
| V8 | `canonical()` returns null for an undecodable path, and the gate treats null as gated, so `/%zz` on a public path redirects to login instead of the site's 404. | **Residual, cosmetic.** Fail-closed by design; costs a 302 on a URL no browser produces. |

**Regressions in the applied batch**

| # | Finding | Status |
|---|---|---|
| R1 | `/audio` is now gated, but `AudioButton` is also used on the landing (`Fecho.tsx`) and other free pages. Nothing breaks today because `public/audio/` is empty, but the first clip added will 403 on the homepage. | **Documented, not changed.** When clips exist, either serve free-page clips from a different prefix or make `/audio` a per-lesson decision. Noted in `worker/src/gate.js` and here. |
| R2 | `csp.mjs` did not open `/checkout/…/obrigado/`, `/nova-senha/` and `/perfil/`. | **Fixed**; all render clean under the policy. |
| R3 | e2e cleanup left `payment_events` rows behind for deleted orders. | **Fixed**. |
| R4 | `meses` in `acesso.yml` stripped non-digits, so `1e9` became `19` and `-5` became `5`. | **Fixed**: anything but digits is an error. |

**Defects in the first version of the proposed payment patch**

| # | Finding | Status |
|---|---|---|
| C1 | With the grant moved before the order update, a crash between the two made the retry call `grantAccess` again - which extends. A recovered order got 24 months. | **Fixed in the patch**: if the entitlement already names this order and the order is still pending, only the order is marked. Test 6. |
| C2 | `revokeAccess` deletes the whole row, so refunding a renewal also removed the months of the earlier, unrefunded purchase. | **Fixed in the patch**: `rollbackAccess` subtracts that order's months and deletes only if nothing remains. Test 7. |
| C3 | Partial refunds leave the Mercado Pago status at `approved` with `transaction_amount_refunded > 0`; the patch ignored the field, so a 99% refund kept access. | **Fixed in the patch**: if what remains is below the course price the payment is treated as refunded. This embeds a product decision (a goodwill partial refund closes access) - spelled out in `audit/README.md`. Test 8. |
| C4 | A payment id Mercado Pago does not know (their panel's simulator, another merchant's payment) returned 404 → our 500 → retried forever, one trail row per retry. | **Fixed in the patch**: provider 404 → 200 and no retry; `settle-error` trail capped at 20/min. Test 9. |
| C5 | Logout-bumps-`session_version` signs every device out, not just the current one. | **Product decision, documented** in `audit/README.md` with the one-line way to keep "sign out here only". |

After the second pass, the same agent's attack list was re-run by the lead
against the deployed Worker's test double: 44 audit tests, 362 in the full
suite, typecheck, production build, CSP in Chromium at two widths, page
sweep, all green; deploy 55 green including the production e2e.

---

## 11. Before-launch checklist

| Item | Status | Note |
|---|---|---|
| Authentication | [PASS] | PBKDF2 per-row salt and cost, constant-time compare, fake verify on unknown accounts, session HMAC with `sv`, failure-only login throttling |
| Authorization | [PASS] | every API scoped by the cookie's account id; no IDOR found by three agents; gate authenticates every paid route |
| RLS / database access | [PASS] | no public database endpoint; 36/36 queries parameterised and scoped |
| Paid course protection | [FAIL] | content in the public bundle (B4) and the Pages copy (B1); route gate now holds |
| Mercado Pago integration | [MANUAL CHECK] | credential authenticates (proven by the deploy probe); PIX not enabled on the account; no real purchase has been proven end to end |
| Webhook verification | [PASS] | HMAC, replay window, fail-closed, status re-fetched, numeric id, log cap |
| Payment integrity | [PASS] code · [MANUAL CHECK] production | the payment patch is applied (pending-first settles, refunds and partial refunds revoke, interrupted grants recover); one real PIX purchase and one panel refund still to be proven end to end |
| Replay protection | [PASS] | `ts` window, event uniqueness, order-status guard |
| Secrets | [PASS] | none in code, history, bundle or logs |
| CORS | [PASS] | no CORS headers emitted; cross-origin JS cannot read responses; origin check on writes |
| Security headers | [PASS] | CSP, frame-ancestors, HSTS, Referrer-Policy, nosniff, Permissions-Policy; verified in Chromium |
| Rate limiting | [PASS] app-level · [MANUAL CHECK] edge | every route throttled in the Worker; add the Cloudflare rules in F-37 |
| Sensitive data | [PASS] code · [FAIL] until B3 | trail and payment events minimised; public run logs of past `Acesso` runs still up |
| Production environment | [MANUAL CHECK] | deploys from the dev branch with no protection (F-34); Bot Fight Mode off by design |
| Logging | [PASS] | no secrets, no PII, no stack traces to clients; 180-day purge |
| Error handling | [PASS] | closed-vocabulary error codes; exceptions logged server-side only |
| Dependencies | [PASS] | one unreachable build-time advisory; Worker has zero deps |
| HTTPS | [PASS] | Cloudflare TLS; HSTS now set; www → apex 301 |
| Backup / recovery assumptions | [PASS] tooling · [MANUAL CHECK] habit | `npm run db:backup` exports production to a gitignored, mode-600 file; `npm run db:backup:ensaio` restores it into a local database and counts the rows back. Run it, keep a copy off the machine, and repeat on a schedule you will actually keep |
| Privacy policy accuracy | [MANUAL CHECK] | add Resend and provider-returned payment data (F-29) |

---

## The most important question

**"If I publish Hebraico Fluente today and somebody intentionally tries to
access the paid Alfabetização course without paying, what are the realistic
ways they could try, and which of those attacks currently succeed?"**

With the applied fixes deployed and the four blockers still open, this is the
honest list, ordered by how a determined person would actually try:

1. **Open the network tab on the free homepage and download the course data
   chunk.** SUCCEEDS. One request, no account. They get the letters, words,
   syllables, exercise data, culture cards and stroke paths - the raw material
   of the whole course, not the app around it. This stays true until the
   content is served from behind the cookie (B4), or until you decide, with
   eyes open, that the raw data being public is acceptable for this product.
2. **Open the GitHub Pages copy and "buy" there.** SUCCEEDS until you
   unpublish it (B1). They get the complete app, every lesson, the exam and
   the certificate, in their browser, forever.
3. **Buy with a card, then refund or charge back within the 7 days you
   advertise.** FAILS now that the payment patch is applied: the `refunded`
   or `charged_back` notification rolls back that order's months and marks
   the order. One dependency remains: the Mercado Pago webhook must be
   configured for `payment` events on the production URL, because the cron
   does not revisit paid orders - without the notification, the refund is
   still `revogar` by hand. Prove it once with a panel refund.
4. **Fetch a lesson URL directly, with or without header tricks, path tricks
   or a decoy cookie.** FAILS. 302 or 403, verified against the real Worker
   with every variant the agents could think of.
5. **Forge a webhook, replay a real one, reuse a payment id, point another
   account's payment at their order, open the success URL with
   `status=approved`, edit the price, currency, installments or course slug in
   the checkout request, flip client-side state or localStorage.** FAILS. All
   executed against the real handlers; none granted anything.
6. **Register a gifted address before its owner does.** SUCCEEDS only if they
   know an address you have gifted to someone without an account (F-18).
7. **Get support to run `liberar` on a claim.** Depends on you: use the new
   `pedido` action to match the statement before granting.

Everything in 4 and 5 is what the payment and auth layers were built to stop,
and they stop it. Item 3 is closed by the applied patch. Items 1 and 2 are
outside those layers and are fixed by two clicks and one decision.

---

## Verification results

Recorded in section 10. Short form: eight bypasses of the first batch, four
regressions and four defects in the first proposal were found; thirteen were
fixed and tested, three are documented residuals (V3 per-email lockout from
six or more addresses, V8 cosmetic 302 on undecodable paths, R1 `/audio` on
free pages once clips exist) and one is a product decision (C5). The second
batch is deployed (`2cb7551`, run 55); the corrected proposal is in `audit/`.
