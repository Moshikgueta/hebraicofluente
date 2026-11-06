# Growth OS Setup

1. Unzip the package **into the root of your existing Hebraico Fluente project**, preserving hidden `.claude` directory. Merge directories; do not replace an existing `CLAUDE.md` or `.claude` directory wholesale.
2. Open the project with Claude Code (from project root: `claude`).
3. Ask: `Run /growth-command-center. First audit my actual repository and available integrations. Create the first weekly growth review and Portuguese 30-day editorial plan. Do not publish, send or deploy anything.`
4. Review `growth/reports/` deliverables and confirm necessary external connections. Subagents are in `.claude/agents/`; skill is `.claude/skills/growth-command-center/`.
5. Review and approve any changes before external use. Re-run the command each week, or configure a separately authorized scheduler; this package alone does not schedule autonomous jobs.

No external credentials are required by the package and no remote accounts are connected automatically.

## Neste repositório
Instalado em 23/10/2026. `growth/reports/` e `growth/data/` são criados a partir de `growth/modelos/` e ficam fora do git (repositório público). Ver as regras no fim de `OPERATING_SYSTEM.md`.
