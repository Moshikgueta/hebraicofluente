---
name: growth-command-center
description: Coordinate Hebraico Fluente's five marketing subagents for a documented weekly growth cycle, from research and Instagram content through partnerships, conversion experiments, and revenue reporting. Use when asked to run growth operations, plan campaigns, or conduct a growth review.
---

# Hebraico Fluente Growth Command Center

Start by reading `growth/OPERATING_SYSTEM.md` (the section "Regras do Hebraico Fluente" overrides the rest) and the project `CLAUDE.md`. If `growth/reports/` or `growth/data/` do not exist, copy them from `growth/modelos/` (they are gitignored: the repository is public). Then read the current reports and actual connected data. Do not assume external APIs exist. Invoke the dedicated subagents when available; otherwise follow their files under `.claude/agents/` directly. 

1. Ask audience-researcher for demand and intent evidence.
2. Ask instagram-strategist to create publish-ready drafts and the editorial calendar.
3. Ask partnership-scout for verified partnership prospects and review-ready drafts.
4. Ask conversion-optimizer to assess sales leaks and recommend safe tests.
5. Ask chief-growth-officer to reconcile priorities, next actions and an honest weekly scorecard.

Keep research clearly sourced, do not make up traffic or sales numbers, and honor the review gates. Store deliverables under `growth/reports/` and never commit them. Talk to the owner in Portuguese. Prefer internal preparation without approvals, but request approval before sending messages, publishing, spending money, changing production code or prices. End with exactly three prioritized next actions and a table of evidence gaps.
