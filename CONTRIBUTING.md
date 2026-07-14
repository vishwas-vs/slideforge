# Contributing to slideforge

Thanks for considering a contribution! This is an early-stage project — the fastest way to have impact right now is picking up an issue on the [v0.2](https://github.com/vishwas-vs/slideforge/milestone/2) or later milestone, since v0.1 is just repo scaffolding.

## Getting started

1. Fork and clone the repo.
2. Install Node.js >=22 and [pnpm](https://pnpm.io).
3. `pnpm install`
4. `pnpm build && pnpm test` to confirm your environment is set up correctly.

See `AGENTS.md` for architecture ground rules (package boundaries, "don't reimplement upstream" policy) that apply to human and AI-assisted contributions alike.

## Workflow

1. Check the [issue tracker](https://github.com/vishwas-vs/slideforge/issues) for existing work before starting something new — comment on the issue you're picking up so it doesn't get duplicated.
2. Create a branch off `main`.
3. Make your change. Keep PRs scoped to one issue/concern where possible.
4. Run `pnpm build && pnpm lint && pnpm typecheck && pnpm test` locally.
5. If your change affects a published package's behavior, add a changeset: `pnpm changeset`.
6. Open a PR using the provided template, referencing the issue it closes (`Closes #123`).

## Issue labels

- `type:feature` / `type:bug` / `type:docs` / `type:chore` — what kind of change
- `area:schema` / `area:mcp-server` / `area:compiler-slidev` / `area:compiler-hyperframes` / `area:cli` / `area:ci` — which package
- `good first issue` — a reasonable entry point if you're new to the codebase
- `help wanted` — maintainers would specifically welcome a contribution here
- `status:needs-triage` / `status:needs-human-review` / `status:blocked` — workflow state

## AI-assisted contributions

Agent-authored PRs are welcome — this project is explicitly designed to be agent-friendly. Please label them `status: needs-human-review` if a human hasn't already reviewed the diff line-by-line before opening the PR, and make sure the PR description says what was AI-generated vs. hand-written. See `AGENTS.md` for the ground rules agents should follow in this repo.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you're expected to uphold it.
