# Repository Guidelines

## Project Structure & Module Organization

Source lives in `src/`, with the CLI entry point at `src/cli.ts`, the localization pipeline in `src/localizer.ts`, and the optional UI server in `src/server/uiServer.ts`. Shared types stay in `src/types.ts`. Build artifacts land inside the git-ignored `dist/` directory after `pnpm run build`. Documentation and sample markup reside in `docs/` and `example.html`, while automated checks live under `tests/`.

## Build, Test, and Development Commands

- `pnpm install`: restore dependencies after cloning or receiving an updated lockfile.
- `pnpm run dev`: execute the CLI through `ts-node` for quick iteration and debugging.
- `pnpm run build`: compile TypeScript to CommonJS output in `dist/`; required before releases.
- `pnpm test` / `pnpm test:watch`: run Vitest once or in watch mode to validate localization flows.
- `pnpm run clean`: remove stale build output; pair with `pnpm run release` when preparing packages.

## Coding Style & Naming Conventions

The codebase targets TypeScript strict mode with ES2020 syntax. Use camelCase for variables and functions, PascalCase for exported types or classes, and kebab-case for CLI flags. Maintain LF line endings and ASCII text unless a file already contains Unicode. Document externally visible behaviors with concise JSDoc and prefer descriptive names over excessive comments.

## Testing Guidelines

Vitest provides the test harness. Create suites alongside source in `tests/` using the `*.test.ts` suffix (for example, `tests/localizer.test.ts`). Stub network calls with local fixtures or lightweight HTTP servers so runs are deterministic. Execute `pnpm test` before pushing, and add regression coverage whenever HTML parsing, asset deduplication, or localized output formatting changes.

## Commit & Pull Request Guidelines

Commits follow `<type>: <description>` (e.g., `fix: guard empty asset list`) and should stay scoped to a single concern. Pull requests must reference related issues, summarise functional changes, and list verification steps such as `pnpm run build`, `pnpm test`, or CLI/UI demos. Include screenshots or logs when adjusting UI behavior, and avoid bundling refactors with features.

## Security & Configuration Tips

Never commit downloaded binaries, generated translations, or screenshots; extend `.gitignore` if new artifacts appear. Note trusted domains and licensing in PRs when introducing external resources. When launching the UI with `--host 0.0.0.0`, verify firewall rules and redact internal URLs from shared logs to prevent leaking sensitive endpoints.
