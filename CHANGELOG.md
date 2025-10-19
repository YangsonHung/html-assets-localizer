# Changelog

All notable changes to this project will be documented in this file.

## 1.3.0 - 2025-10-19

- improve light theme adaptation for better visibility
- fix language switching issues where Chinese text persisted in English mode
- implement custom file upload button with better styling and functionality
- update documentation text to remove README references and improve clarity
- enhance UI elements for better user experience across themes

## 1.2.1 - 2025-10-18

- update docs/index.html

## 1.2.0 - 2025-10-17

- add browser-friendly UMD bundle backed by `BrowserHtmlAssetsLocalizer`, allowing docs site and GH Pages to run localization fully in browser.
- switch docs landing page to use the UMD bundle directly instead of the `/api/localize` backend.
- split build targets (CJS/ESM via `vite.config.ts`, browser UMD via `vite.browser.config.ts`) and expose multiple entry fields in `package.json`.
- document the new browser usage flow in the README and add contributor guidelines.
