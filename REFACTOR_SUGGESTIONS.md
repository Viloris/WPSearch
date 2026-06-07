# Refactorálási és fejlesztési javaslatok

Ez a dokumentum összegzi a WPSearch projekt vizsgálatát, a refaktorálási lehetőségeket és a javasolt fejlesztéseket.

## 1. Főbb refaktorációs javaslatok

### `src/popup/components/PopupPage.js`

- Távolítsd el a production kódból a `console.log(res)` és `console.log(results)` hívásokat.
- A `handleInputText` `useCallback` függőségei közé vedd fel a `wpSearchText` függvényt.
- Egységesítsd a `tabInfo` állapot kulcsait: a `getTabInfo()` `url` kulcsot ad vissza, de az állapotban `tabUrl` szerepel.
- A debouncing logikát érdemes egy `useDebouncedValue` hookba szervezni, hogy áttekinthetőbb és megbízhatóbb legyen.
- A közvetlen `document.body` módosításokat (szélesség és theme class) jobb CSS-sel vagy hookkal kezelni.

### `src/content/index.js`

- `getSelectedPosition()` nem kezeli, ha nincs kijelölés; `window.getSelection().getRangeAt(0)` hibát dobhat.
- A `tagName === INPUT || tagName === TEXTAREA` ellenőrzés többször előfordul, ez helper függvénybe vihető.
- A message típusokat (`"getTabUrl"`, `"getSelectedText"`, stb.) konstansokba célszerű szervezni.
- A `disableExtensionByUrlList()` regex-építése jó, de a `pageUrl` olvasását robosztusabbá lehet tenni.

### Közös utilok és beállítások

- Több helyen közvetlen `getSettings()` hívás történik; központi beállítás-kezelő vagy cache bevezetésével javítható a teljesítmény és karbantarthatóság.
- A `browser.storage.local.onChanged` listener kezelését pontosabban érdemes szabályozni a kikapcsolás/újraaktiválás esetén.

## 2. Tooling és fejlesztési infrastruktúra

### `package.json`

- Add hozzá a `lint` scriptet, például `eslint "src/**/*.js"`.
- Hasznos lehet `build:dev`, `build:prod`, `clean` és `package` script létrehozása.
- Ellenőrizd a `main` mezőt: a jelenlegi `.src/manifest.json` érték furcsának tűnik, ha nincs használatban, töröld vagy javítsd.

### Dokumentáció

- A README arról beszél, hogy React 16.13 van használatban, de a dependency React 18.3.1. Szinkronizáld ezt.
- Készíts `CONTRIBUTING.md` fájlt, mert a README erre utal.
- Adj hozzá egyszerű dev setup és release guide-ot a dokumentációhoz.

### Verziókövetés

- A `dev/`, `temp/`, `web-ext-artifacts/` mappák build-artifaktok lehetnek; ellenőrizd, hogy kerüljenek-e `.gitignore`-ba.

## 3. Fejlesztési lehetőségek

- Tesztrendszer bevezetése: `Jest` + `React Testing Library`, esetleg `Playwright`/`Cypress` e2e tesztek.
- CI pipeline beállítása: `lint + build + test` ellenőrzés GitHub Actions vagy más CI segítségével.
- Felhasználói élmény javítása: egyértelműbb enable/disable állapot a popupban, több nyelvi váltás támogatás, finomabb kijelölés-keresés logika.
- Teljesítmény: a content script-ben csökkentsd a felesleges DOM-kereséseket, cache-eld a beállításokat és minimalizáld a render/update hívásokat.

## 4. Konkrét további javítások

- `src/components/CopyButton.js`: `console.error("Copy error", err)` helyett jobb felhasználói hibaüzenet vagy logolási stratégia.
- `src/content/components/SearchContainer.js`: `console.error("Search error: ", error)` használata helyett strukturáltabb hibakezelés.
- `src/popup/components/PopupPage.js`: a `wpSearchText()` hívásnál hibakezelést adjunk hozzá.
- `src/content/index.js`: edge-case kezelések a `getSelectedText()` és `getSelectedPosition()` funkciókban.

## 5. Összegzés

A projekt jó alap, de a legfontosabb gyors javítások:

- `console` hívások eltávolítása production kódból,
- hiányzó lint/test script-ek hozzáadása,
- content script edge-case kezelése,
- build-artifaktok és dokumentáció rendezése.

Ha szeretnéd, a következő lépés lehet a `PopupPage` refaktorálása és `useDebouncedSearch` hook bevezetése, illetve a `package.json` scriptjeinek és a README-nek a frissítése.
