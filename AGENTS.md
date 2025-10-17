# Repository Guidelines

## Project Structure & Module Organization
Source code lives in `src/`, with the CLI entry at `src/cli.ts`, core logic in `src/localizer.ts`, and the Express UI launcher under `src/server/uiServer.ts`. Type definitions are collected in `src/types.ts`, while compiled JavaScript is emitted to `dist/` after building (keep this folder out of version control). Example assets and documentation reside in `example.html` and `docs/`. Tests are co-located under `tests/`, currently focusing on the HTML localization flow.

## Build, Test, and Development Commands
Use `pnpm install` to set up dependencies. Run `pnpm run build` to compile TypeScript output, and `pnpm run dev` for rapid CLI prototyping via `ts-node`. Execute `pnpm test` (or `pnpm test:watch`) to run Vitest suites. The release helper `pnpm run release` rebuilds before publishing, while `pnpm run clean` removes previous builds.

## Coding Style & Naming Conventions
Adopt TypeScript strict mode with ES2020 targets and CommonJS modules. Prefer camelCase for variables/functions and PascalCase for exported classes/interfaces. Keep public APIs documented via concise JSDoc when behavior is non-obvious. Maintain LF line endings and ASCII characters unless a file already requires Unicode (e.g., README emojis).

## Testing Guidelines
Vitest is the primary framework. Place new suites in `tests/` using the `*.test.ts` suffix (e.g., `tests/localizer.test.ts`). Mock remote resources via lightweight HTTP servers to avoid network dependencies. Run `pnpm test` locally before submitting PRs; add coverage checks if new modules handle critical logic. Capture regression scenarios—especially around HTML parsing, resource deduplication, and error handling.

## Commit & Pull Request Guidelines
Follow the existing `<type>: <description>` convention (e.g., `feat: add ui mode alias`) and keep messages in English. A PR should link relevant issues, summarise key changes, list verification steps (`pnpm run build`, `pnpm test`, CLI/UI demos), and include screenshots or logs when UI behavior changes. Ensure branches are rebased on the latest `main` and avoid bundling unrelated refactors.

## Security & Configuration Tips
Never commit downloaded assets or temporary outputs; add new ignore patterns to `.gitignore` when necessary. The CLI downloads external resources—mention trusted domains or licensing constraints in PRs if new defaults are introduced. When exposing the UI (`--host 0.0.0.0`), confirm firewall rules and redact sensitive URLs from logs before sharing.
