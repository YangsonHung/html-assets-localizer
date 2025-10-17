# Contributing Guide

Thanks for your interest in improving **HTML Assets Localizer**! This document describes how to get set up, submit changes, and publish new releases.

## Prerequisites

- Node.js ≥ 18 (we recommend the latest LTS).
- [pnpm](https://pnpm.io/) (the project uses `pnpm@10.18.3`).
- Git configured with your GitHub account.

## Getting Started

1. Fork the repository on GitHub, then clone your fork:

   ```bash
   git clone https://github.com/<your-username>/html-assets-localizer.git
   cd html-assets-localizer
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a feature branch from `main`:

   ```bash
   git checkout -b feat/my-feature
   ```

## Development Workflow

1. Make your changes in the `src/` or `docs/` directory as needed.
2. Keep TypeScript strict, lint-friendly code. Add concise comments only where logic is non-obvious.
3. Run tests and builds locally:

   ```bash
   pnpm test
   pnpm run build
   ```

4. Follow the existing commit convention (e.g. `feat: add browser localizer`). Squash-only PRs are acceptable as long as the final commit message matches the convention.

## Pull Requests

- Keep each PR focused on a single topic or fix.
- Update documentation (README, CHANGELOG, etc.) when behavior changes.
- Provide reproduction steps or screenshots if UI output is affected.
- Ensure the CI pipeline passes before requesting review.

## Release Process

1. Update `CHANGELOG.md` with the new version entry.
2. Bump the version in `package.json` (and the lockfile).
3. Commit and push your changes to `main`.
4. Create and push a Git tag following the `vX.Y.Z` pattern.
5. The GitHub workflow (`.github/workflows/release.yml`) will:
   - install dependencies and run tests,
   - build the project and archive `dist/`,
   - create a GitHub Release with notes generated from `CHANGELOG.md`,
   - publish the package to npm (requires `NPM_TOKEN`).

## Getting an NPM Token

1. Log in to [npmjs.com](https://www.npmjs.com/) with an account that has publish rights for this package.
2. Navigate to **Access Tokens** in your account settings.
3. Create a new **Automation** token (recommended) or **Publish** token.
4. Copy the token value once it is generated.
5. In the GitHub repository, go to **Settings → Secrets and variables → Actions → New repository secret**, name it `NPM_TOKEN`, and paste the token value.

> The GitHub Release workflow uses `NPM_TOKEN` to authenticate `npm publish`. Without it, publishes will fail.

We appreciate every contribution. Feel free to open an Issue for questions or clarifications before starting major work. Happy coding! 🎉
