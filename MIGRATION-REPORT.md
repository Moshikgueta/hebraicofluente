# Hebraico Fluente — migration report (STEP 1)

Audit of `espanolsindolordecabeza` (read-only source) for the purpose of forking an
engine — not content — into a new, independent project that teaches **Hebrew to
Brazilian Portuguese speakers**.

Nothing in the Spanish project was modified, moved or committed. This file lives in
`/home/user/hebraico-fluente/`, a sibling directory, and is not yet under git (that is
STEP 2, which needs your approval).

**Source surveyed:** 133 tracked files, ~28,100 lines across `functions/`, `src/`,
`scripts/`, `public/`, `migrations/`, `schema.sql`, `wrangler.toml`, `.github/workflows/`.

---

## 0. Two corrections to the brief, before anything else

1. **The payment provider is not PayPlus.** The live integration is **HYP · יעד שריג
   (YaadPay)** — `functions/_hyp.js`, `migrations/0003-hyp.sql` ("switch the commerce
   layer from PayPlus to HYP"). PayPlus survives only as dead vestiges:
   `orders.page_request_uid` (`schema.sql:26`, commented "legacy (PayPlus); unused by
   HYP"), three prompts in `scripts/setup-cloudflare.mjs:78-80`, and a `payplus` entry in
   the client provider table. This matters because HYP's defining constraint —
   **no push webhook, browser redirect is the only notification channel** — is the reason
   `/api/pay/callback`, `payment_events`, and the 10-minute reconciler cron exist at all.
   A provider with a real webhook makes roughly 300 lines of that machinery unnecessary.

2. **There is no registration endpoint.** Account creation is welded into checkout:
   `functions/api/pay/create.js:80-112` is, in its own words, "the only place an account
   is ever created". `scripts/grant-access.mjs` exists purely to work around this (it
   prints SQL you run by hand). For Hebraico Fluente with a manual/external payment
   provider, a standalone `POST /api/auth/register` is a **new** piece of work, not a
   port. This is the single biggest functional gap in the fork.

---

## A. Architecture inventory

### Deployment shape

A **Cloudflare Worker** (not Pages, despite Pages-style module layout) named
`https-username-github-io-project-name`, git-connected, built from `wrangler.toml`.
`[assets] run_worker_first = true` means `src/worker.js` sees **every** request before
static assets — that is what makes the paywall real rather than cosmetic.

| Directory / file | Role |
|---|---|
| `wrangler.toml` | Worker name, `main`, `[assets]` → `./public`, D1 binding `DB` → `sbk-course`, `[triggers] crons = ["*/10 * * * *"]`, and `[vars]` (PRICE_ILS, MAX_INSTALLMENTS, ACCESS_MONTHS, CURRENCY, DISCOUNT_CODES, HYP_API_BASE, SITE_ORIGIN, OWNER_EMAIL) |
| `src/worker.js` (76) | Entry. A flat `ROUTES` map of `"METHOD /path"` → handler; `/` rewrites to `Site.dc`; everything else falls through the gate to `env.ASSETS`. `scheduled()` calls the reconciler. |
| `functions/_middleware.js` (81) | **The access gate.** `normalizePath()` decodes up to 4× and resolves `..`/`\`/`//` so encoding tricks can't slip past; `GATED_HTML` is a **denylist** of 11 stems (+11 legacy spaced names); `workbook-data.js` is swapped for `workbook-data-free.js` when unauthenticated; otherwise 302 to `#/login`. |
| `functions/_shared.js` (574) | The engine core: `json()`, `escapeHtml()`, `newOrderId()`, PBKDF2 hashing (600k iters, per-row `pass_iter`), `passwordProblem()`, HMAC session cookie (7 days) + `sessionLive()` live re-check, HMAC unsubscribe tokens (`unsub:` domain separator, no expiry), checkout-intent cookie, D1-backed throttle table with fail-open semantics, `discountFor()`, `paidUntilFrom()`, `logAccess()`, Resend `sendEmail`/`sendEmailBatch`, `markOrderPaid()`. |
| `functions/_hyp.js` (163) | HYP client: `APISign&What=SIGN` → payment URL, `APISign&What=VERIFY` → authenticity. `RESERVED` set blocks the caller from overriding `action/What/KEY/PassP/Masof`. `RETURN_FIELDS` allowlist. |
| `functions/api/auth/*` | `login` (40), `logout` (7), `me` (11), `reset-request` (52), `reset-complete` (45). |
| `functions/api/pay/*` | `create` (175, also signup), `discount` (31), `callback` (161), `verify` (80). |
| `functions/api/progress.js` (32) | GET/PUT the workbook progress blob, session-gated, 128 KB cap. |
| `functions/api/subscribe.js` (53) / `unsubscribe.js` (72) | Practice list in/out. Subscribe fails open; unsubscribe is deliberately un-throttled and POST-only (mail-client prefetch). |
| `functions/api/admin/send-update.js` (148) | Campaign send via Resend batch, URL-token auth, dry-run default, 12-hour duplicate guard, per-recipient signed unsubscribe + RFC 8058 headers. |
| `functions/reconcile.js` (144) | Cron sweep: retry `payment_events` stuck at `failed`, expire `created` orders after 24 h, notify `OWNER_EMAIL`. |
| `schema.sql` (120) | 8 tables: `accounts`, `orders`, `progress`, `reset_tokens`, `payment_events`, `access_log`, `auth_throttle`, `subscribers`, `campaigns`. |
| `migrations/0001..0005` | Security hardening, auth throttle, PayPlus→HYP, subscribers, campaigns. |
| `scripts/` (11 files, ~2,200 lines) | `e2e.mjs` (780, 134 assertions, boots `wrangler dev` + a mock HYP terminal), `check-config` (predeploy guard), `check-refs`, `check-exercises`, `check-accessibility` (Playwright), `check-seo`, `check-workbook-solvable` (Playwright, solves all 45 sets), `build-seo`, `build-free-workbook`, `grant-access`, `revoke-access`, `setup-cloudflare`. |
| `public/vendor/` | React 18.3.1 + ReactDOM UMD, Babel standalone 7.29, and **self-hosted OFL Hebrew webfonts** (Frank Ruhl Libre + Assistant, Hebrew and Latin subsets). |
| `public/support.js` (1768) | **The template engine.** Header says "GENERATED from dc-runtime/src/*.ts — do not edit." Parses `<x-dc>` + `<script type="text/x-dc">`, compiles `{{ }}` bindings, `<sc-if>`, `<sc-for>`, `<x-import>`, into React elements; `evalDcLogic()` runs your `class Component extends DCLogic`; Babel is lazy-loaded for JSX. **The TypeScript source is not in this repo.** |
| `public/doc-page.js` (477) | Third-party "omelette starter" print/page web component. `@page` injection, break hygiene, running header/footer slots. Language-agnostic. |
| `public/image-slot.js` (1239) | Same family; user-fillable image placeholder, hydrates from a `.image-slots.state.json` sidecar (which lives in `internal/` and deliberately 404s in production). |
| `public/accessibility.js` (521) | The a11y menu: skip link, floating button (Alt+Shift+A), classes on `<html>`, `zoom` on `.sbk-a11y-page` (because the book's inline px ignores `rem`), `window.SbkAccessibility.{get,set,reset}` + a `sbk-a11y-change` event. |
| `public/spanish-audio.js` (191) | Click-to-hear. Manifest-driven recorded clips with silent TTS fallback. |
| `public/Workbook.dc.html` (975) | **The exercise engine** — 12 item types, 45-set picker, progress persistence, two mix modes, retry-wrong. |
| `public/workbook-data.js` (1008) | 45 sets / **830 items**. By type: `c` 369, `f` 160, `r` 83, `o` 53, `k` 37, `l` 37, `x` 24, `z` 18, `s` 16, `d` 16, `g` 11, `m` 6. |
| `public/Site.dc.html` (1992) | Sales page + checkout + login + student area SPA (hash routing `#/`, `#/checkout`, `#/login`, `#/app`, `#/app/u/N`, `#/curriculum`, `#/about`), plus JSON-LD. |
| `public/*.dc.html` (units, appendix, exam, cover) | ~11,600 lines of frozen Spanish course content. |
| `public/_headers`, `_redirects` | Security headers incl. a real CSP; `/` → `/Site.dc.html 200`. |
| `.github/workflows/` | `d1-migrate.yml` (manual, typed confirmation), `send-update.yml` (manual, dry-run default). |
| `internal/` | Production-only: manuscript, uploads, audio script, design-system bundle, image sidecar. **Never deployed. Never to be copied.** |

### Auth / session model (worth stating precisely, because it is the best thing here)

- Password: PBKDF2-SHA256, 600,000 iterations, 16-byte salt, **iteration count stored per
  row** so it can be raised without invalidating anyone.
- Unknown-email logins burn identical PBKDF2 work (`fakeVerifyPassword`) — no timing oracle.
- Session: stateless HMAC cookie, 7 days, `HttpOnly; Secure; SameSite=Lax`, payload
  `{uid, em, nm, pu, sv, exp}`.
- `sessionLive()` re-reads `accounts.paid_until` and `session_version` on **every** gated
  request, so a refund or password reset cuts access within one request — and falls back
  to the cookie if D1 is unreachable, so an infra blip never locks out paying customers.
- Throttle: D1 table keyed `action:ip:x` / `action:id:email`, per-IP tight and per-account
  loose (so nobody can freeze a named customer out), **every storage call fails open**.

---

## B. REUSE vs REBUILD

| Module | Verdict | Notes |
|---|---|---|
| `functions/_shared.js` — PBKDF2, HMAC session, intent cookie, unsub tokens, `timingSafeEqual`, `b64url` | **REUSE AS IS** | Pure WebCrypto. Zero language coupling. |
| `functions/_shared.js` — throttle (`THROTTLE`, `throttleRetryAfter/Failure/Clear`) | **REUSE AS IS** | Only `tooManyAttempts()`'s message string is Hebrew. |
| `functions/_shared.js` — `logAccess`, `accessMonths`, `paidUntilFrom` | **REUSE AS IS** | — |
| `functions/_shared.js` — `discountFor` | **REUSE WITH CHANGES** | Rename `PRICE_ILS` → `PRICE` (currency-neutral); keep the `>= 100` rejection. |
| `functions/_shared.js` — `sendEmail`, `sendEmailBatch`, `RESEND_BASE` override | **REUSE AS IS** | Resend is language-agnostic. |
| `functions/_shared.js` — `purchaseEmailHtml`, `markOrderPaid` | **REUSE WITH CHANGES** | Template is `dir="rtl"` Hebrew → `dir="ltr"` pt-BR. `markOrderPaid` logic (idempotent transition guard, `MAX(paid_until)`) ports verbatim; only the mail body changes. `toLocaleDateString('he-IL', {timeZone:'Asia/Jerusalem'})` → `('pt-BR', {timeZone:'America/Sao_Paulo'})`. |
| `functions/_middleware.js` | **REUSE WITH CHANGES** | `normalizePath()` verbatim. `GATED_HTML` becomes the alphabet-module denylist. Redirect target changes. **Recommend inverting to an allowlist** — see Risk G5. |
| `functions/api/auth/login|logout|me` | **REUSE WITH CHANGES** | Logic verbatim; 5 Hebrew strings → pt-BR. `login` refuses accounts with no `paid_until`, which is wrong for a fork with a free tier and manual grants — needs a `requiresPayment` branch. |
| `functions/api/auth/reset-request` / `reset-complete` | **REUSE WITH CHANGES** | Token-hash-at-rest, single-use burn-before-use, `session_version` bump — all excellent, port verbatim. Strings + mail body → pt-BR. |
| `functions/api/progress.js` | **REUSE AS IS** | 3 strings. The progress blob is schema-free JSON. |
| `functions/api/subscribe.js` / `unsubscribe.js` | **REUSE WITH CHANGES** | Fail-open and the POST-only reasoning are correct and worth keeping. Strings → pt-BR. |
| `functions/api/admin/send-update.js` | **REUSE WITH CHANGES** | Auth, dry-run default, duplicate guard, per-recipient unsub + RFC 8058 all port verbatim. `letter()` becomes LTR pt-BR. |
| `functions/api/pay/create.js` | **REBUILD** | Fused signup + pricing + HYP call. Split into `POST /api/auth/register` and `POST /api/checkout` behind the provider interface. |
| `functions/api/pay/callback.js` | **REBUILD** | 161 lines whose entire structure (record raw → server-side VERIFY → cross-check → move) exists because HYP has no signed webhook. Becomes `provider.handleWebhook()`. The *discipline* — never trust redirect params, idempotency via a UNIQUE event id, "unknown ≠ declined" — must be carried over. |
| `functions/api/pay/verify.js` | **REUSE WITH CHANGES** | Already provider-independent (reads our own order row only). Keep as the poll endpoint. |
| `functions/api/pay/discount.js` | **REUSE AS IS** | 2 strings. |
| `functions/_hyp.js` | **DISCARD** | Israeli-only provider, credentials-in-querystring API, ILS `Coin: 1`, `PageLang: 'HEB'`, `Tash` installments. Nothing survives. |
| `functions/reconcile.js` | **DISCARD (as written)** | Exists solely because HYP cannot push. `manual.js` needs no reconciler; `external.js` with a real webhook needs at most a much smaller "pending > N hours" sweep. Keep the `expired_pending` idea, drop the retry-VERIFY half. |
| `schema.sql` — `accounts`, `progress`, `reset_tokens`, `access_log`, `auth_throttle`, `subscribers`, `campaigns` | **REUSE AS IS** | — |
| `schema.sql` — `orders` | **REUSE WITH CHANGES** | Drop `page_request_uid` (dead PayPlus), drop `installments` (brief says no installment logic), `currency DEFAULT 'BRL'`, `provider DEFAULT 'manual'`, `amount` → **integer cents** not whole units (BRL needs centavos; ILS whole-shekel was an HYP artifact). |
| `schema.sql` — `payment_events` | **REUSE WITH CHANGES** | Keep exactly — `event_id TEXT UNIQUE` is the idempotency key any webhook needs. |
| `scripts/e2e.mjs` | **REUSE WITH CHANGES** | The harness (boot `wrangler dev` + local D1 from `schema.sql`, mock provider on a second port, 134 assertions, exit non-zero) is the most valuable non-obvious asset here. Mock HYP → mock external provider. Gate/auth/session/throttle/progress/list tests port nearly verbatim. |
| `scripts/check-config.mjs` | **REUSE WITH CHANGES** | The "every var name lives in exactly one place" guard is real value. `EXPECT` table changes. |
| `scripts/build-seo.mjs` + `check-seo.mjs` | **REUSE WITH CHANGES** | Deriving robots/sitemap from the gate denylist is a genuinely good idea. Hebrew descriptions → pt-BR; `hreflang`/`lang` change. |
| `scripts/build-free-workbook.mjs` | **REUSE WITH CHANGES** | Trivial; `FREE_SET_IDS` changes. |
| `scripts/check-exercises.mjs` | **REUSE WITH CHANGES** | Structural validation per item type. `words()` splitting and Spanish-specific assertions need re-checking for Hebrew. |
| `scripts/check-workbook-solvable.mjs` | **REUSE WITH CHANGES** | The concept (drive the real UI, demand full marks) is the only check that catches engine bugs. Selectors and typed answers change. |
| `scripts/check-accessibility.mjs` | **REUSE WITH CHANGES** | Playwright harness ports; the Israeli-law framing and Hebrew control labels do not. Brazil's equivalent is **LBI 13.146/2015 + eMAG / WCAG 2.1 AA** — different statement page, same mechanics. |
| `scripts/check-refs.mjs` | **REUSE WITH CHANGES** | Generic link/anchor/answer-key checker. |
| `scripts/grant-access.mjs` | **REUSE WITH CHANGES** | Becomes the backbone of `payments/manual.js`. Should call the API instead of printing SQL, once a register endpoint exists. |
| `scripts/revoke-access.mjs` | **REUSE AS IS** (logic) | The two-step refund discipline is mandatory whatever the provider. |
| `scripts/setup-cloudflare.mjs` | **REBUILD** | Hebrew prompts, `sbk-course` DB name, PayPlus secret prompts. |
| `public/support.js` (dc-runtime) | **DECISION NEEDED — see Risk G1** | 1,768 generated lines, source not in repo, and it is what makes every `.dc.html` page work. |
| `public/doc-page.js` | **REUSE AS IS** | Print component, direction-agnostic (uses `text-align: left` only inside its own `.frame` table reset). |
| `public/image-slot.js` | **REUSE AS IS** | 2 incidental Hebrew strings. Not needed for the alphabet module; copy only if plates are wanted later. |
| `public/accessibility.js` | **REUSE WITH CHANGES** | Mechanism (classes on `<html>`, `zoom`, print-off, custom event) ports. All 24 labels → pt-BR; panel/skip-link corner flips; `direction:rtl` on the widget → `ltr`. |
| `public/spanish-audio.js` | **REUSE WITH CHANGES** | See §E.1 — the element-discovery selector is the single most direction-coupled line in the codebase. |
| `public/Workbook.dc.html` engine | **REUSE WITH CHANGES** | All 12 item types, shuffle-once-at-load, progress, mixes, `locate()` remap, retry-wrong port. Answer normalisation and every `dir="ltr"` flip. See §E.2. |
| `public/student-area.js` | **REUSE WITH CHANGES** | Already uses logical properties (`inset-inline-start`) — flips correctly for free. Only `a.dir='rtl'` (line 64) and 3 strings change. |
| `public/checklist.js` | **REUSE WITH CHANGES** | Already logical (`margin-inline-start`). |
| `public/updates-signup.js` | **REUSE WITH CHANGES** | 14 strings; `direction:ltr;text-align:left` on the email input (line 59) becomes the default rather than an override. |
| `public/payments.js` | **REBUILD** | Replaced by `lib/payments/provider.js`. Its multi-provider shape (`PROVIDERS`, `ready()`, `create()`, `readReturn()`, `verify()`) is a decent blueprint for the new interface. |
| `public/Site.dc.html` | **REBUILD** | 1,992 lines. The SPA skeleton (hash routing, `fetchMe`, `login`, `logout`, `applyCoupon`, `resetRequest/Complete`, `pollVerify`) is worth reading as a reference; the sales copy, pricing, JSON-LD and checkout are not portable. |
| `public/workbook-data.js`, `unit-*.dc.html`, `11-appendix`, `12-final-exam`, `00-cover-front`, `audio-manifest.js` | **DISCARD** | Spanish course content. |
| `public/privacy.html`, `terms.html`, `refunds.html`, `accessibility.html`, `unsubscribe.html` | **DISCARD** | Israeli consumer law (חוק הגנת הצרכן), Israeli accessibility regulations, HYP named as processor, ILS pricing. Brazil needs LGPD + CDC equivalents, written fresh. |
| `public/img/*`, `instructor*.jpg`, `og-image.jpg` | **DISCARD** | — |
| `public/vendor/react*`, `babel-standalone` | **REUSE AS IS** | — |
| `public/vendor/fonts/*` | **REUSE AS IS — and this is a significant find** | See §G.4. |
| `public/_headers` | **REUSE AS IS** | The CSP is real and restrictive. `'unsafe-eval'` is required by Babel-standalone; drops out if dc-runtime goes. |
| `.github/workflows/*` | **REUSE WITH CHANGES** | DB name, default origin. |
| `internal/` | **DO NOT COPY** | — |

---

## C. Hardcoded Hebrew UI strings

Scope: **every Hebrew string in the layer being forked** (server handlers, client engine
modules, workbook engine template), listed with file and line. Course-content files are
excluded because they are DISCARD in full — their volume is given at the end for
completeness.

### C.1 `functions/` — server responses and email (61 strings)

| File:line | String |
|---|---|
| `functions/_shared.js:90` | `` `סיסמה של ${PASSWORD_MIN} תווים לפחות.` `` |
| `functions/_shared.js:91` | `'סיסמה שהיא רק ספרות קלה מדי לניחוש — הוסיפו אותיות.'` |
| `functions/_shared.js:92` | `'סיסמה של תו אחד חוזר קלה מדי לניחוש.'` |
| `functions/_shared.js:94` | `'הסיסמה הזאת נפוצה מדי — בחרו אחרת.'` |
| `functions/_shared.js:404` | `'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.'` |
| `functions/_shared.js:522` | `הגישה לקורס נפתחה 🎉` (purchase email `<h2>`) |
| `functions/_shared.js:523` | `שלום ${name},` |
| `functions/_shared.js:524` | `התשלום עבור … אושר.` + product name `ספרדית בלי כאב ראש · הקורס המלא A1` |
| `functions/_shared.js:525` | `מספר הזמנה:` |
| `functions/_shared.js:526` | `נכנסים מכל מכשיר עם האימייל והסיסמה שבחרתם ברכישה:` |
| `functions/_shared.js:528` | `כניסה לקורס` (CTA button) |
| `functions/_shared.js:529` | `הגישה בתוקף עד ${until}. אם לא ביצעתם את הרכישה — השיבו למייל הזה.` |
| `functions/_shared.js:570` | `'הגישה לקורס נפתחה · ספרדית בלי כאב ראש'` (subject) |
| `functions/api/auth/login.js:9` | `'בקשה לא תקינה.'` |
| `functions/api/auth/login.js:12` | `'צריך אימייל וסיסמה.'` |
| `functions/api/auth/login.js:28` | `'האימייל או הסיסמה לא נכונים.'` |
| `functions/api/auth/login.js:31` | `'הרכישה עוד לא הושלמה עבור החשבון הזה.'` |
| `functions/api/auth/login.js:34` | `'תוקף הגישה לקורס הסתיים. לחידוש הגישה אפשר לרכוש שוב.'` |
| `functions/api/auth/reset-complete.js:12` | `'בקשה לא תקינה.'` |
| `functions/api/auth/reset-complete.js:15` | `'חסר טוקן איפוס.'` |
| `functions/api/auth/reset-complete.js:22` | `'הקישור כבר לא בתוקף — בקשו קישור איפוס חדש.'` |
| `functions/api/auth/reset-complete.js:30` | same string, second call site |
| `functions/api/auth/reset-request.js:11` | `'בקשה לא תקינה.'` |
| `functions/api/auth/reset-request.js:13` | `'חסר אימייל.'` |
| `functions/api/auth/reset-request.js:41` | `'איפוס סיסמה · ספרדית בלי כאב ראש'` (subject) |
| `functions/api/auth/reset-request.js:43` | `איפוס סיסמה` |
| `functions/api/auth/reset-request.js:44` | `שלום ${name},` |
| `functions/api/auth/reset-request.js:45` | `התקבלה בקשה לאיפוס הסיסמה לחשבון הזה. הקישור תקף לשעה אחת:` |
| `functions/api/auth/reset-request.js:47` | `בחירת סיסמה חדשה` |
| `functions/api/auth/reset-request.js:48` | `אם לא ביקשתם איפוס — התעלמו מהמייל הזה; הסיסמה לא שונתה.` |
| `functions/api/pay/create.js:26` | `AMBIGUOUS = 'האימייל הזה כבר רשום. התחברו עם הסיסמה הקיימת, או השתמשו בכתובת אחרת.'` |
| `functions/api/pay/create.js:34` | `'בקשה לא תקינה.'` |
| `functions/api/pay/create.js:41` | `'האימייל לא נראה תקין.'` |
| `functions/api/pay/create.js:42` | `'צריך שם מלא.'` |
| `functions/api/pay/create.js:51` | `'הסליקה עוד לא הוגדרה בצד השרת (מפתחות HYP חסרים).'` |
| `functions/api/pay/create.js:62` | `'קוד ההנחה כבר לא בתוקף. הסירו אותו או הזינו קוד אחר.'` |
| `functions/api/pay/create.js:102` | `'לא הצלחנו לפתוח את החשבון. לא בוצע חיוב — נסו שוב בעוד רגע…'` |
| `functions/api/pay/create.js:121` | `'לחשבון הזה כבר יש גישה מלאה לקורס — אין צורך לרכוש שוב.'` |
| `functions/api/pay/create.js:144` | product: `'ספרדית בלי כאב ראש · הקורס המלא A1'` |
| `functions/api/pay/create.js:153` | `'פתיחת דף התשלום נכשלה: '` |
| `functions/api/pay/create.js:166` | `'שמירת ההזמנה נכשלה. נסו שוב.'` |
| `functions/api/pay/discount.js:20` | `'בקשה לא תקינה.'` |
| `functions/api/pay/discount.js:26` | `'קוד ההנחה לא מוכר או שפג תוקפו.'` |
| `functions/api/pay/verify.js:25` | `'בקשה לא תקינה.'` |
| `functions/api/pay/verify.js:27` | `'חסר מזהה הזמנה.'` |
| `functions/api/pay/verify.js:37` | `'הזמנה לא נמצאה.'` |
| `functions/api/pay/verify.js:67` | `'התשלום לא אושר. לא בוצע חיוב — אפשר לנסות שוב.'` |
| `functions/api/progress.js:23` | `'בקשה לא תקינה.'` |
| `functions/api/progress.js:25` | `'אין נתונים.'` |
| `functions/api/progress.js:26` | `'הנתונים גדולים מדי.'` |
| `functions/api/subscribe.js:29` | `'בקשה לא תקינה.'` |
| `functions/api/subscribe.js:33` | `'כתובת האימייל לא נראית תקינה.'` |
| `functions/api/unsubscribe.js:47` | `'הקישור אינו תקין או שהועתק חלקית.'` |
| `functions/api/admin/send-update.js:39` | `ספרדית בלי כאב ראש` (letter masthead) |
| `functions/api/admin/send-update.js:43` | `לדף הקורס` |
| `functions/api/admin/send-update.js:45` | `קיבלתם את המייל הזה כי נרשמתם לעדכונים בטופס שבסוף יחידה 1 באתר הקורס.` |
| `functions/api/admin/send-update.js:46` | `לא רוצים לקבל עוד?` / `הסרה מרשימת העדכונים` |
| `functions/reconcile.js:126` | `` `${n} הזמנות ללא אישור · ספרדית בלי כאב ראש` `` |
| `functions/reconcile.js:128-130` | owner-notice body (3 lines) |

Note: `'בקשה לא תקינה.'` ("malformed request") appears **7 times** verbatim across handlers.
In the fork it should be one shared constant.

### C.2 `public/` client engine modules (49 strings)

| File:line | String |
|---|---|
| `public/accessibility.js:259-266` | Toggle labels: `הדגשת קישורים`, `גופן קריא`, `ריווח שורות ואותיות`, `הדגשת מיקוד מקלדת`, `סמן עכבר גדול`, `עצירת אנימציות`, `סרגל קריאה`, `הצגת תמלילים בתרגילי האזנה` |
| `public/accessibility.js:270-273` | Contrast labels: `ניגודיות כהה`, `ניגודיות בהירה`, `היפוך צבעים`, `גווני אפור` |
| `public/accessibility.js:295` | `גודל התוכן` |
| `public/accessibility.js:297` | aria-label `הקטנת גודל התוכן` |
| `public/accessibility.js:299` | aria-label `הגדלת גודל התוכן` |
| `public/accessibility.js:305` | `צבע וניגודיות` |
| `public/accessibility.js:308` | `טקסט וניווט` |
| `public/accessibility.js:311` | `איפוס כל ההתאמות` |
| `public/accessibility.js:345` | `הצהרת הנגישות של האתר` |
| `public/accessibility.js:347` | `פתיחה וסגירה מהמקלדת: ` |
| `public/accessibility.js:353` | `. מעבר בין הפקדים ב־Tab, הפעלה ב־Enter, יציאה ב־Esc.` |
| `public/accessibility.js:355` | `ההתאמות נשמרות בדפדפן הזה וחלות על כל עמודי הקורס.` |
| `public/accessibility.js:413` | skip link `דלג לתוכן הראשי` |
| `public/accessibility.js:433` | aria-label + title `תפריט נגישות` / `תפריט נגישות (Alt+Shift+A)` |
| `public/accessibility.js:446` | `הגדרות נגישות` |
| `public/accessibility.js:447` | aria-label `סגירת תפריט הנגישות` |
| `public/accessibility.js:452` | `ההתאמות חלות מיד ונשמרות לביקורים הבאים. אפשר לבחור כמה מהן יחד.` |
| `public/checklist.js:141` | title prefix `'סימון: '` |
| `public/image-slot.js:511` | `או <u>בחרו קובץ</u>` |
| `public/spanish-audio.js:140` | title `לחצו כדי לשמוע · לחיצה נוספת עוצרת` |
| `public/student-area.js:62` | aria-label `מעבר לאזור האישי` |
| `public/student-area.js:63` | title `האזור האישי` |
| `public/student-area.js:72` | label `האזור האישי` |
| `public/updates-signup.js:94,163` | `אתם ברשימה` |
| `public/updates-signup.js:95,164` | `תודה. כשיתווסף תוכן חדש - תדעו.` |
| `public/updates-signup.js:101` | `רוצים לשמוע כשנוסף תוכן חדש?` |
| `public/updates-signup.js:105-106` | `סיימתם את יחידה 1. מדי פעם אני שולח תרגולים…` |
| `public/updates-signup.js:117` | aria-label `האימייל שלכם` |
| `public/updates-signup.js:121,151` | `לקבל עדכונים` |
| `public/updates-signup.js:136-138` | `אפשר להסיר את עצמכם בכל רגע…` / `זה לא תנאי לשום דבר` / `מדיניות הפרטיות` |
| `public/updates-signup.js:144` | `לתרגל את יחידה 1 עכשיו →` |
| `public/updates-signup.js:158` | `כתובת האימייל לא נראית תקינה.` |
| `public/updates-signup.js:160` | `רק רגע…` |
| `public/payments.js:45` | productName `ספרדית בלי כאב ראש · הקורס המלא A1` |
| `public/payments.js:63,66` | provider labels `Grow · מיטב`, `Hyp · יעד שריג` |
| `public/payments.js:139` | `ספק סליקה לא מוכר ב־payments.js: "…"` |
| `public/payments.js:141` | `… מחייב יצירת תשלום בצד שרת — הגדירו endpoint.` |
| `public/payments.js:143` | `חסרים מזהי הספק ב־payments.js (…)` |
| `public/payments.js:169` | `השרת לא החזיר כתובת תשלום.` |

### C.3 `public/Workbook.dc.html` — the exercise engine (66 lines, ~60 strings)

Template (markup) strings:

| Line | String |
|---|---|
| 5 | `<title>חוברת תרגול · ספרדית בלי כאב ראש</title>` |
| 7 | meta description |
| 34 | `חוברת תרגול` (eyebrow) |
| 35 | `ספרדית בלי כאב ראש` (h1) |
| 38 | `← לספר הלימוד` |
| 39 | `האזור האישי` |
| 49 | `ההתקדמות שלי` |
| 50 | `{{ progDone }} פרקים` |
| 51 | `ממוצע {{ progAvg }}` |
| 52 | `{{ progWrong }} שאלות לתיקון` |
| 53 | `רצף {{ progDays }} ימים` |
| 54 | `איפוס התקדמות` |
| 64 | `תרגול מעורב · 15 שאלות` |
| 68 | `מושך שאלות מכל הפרקים שלמדתם` |
| 73 | `פרקי הספר · 30` |
| 81 | `פרקים מעשיים · 6` |
| 89 | `הבנת הנקרא · טקסט לכל יחידה` |
| 123 | `הטקסט · אפשר לחזור אליו בכל שלב` |
| 155 | `▶ השמעה` |
| 184, 199, 212, 226, 251, 269 | `בדיקה` (Check button, ×6) |
| 238 | `לחצו על מילה בספרדית, ואז על התרגום שלה…` |
| 255 | `לחצו על מילה, ואז על הקבוצה שאליה היא שייכת.` |
| 293 | `סיימתם את התרגול` |
| 297 | `השיא שלכם בסבב הזה:` |
| 302 | `רק מה שטעיתי ({{ missedCount }})` |
| 310 | `איך לעבוד עם החוברת` |
| 311 | `קראו קודם את הפרק בספר…` |
| 312 | `בכתיבה אפשר לוותר על אקצנטים…` — **Spanish-specific, becomes a nikud note** |

Logic-class strings:

| Line | String |
|---|---|
| 435-436 | mix set titles `תיקון טעויות` / `תרגול מעורב`, subtitles |
| 660-671 | **The `CH` item-type table** — 12 × `[label, bg, fg, hint, icon]`: `בחירה`/`בחרו את התשובה הנכונה`, `כתיבה`/`כתבו בספרדית`, `בניית משפט`/`לחצו על המילים לפי הסדר`, `האזנה`/`הקשיבו - הטקסט מוסתר`, `התאמה`/`חברו בין הזוגות`, `מיון`/`שבצו כל מילה בקבוצה`, `הבנת הנקרא`/`קראו את הטקסט וענו`, `מי לא שייך`/`בחרו את המילה החורגת`, `שיחה`/`מה עונים בשלב הזה?`, `גזירה`/`חמש הצורות - בלי vosotros`, `השלמת טקסט`/`מחסן המילים למטה`, `תיקון טעות`/`טעות אחת במשפט` |
| 748 | `תמליל` (transcript heading) |
| 811 | chip labels `'יחידה ' + u` / `'פרק ' + n` |
| 838 | `' מתוך '` |
| 848 | `'תיקון טעויות · '` |
| 851 | `עוד סבב תיקונים` / `15 שאלות נוספות` / `לתרגל שוב` |
| 855 | `ממשיכים מאיפה שעצרתם` |
| 858 | `בחרו פרק · 30 פרקים · 6 מעשיים · 9 קריאה` / `בחרו פרק` |
| 859 | `סגירה` / `החלפת פרק` |
| 863 | `' · חזרה על הטעויות'` |
| 864 | `הסתיים` |
| 939 | `'רצף ' + n + ' · מרשים'` / `'רצף ' + n` |
| 948-949 | `רצף של n - יפה מאוד` / `נכון · רצף n` / `נכון שוב` / `נכון` / `התשובה הנכונה` |
| 959 | `לסיכום` / `הבא` |
| 961-963 | Three verdict bands |
| 967 | `'רצף של ' + best + ' ברצף'` |

Also `public/workbook-data.js:18-23` — the item-authoring helpers embed Hebrew prompts
(`X()` → `איזו מילה לא שייכת לקבוצה?`, `G()` → `השלימו את חמש הצורות של …`,
`Z()` → `השלימו את הטקסט…`, `K()` → `יש כאן טעות אחת…`). These are *engine* strings living
in a *data* file — a design flaw to fix in the fork by moving them into the engine's
string table.

### C.4 Scripts and config (not user-facing, but Hebrew)

`scripts/setup-cloudflare.mjs` (33 lines of Hebrew CLI prompts), `scripts/check-config.mjs`
(24), `scripts/check-refs.mjs` (33), `scripts/e2e.mjs` (61, mostly Hebrew fixture data and
expected error strings), `scripts/build-seo.mjs` (45, page descriptions),
`scripts/check-accessibility.mjs` (37), `scripts/check-exercises.mjs` (23),
`scripts/check-seo.mjs` (10), `scripts/check-workbook-solvable.mjs` (15),
`scripts/grant-access.mjs` (6), `scripts/revoke-access.mjs` (7),
`.github/workflows/send-update.yml` (9), `wrangler.toml` (7 comment lines),
`migrations/*.sql` (10).

### C.5 Content files — excluded from the port (counts only)

`11-appendix.dc.html` 1507 · `workbook-data.js` 890 · `unit-09` 580 · `unit-05` 569 ·
`unit-08` 550 · `unit-02` 513 · `Site.dc.html` 457 · `unit-01` 437 · `12-final-exam` 420 ·
`unit-04` 356 · `unit-06` 346 · `unit-03` 311 · `unit-07` 307 · `unit-10` 281 ·
`00-cover-front` 156 · `accessibility.html` 61 · `privacy.html` 42 · `terms.html` 37 ·
`refunds.html` 33 · `unsubscribe.html` 33. **≈ 8,000 Hebrew-bearing lines, all DISCARD.**

---

## D. Every place that sets direction

### D.1 Whole-repo counts (the size of the problem)

| Signal | Total occurrences | In files being forked |
|---|---|---|
| `dir="rtl"` / `dir="ltr"` attributes | 5,363 | 26 |
| `text-align: left\|right` | 1,773 | 20 |
| `padding-left\|right` | 385 | 3 |
| `left:` / `right:` positioning | 73 | 30 |
| `direction: rtl\|ltr` | 41 | 14 |
| `flex-start/end/left/right` alignment | 47 | 3 |
| `margin-left\|right` | 34 | 2 |
| `border-left\|right*` | 23 | 2 |
| `lang="…"` attributes | 115 | 5 |
| Logical properties already in use | 15 | 15 |
| `unicode-bidi` | **0** | **0** |
| `float: left\|right` | **0** | **0** |

Two things stand out. **`unicode-bidi` is never used anywhere** — the codebase relies
entirely on `dir` attributes plus the browser's implicit bidi algorithm for mixed content.
That is exactly the "never rely on the browser guessing" failure mode the brief names, and
it is why STEP 3.2's `.he { unicode-bidi: isolate }` utility is the right call. And
**`float` is never used**, so the layout is flexbox/grid throughout — which flips far more
cleanly than a float-based one would.

### D.2 Line-level — files being forked

**`public/Workbook.dc.html`** (the engine; 33 real hits, excluding `state.right` false positives):

| Line | What it sets |
|---|---|
| 2 | `<html lang="he" dir="rtl">` — **root document** |
| 27 | page wrapper `dir="rtl" lang="he" … text-align:right` |
| 30 | decorative blob `left:-40px` |
| 54 | `margin-right:auto` (push reset button to the trailing edge) |
| 59 | `text-align:right` on the picker toggle |
| 122 | `border-right:4px solid #B5502F` — the passage card's accent rule |
| 126, 128 | reading passage paragraph: `dir="ltr"`, `direction:ltr`, `text-align:left` |
| 135 | glossary Spanish term `dir="ltr"` |
| 149 | `margin-right:auto` on the mix-source chip |
| 165 | dialogue line `dir="ltr" direction:ltr text-align:left` |
| 183 | **typed-answer `<input dir="ltr" … direction:ltr;text-align:left>`** |
| 189, 194 | word-bank tray + built tray `dir="ltr"` |
| 206, 207 | conjugation grid pronoun + **`<input dir="ltr">`** |
| 216, 221 | cloze sentence + bank `dir="ltr" direction:ltr text-align:left` |
| 230 | find-the-error token row `dir="ltr"` |
| 256 | sort word tray `dir="ltr"` |
| 264, 265 | sort bucket: name `text-align:right`, contents `dir="ltr" text-align:left` |
| 278 | correct-answer readout `dir="ltr" text-align:left` |
| 291 | decorative blob `left:-30px` |
| 674 | `btn()` helper — every choice button starts `text-align:right` |
| 724 | grid input CSS `direction:ltr;text-align:left` |
| 750 | transcript `dir: 'ltr'` (React prop) |
| 813 | chapter-chip score mark `direction:ltr` |
| 893 | match left column `text-align:left;direction:ltr` |
| 906 | match right column `text-align:right;direction:rtl` |
| 920 | sort word `direction:ltr` |
| 928 | sort bucket `text-align:right` |

**Every one of these inverts.** The pattern is mechanical: today `dir="ltr"` marks *target
language*, and the page default is RTL. Tomorrow the page default is LTR and `dir="rtl"`
(via the `.he` class) marks target language. Do not do this with sed — the *decorative*
`left:` values (30, 291) and the *structural* `margin-right:auto` (54, 149) flip for
different reasons than the text ones.

**`public/accessibility.js`:**

| Line | What it sets |
|---|---|
| 82 | `.sbk-a11y{position:fixed;bottom:16px;left:16px;…;direction:rtl}` — widget corner + widget direction |
| 89 | `.sbk-a11y-panel{position:absolute;bottom:68px;left:0;…}` |
| 103 | toggle rows `text-align:right` |
| 121 | `.sbk-a11y-skip{position:fixed;top:-100px;right:12px;…}` — skip link corner |
| 125 | `.sbk-a11y-guide{left:0;right:0}` (full-width reading ruler — direction-neutral) |

**`public/doc-page.js`:**

| Line | What it sets |
|---|---|
| 164 | `.frame td,.frame th{ text-align:left }` — a table reset inside the print frame, **not** a content direction decision. Safe as is. |
| 208, 212 | running header/footer `left:0;right:0` — full-width, direction-neutral. |

**`public/student-area.js`:** already logical — `inset-inline-start` (27, 48),
`inset-block-end`, with a `@supports not` fallback at line 37 (`bottom:16px;left:16px`).
The only hard flip is **line 64 `a.dir = 'rtl'`**.

**`public/checklist.js`:** lines 97, 105 — `margin-inline-start`. Already correct.

**`public/updates-signup.js`:** line 53 blob `left:-44px`; **line 59** the email input's
`direction:ltr;text-align:left` (an override in an RTL page — becomes the default and can
simply be deleted in an LTR page).

**`public/spanish-audio.js`:** lines 110, 119, 124, 131 — see §E, this is discovery logic,
not styling.

**`functions/`:** `_shared.js:521` `<div dir="rtl">` (purchase email root) and `:525`
`<b dir="ltr">` (order id). `api/auth/reset-request.js:42` `<div dir="rtl">`.
`api/admin/send-update.js:38` `<div dir="rtl">`. `reconcile.js:123,127` `dir="ltr"` /
`dir="rtl"`. **Email HTML is the one place you cannot use CSS `dir` reliably** — Outlook
and several webmail clients strip or ignore `direction:` in `<style>`. Keep the explicit
`dir` attribute on the root `<div>` and on any inline Hebrew span; do not rely on the `.he`
class in email.

**`scripts/build-seo.mjs:?` and `check-accessibility.mjs:?`** each assert one `dir="rtl"`.

### D.3 Content files (DISCARD, listed so nobody tries to port them)

`11-appendix.dc.html` alone carries 1,049 `dir` attributes, 841 `text-align`, 381
`padding-left/right`. `workbook-data.js` carries 533 `dir` attributes — inline
`<span dir="ltr">` wrappers baked into item prompts by the `LTR()`, `R()`, `FE()`, `OT()`,
`G()` helpers (`workbook-data.js:14-21`). **This is the wrong architecture and must not be
reproduced:** direction markup belongs in the engine's renderer keyed off a semantic flag,
not hand-written into 830 content strings. In the fork, target-language text carries a
`.he` class applied by the renderer.

---

## E. Every place that assumes the target language is LTR

This is the section that decides whether the fork works.

### E.1 `public/spanish-audio.js` — audio element discovery (CRITICAL)

```js
line 110:  if (el.querySelector('[dir="ltr"]')) return false;
line 119:  var nodes = (root||document).querySelectorAll('[dir="ltr"],[data-clip]');
```

**`dir="ltr"` *is* the click-to-hear selector.** The entire audio layer finds its targets by
looking for LTR islands in an RTL page. In the inverted project this selector matches
*everything* (the whole page is LTR) and the MutationObserver at line 168 would wire the
entire document as clickable audio. **Must become a semantic class** (`.he`), not a
direction attribute. This is the cleanest argument for the `.he` utility in STEP 3.2: it
serves styling *and* behaviour.

Related in the same file:

- `line 113: if (!/[a-záéíóúñü¿¡]/i.test(t)) return false;` — `isSpanish()` gates on Latin
  letters. Becomes a Hebrew-block test `/[א-ת]/`.
- `line 9: var LATAM = ['es-MX','es-US','es-419',…]` and `line 85: u.lang = 'es-MX'` —
  voice selection. Becomes `he-IL` (and there is essentially only one option; see G.3).
- `line 22: .replace(/\b(DANIEL|MAYA|…|TAQUILLA)\s*·\s*/g,'')` — `clean()` strips Spanish
  speaker labels before speaking. Content-specific; rebuild for Portuguese speaker labels.
- `line 16-17: norm()` — same NFD-strip-combining-marks bug as the workbook (below);
  here it means a manifest lookup for a nikud'd phrase would miss its clip.

### E.2 `public/Workbook.dc.html` — answer normalisation (CRITICAL)

```js
line 492-495:
norm(v) {
  return String(v||'').normalize('NFD').replace(/[̀-ͯ]/g,'')
    .toLowerCase().replace(/[¿¡?!.,;:]/g,'').replace(/\s+/g,' ').trim();
}
```

I verified the behaviour rather than assuming it:

- `norm('שָׁלוֹם')` → `'שָׁלוֹם'` (length 7); `norm('שלום')` → `'שלום'` (length 4); **not equal.**
  NFD does not decompose Hebrew letters, and Hebrew points live at **U+0591–U+05C7**, wholly
  outside the `̀-ͯ` combining-diacritical block this strips. So the existing
  normaliser **silently fails to ignore nikud** — a learner typing `שלום` against a stored
  `שָׁלוֹם` is marked wrong, with no error, on every single typed item.
- The fix is one line: `.normalize('NFC').replace(/[֑-ׇ]/g,'')` when
  `strictNikud !== true`. Verified: with that strip, `'בְּרֵאשִׁית'` → `'בראשית'` and the
  two `שלום` spellings compare equal.
- **Final letters are safe.** `'ץףןםך'.normalize('NFKD') === 'ץףןםך'` — Unicode does not
  fold final forms under NFD/NFC/NFKD/NFKC, so "never strip them" requires no special code
  *provided* you do not hand-roll a folding table. (Deliberate ך→כ folding, if ever wanted
  for lenient grading, must be opt-in per item — it changes meaning in some words.)
- `.toLowerCase()` is a no-op on Hebrew but harmless; keep it for the transliteration items.
- The punctuation class `[¿¡?!.,;:]` misses Hebrew punctuation: **geresh ׳ (U+05F3),
  gershayim ״ (U+05F4), maqaf ־ (U+05BE), sof pasuq ׃ (U+05C3)**, and the
  visually-identical ASCII `'` / `"` learners will actually type. Needs extending, and
  needs to fold ASCII quote → geresh.

Other target-language-LTR assumptions in the same file:

- `line 498-506 dropPron()` — strips a leading Spanish subject pronoun
  (`yo|tu|ella|usted|nosotros|…`) from both sides so "Yo estudio" ≡ "Estudio". **Delete
  entirely.** Hebrew's analogous leniency is a different problem (optional אני/אתה with a
  conjugated verb, definite ה־ prefix, ו־ conjunction) and needs its own rule, not a rename.
- `line 531-534` word-bank build: `it.es.split(' ')` then shuffle. Splitting on space works
  for Hebrew, but the *tray renders `dir="ltr"`* (lines 189, 194) so tapped words append
  left-to-right. In Hebrew the built sentence must read right-to-left; the array order is
  the same, only the rendering flips — but it will look wrong until line 189/194 flip, and
  a reviewer will file it as an engine bug. Also: Hebrew prefixes (ב, ל, ה, ו, מ, כ, ש) are
  written attached to their word, so a word bank has *fewer, denser* tokens than Spanish —
  the difficulty curve of `o` items changes and the content design must account for it.
- `line 578 / 757` cloze: `it.tx.split('___')`. Fine mechanically. The rendered token row is
  `dir="ltr"` (line 216) and must flip; a gap in the middle of an RTL sentence with LTR
  fallback ordering is a classic bidi failure.
- `line 784 findTokens`: `it.s.split(' ')` with `it.bad` as a **positional index**. In an RTL
  rendering, index 3 is the 4th word from the *right*. The data and the render must agree —
  today `dir="ltr"` on line 230 makes them agree by accident.
- `line 574-581 answerOf()`: `it.rows.map(r => r[0]+' → '+r[1])` and
  `w[0]+' → '+it.b[w[1]]` — a bare `→` (U+2192) between two RTL strings is a neutral
  character and the bidi algorithm will place it on the wrong side. Use `←` under RTL, or
  wrap each side in an isolate.
- `line 687: const latin = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ¿¡]/.test(...)` — the **per-option
  direction sniffer** in the choice renderer (lines 696-703). It decides per option whether
  to render `dir="ltr"` + serif or `dir="rtl"` + sans. This is exactly "rely on the browser
  guessing", one level up. In the fork it must be replaced by an explicit flag on the item
  (or the `.he` class), because Hebrew options will routinely contain Latin
  transliterations and Portuguese glosses, and a character-class sniff cannot tell a Hebrew
  answer containing "shalom" from a Portuguese answer containing "שלום".
- `line 660-671 CH` table: the `g` (conjugate) hint literally says `חמש הצורות - בלי
  vosotros`. Hebrew conjugation has a completely different shape (gender × number ×
  person, 10+ forms in past/future, 4 in present). **The `g` item type needs redesigning,
  not translating** — a 5-row grid is the wrong widget.
- `line 183` typed input: `dir="ltr"` hard-coded. Per STEP 3.5 this becomes `dir="rtl"` on
  the input element itself. Note the placeholder `escribe aquí…` is Spanish, not Hebrew,
  and there is no `lang` attribute on the input — add `lang="he"` so spellcheck and IME
  behave.

### E.3 Progress / storage

`localStorage` key `sbkr-workbook-progress-v1` and the server blob in `progress.data` are
opaque JSON — **no direction coupling**. Reuse as is (new key name).

### E.4 Accessibility layer

`public/accessibility.js` drives everything through classes on `<html>` and a `zoom` on the
content element — mechanism is direction-agnostic. But `check-accessibility.mjs` asserts
`dir="rtl"`, the reading guide and skip link are corner-anchored (§D.2), and the
`transcripts` toggle exists because listening items hide their target text. All of that
ports; the *legal framing* does not (Israeli תקנה 35 / ת"י 5568 → Brazilian LBI 13.146/2015,
eMAG, WCAG 2.1 AA).

### E.5 What is genuinely direction-free (good news)

`functions/*` request handling, PBKDF2/HMAC, throttle, D1 schema, `doc-page.js`,
`image-slot.js`, `checklist.js`, the React/Babel vendor bundle, `_headers`, the CI
workflows, `e2e.mjs`'s harness. Roughly **60% of the engine by line count moves without a
direction decision.**

---

## F. Payment coupling — every file

| File | Coupling | Disposition |
|---|---|---|
| `functions/_hyp.js` (163) | Entire file. `DEFAULT_BASE='https://icom.yaad.net/p/'`, `RESERVED` credential names, `hypCreatePaymentUrl` with `Coin: 1` (ILS), `PageLang: 'HEB'`, `Tash`/`FixTash` installments, `hypVerify`, `RETURN_FIELDS` (24 HYP field names), `hypApproved` (`CCode === '0'`) | **DELETE** |
| `functions/api/pay/create.js` (175) | Imports `hypConfigured`/`hypCreatePaymentUrl`; `PRICE_ILS` (:54); `MAX_INSTALLMENTS` (:65); `env.CURRENCY \|\| 'ILS'` (:143); `provider='hyp'` literal in the INSERT (:160); Hebrew HYP error (:51) | **REBUILD** as register + checkout |
| `functions/api/pay/callback.js` (161) | Whole file is the HYP redirect leg: `readReturnParams`, `hypVerify`, `hypApproved`, `params.Order`/`params.Id`, `payment_events` | **REBUILD** as `handleWebhook()` |
| `functions/api/pay/verify.js` (80) | Provider-neutral already — reads the order row only | **KEEP** |
| `functions/api/pay/discount.js` (31) | Neutral (delegates to `discountFor`) | **KEEP** |
| `functions/reconcile.js` (144) | Imports `hypConfigured/hypVerify/hypApproved`; the whole "retry VERIFY" half exists only for HYP; owner email is Hebrew and prints `₪` (:123) | **DELETE the retry half; keep a thin expiry sweep** |
| `functions/_shared.js` | `:39` order-id comment (HYP `Order` field splitting); `:214` SameSite reasoning re HYP redirect; **`:429` `parseInt(env.PRICE_ILS \|\| '249')` inside `discountFor`** — the one real coupling; `:520` `toLocaleDateString('he-IL', {timeZone:'Asia/Jerusalem'})`; `:541` `source='callback'` | **3 small edits** |
| `src/worker.js` | `:28` `'GET /api/pay/callback'` (a GET because HYP redirects); `:70-75` `scheduled()` → reconciler | **REBUILD routes** |
| `public/payments.js` (199) | `CONFIG.provider='hyp'`, `currency:'ILS'`, `PROVIDERS` table of 5 Israeli providers, `BUILD.tranzila` / `BUILD.grow` URL builders, `readReturn()` parsing 5 providers' status codes | **REPLACE** with `lib/payments/provider.js` |
| `public/Site.dc.html` | `:43` JSON-LD `"priceCurrency":"ILS"`; `:1070` `data-props` carrying `priceNow`/`priceFull` defaults; `:1119` HYP-callback polling comment; `:1238-1241` `price()`, `full()`, **`ils(n){ return '₪' + …toLocaleString('en-US') }`**; `:1292 pay()`; `:1382 applyCoupon()`; installment UI | **REBUILD** |
| `schema.sql` | `:20` `amount` "whole shekels, the unit HYP charges in"; `:21` `currency DEFAULT 'ILS'`; `:22` `installments`; `:25` `provider DEFAULT 'hyp'`; `:26` `page_request_uid` (dead PayPlus); `:27` `transaction_uid` (HYP `Id`); `:52-63` `payment_events` (provider `'hyp'` default) | **EDIT** — and change `amount` to cents |
| `migrations/0003-hyp.sql` (60) | The PayPlus→HYP migration itself | **DO NOT COPY** |
| `wrangler.toml` | `:22-26` cron for HYP reconciliation; `:41-43` HYP demo/prod note; `:45 PRICE_ILS=249`; `:46 MAX_INSTALLMENTS=2`; `:48 CURRENCY=ILS`; `:60 HYP_API_BASE` | **REWRITE** — `PRICE`/`CURRENCY=BRL`/`LOCALE=pt-BR`, no installments, no cron (or a much longer one) |
| `.env.example` | `:13-15` `HYP_MASOF`/`HYP_API_KEY`/`HYP_PASSP` (with live demo credentials in the file); `:21` `HYP_API_BASE`; `:24-27` `PRICE_ILS`/`MAX_INSTALLMENTS`/`CURRENCY` | **REWRITE** |
| `scripts/check-config.mjs` | `:84 EXPECT = { PRICE_ILS:'249', MAX_INSTALLMENTS:'3', ACCESS_MONTHS:'12', CURRENCY:'ILS' }`; `:92-97` HYP demo/prod caveat | **EDIT** |
| `scripts/check-seo.mjs` | `:135-141` asserts JSON-LD price === `priceNow` prop default | **KEEP the idea, change the fields** |
| `scripts/e2e.mjs` (780) | `:20-23 HYP_SECRET`; `:31` HYP signature helper; `:35-200` the entire **mock HYP terminal**; purchase/declined/reconciler suites | **REBUILD the mock; keep the harness** |
| `scripts/revoke-access.mjs` | `:2,10,86` HYP portal references | **EDIT strings only** |
| `scripts/setup-cloudflare.mjs` | `:67,78-80` PayPlus secret prompts | **REBUILD** |
| `public/privacy.html:38,55`, `terms.html:43,50`, `refunds.html:34,49`, `accessibility.html:88` | HYP named as data processor / payment page operator; ILS pricing; Israeli consumer law | **DISCARD — new legal pages for Brazil (LGPD + CDC)** |
| `.github/workflows/send-update.yml:?` | default origin only | **EDIT** |

**Installments.** `MAX_INSTALLMENTS` exists in `wrangler.toml` (2), `.env.example` (3) and
`check-config.mjs` (3) — **they disagree**, and `check-config` would currently fail on this
file. Worth noting as evidence that the config guard is not being run, and a reason to keep
it (fixed) in the fork. Per the brief, no installment logic ships in the new code —
`parcelamento` is near-universal in Brazil, so expect to want it later; design the provider
interface so it can be added at the provider layer, not the schema layer.

---

## G. The five things most likely to break

### G1. `public/support.js` — a 1,768-line generated engine with no source in the repo

Its own first line reads *"GENERATED from dc-runtime/src/\*.ts — do not edit. Rebuild with
`cd dc-runtime && bun run build`."* That directory does not exist here. Every `.dc.html`
page — the workbook engine, the site SPA, all the content — is a `<x-dc>` template plus a
`class Component extends DCLogic`, compiled at runtime by this file, with Babel-standalone
lazy-loaded for JSX and `'unsafe-eval'` in the CSP to permit it.

Why it breaks the fork: you cannot fix a bidi bug inside the compiler, you cannot upgrade
it, and if it has any implicit direction behaviour (it does `cssToObj`/`kebabToCamel`
translation of inline styles — I did not find direction logic, but I cannot prove absence
in a minified bundle) you have no recourse. You would also be shipping a runtime JSX
compiler to every learner for a 7-page alphabet module.

**Options:** (a) copy `support.js` verbatim and accept the black box; (b) ask the tool that
generated it for the `dc-runtime` source; (c) **rebuild the alphabet module and the
workbook engine as plain React 18 with a small build step** (esbuild), dropping Babel,
`'unsafe-eval'`, and 1,768 opaque lines. (c) costs perhaps a day and removes the largest
unknown in the project. **I recommend (c) and need your decision before STEP 2.**

### G2. Nikud comparison is silently wrong today, and "silently" is the problem

Proven above: the existing `norm()` does not strip Hebrew points, because they sit outside
the `̀-ͯ` range it strips. A naive port gives you an engine that marks correct
answers wrong on every typed item, with no exception and no log line — the same failure
class as a remap bug, which is exactly why `check-workbook-solvable.mjs` exists in the
source project. Compounding it: there are **four** places in the two candidate files that
need the same fix and today have four slightly different normalisers
(`Workbook.dc.html:492`, `spanish-audio.js:16`, plus the audio manifest key builder and
`check-exercises.mjs`'s `words()`). **Mitigation:** one shared `lib/hebrew/normalize.js`
with a table-driven test (nikud on/off, finals, geresh/gershayim, ASCII-quote folding, RTL
marks U+200E/U+200F/U+061C stripped from paste), and port
`check-workbook-solvable.mjs` on day one — it is the only check that sees engine bugs.

### G3. Hebrew browser TTS is materially worse than Spanish, and it is not a small gap

`spanish-audio.js` was written as an interim measure with a documented intention to replace
it with ~900–1,200 recorded clips. It could get away with that because `es-MX`/`es-US`
voices are excellent and ubiquitous on macOS, iOS, Windows and Android.

`he-IL` is not comparable. Coverage is thin (Carmit on Apple platforms; Chrome on desktop
Linux frequently has **no** Hebrew voice at all, in which case `speechSynthesis.speak()`
fails silently); and — the decisive point for a beginners' course — **Hebrew TTS engines
read unpointed text using their own internal disambiguation**, so a homograph is a coin
flip, and most engines **ignore nikud entirely** rather than using it as the pronunciation
hint a learner needs. An alphabet module whose whole purpose is "this letter makes this
sound" cannot be built on a voice that may mispronounce the example word and cannot be
corrected.

**You asked to be told if this affects whether you must record real audio: it does.** My
assessment is that for the alphabet module specifically, **recorded audio is not optional**
— 22 letters + 5 finals + ~27 example words ≈ **55 clips**, which is a single short studio
session or a competent home recording. The fallback architecture should be kept (it is
good, and it lets clips land in waves), but with the fallback treated as degraded mode:
detect voice availability at boot, and where no `he-IL` voice exists, hide the play button
rather than render a control that does nothing.

### G4. Font/nikud rendering — much better than expected, with one specific trap

I checked the actual font binaries rather than assuming. Both bundled faces already carry
the full pointing repertoire and the positioning tables to place it:

| Font | Codepoints mapped | Hebrew block | Nikud (U+0591–U+05C7) | GPOS features | GSUB | GDEF |
|---|---|---|---|---|---|---|
| Frank Ruhl Libre Hebrew 400/700 | 109 | 53 | **21** (U+05B0–U+05C7) | `kern`, **`mark`**, **`mkmk`** (scripts `hebr`, `latn`, `DFLT`) | **`ccmp`** | yes |
| Assistant Hebrew 400 | 92 | 49 | **20** | `kern`, **`mark`**, **`mkmk`** | *(no features)* | yes |

So STEP 3.4's "bundle a Hebrew webfont that fully supports nikud, self-hosted, no CDN" is
**already satisfied by files sitting in `public/vendor/fonts/`** under OFL, with licences
included. Copy them; no font hunt needed.

**The trap:** Assistant has **no `ccmp` in GSUB**. `ccmp` is what composes shin + shin-dot
(+ dagesh) into a correctly stacked glyph — `שׁ` in `שָׁלוֹם`, `בְּ` in `בְּרֵאשִׁית`.
Frank Ruhl Libre has it; Assistant does not. **Set `--font-he` to Frank Ruhl Libre for any
text that carries nikud** (letters, example words, tracing) and keep Assistant for
unpointed UI chrome only. Second trap, unaffected by the font: nikud descends below the
baseline, so a `line-height` tuned for Latin pt-BR text **will clip** — the letter component
needs explicit `line-height ≥ 1.6` and no `overflow:hidden` on its box. The brief's test
strings `בְּרֵאשִׁית` and `שָׁלוֹם` are the right ones; add `אֳ` (hataf-qamats) and `שּׁ`
(shin + dagesh + shin-dot) as the worst cases, at 14px and 96px.

### G5. The access gate is a denylist, and the new project's shape makes that worse

`functions/_middleware.js:36-46` lists what is *protected*; everything else is public by
default. In the source project that is survivable — the file set is frozen, and
`build-seo.mjs`/`check-seo.mjs` exist specifically to catch a new paid file leaking into the
sitemap. In a project that is about to grow 7 alphabet day-pages, then an A1 course, then
more, **a denylist means every new paid page ships unprotected until someone remembers to
add it**, and the failure is silent and public.

Related: `functions/api/auth/login.js:30-35` refuses any account without `paid_until`,
which is wrong the moment you have a free tier plus manual grants; and `orders.amount` is
whole currency units (an HYP artifact) which loses centavos in BRL. And note that the
brief's own STEP 2 instruction to keep "discount codes" carries a live hazard documented in
`wrangler.toml:50-59`: a 100% code does not grant free access, it *blocks the buyer*, and
`DISCOUNT_CODES` previously shipped a guessable `TEST50` to production.

**Mitigation:** invert to an **allowlist of free paths** (site, login, legal, day 1,
assets) with everything else gated by default; make `check-seo` assert the inversion;
add a free/paid `tier` column on content rather than hardcoding stems; keep
`revoke-access`'s two-step refund discipline from day one.

---

## Summary

- **~60% of the engine by line count is direction-free and ports cleanly** — auth, sessions,
  throttling, D1 schema, email, the test harness, the print component, the CI workflows.
- **~25% ports with mechanical but *non-sed-able* direction inversion** — the workbook
  engine, the accessibility menu, the audio layer.
- **~15% is a genuine rebuild** — the whole payment layer, account registration, the site
  SPA, all content, all legal pages.
- **Three things need your decision before I write code:** the dc-runtime question (G1),
  whether you accept that the alphabet module needs ~55 recorded clips (G3), and whether
  to invert the gate to an allowlist (G5).

Awaiting approval to begin STEP 2.
