# <sub><img src="/src/icons/64.png" width=64px height=64px></sub> Wikipedia Preview

> **Quick Wikipedia Preview** – search the selected text or typing directly into the popup. A lightweight browser extension for Chrome/Firefox.

---

## 🚀 Overview

WPSearch is a small webextension that lets you look up Wikipedia articles in a floating popup or new tab without leaving the current page. It supports multiple languages, custom search modes, keyboard shortcuts, and works in both Chrome‑based and Firefox browsers.

## ✨ Features

- Instant search of selected text
- Configurable main/secondary language
- Keyboard shortcuts and context menu integration
- Popup result panel with copy/share tools
- Expand a search result to read the full Wikipedia article in the popup
- Localization in several languages (en, de, fr, hu, …)
- Build pipeline generating separate Chrome/Firefox packages

## 💻 Installation

### Requirements

- Node.js 16+ (tested on 18.x)
- npm or yarn

### Quick start

```bash
git clone https://github.com/Viloris/WPSearch.git
cd WPSearch
npm install
```

### Load extension in browser

**Chrome / Chromium**

1. run `npm run watch-dev` to compile assets into `dev/chrome`.
2. Open `chrome://extensions/`, enable "Developer mode".
3. Click "Load unpacked" and select `dev/chrome`.

**Firefox**

1. run `npm run watch-dev` (builds `dev/firefox`).
2. Open `about:debugging#/runtime/this-firefox`.
3. Click "Load Temporary Add-on" and choose `dev/firefox/manifest.json`.

> The `watch-dev` script recompiles on file change and updates the `dev/` directories.

## 🛠️ Development

Directory highlights:

```
src/           # React components, background scripts, shared utilities
dev/           # intermediate build outputs for manual testing
temp/          # packaged output during build
web-ext-artifacts/  # built ZIPs for publishing
```

Configuration files:

- `config.json` – paths and build options for Chrome/Firefox
- `webpack.*.js` – development and distribution webpack configs

### Useful scripts

```bash
npm run watch-dev      # development build with source maps
npm run build          # production build into temp/ and web-ext-artifacts/
npm run open-analyzer  # open bundle analyzer on localhost
```

### Coding conventions

- React (16.13) with functional/stateless components
- ES6+ syntax via Babel, SCSS modules compiled by webpack
- Linting with ESLint (`npm run lint` can be added)

## ✅ Testing & Linting

Currently there are no automated tests in the repo; contributors are encouraged to add Jest/RTL or similar. ESLint configurations are provided in `eslint.config.mjs`.

> Tip: run `npx eslint "src/**/*.js"` to check code style.

## 🧩 Building & Packaging

To create production packages for upload to extension stores:

1. `npm run build` – results land in `temp/browser/` and zipped archives in `web-ext-artifacts/`.
2. Use `web-ext` CLI or manual packaging if further signing is required.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-name`).
3. Commit your changes with clear messages.
4. Submit a pull request describing the problem and your solution.

See `CONTRIBUTING.md` (not yet present) for detailed guidelines. You can start by adding tests, improving docs, or updating dependencies.

## 📜 License

This project is licensed under the **MPL‑2.0 License** – see [LICENSE](LICENSE) for details.

## 🙋 Support

Have questions? Open an issue on GitHub or contact the author at the address in `package.json`.

---

_Thank you for using WPSearch!_
