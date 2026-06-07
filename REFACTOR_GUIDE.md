# Modularizálási Refactor Útmutató

## 📋 Célok

- Szeparáció: API logika ↔ UI komponensek
- Újrahasználhatóság: `common/` → valóban közös utils
- Tiszta határok: popup, content, options ↔ közös komponensek

---

## 🔄 Refactor Fázisok

### **FÁZIS 1: Új Könyvtárszerkezet Létrehozása**

```
src/
├── api/                    ← ÚJ
│   └── wikipediaApi.js
├── common/                 ← MÓDOSÍTOTT
│   ├── i18n.js            ← ÚJ
│   ├── storage.js         ← ÚJ
│   ├── urlUtils.js        ← ÚJ
│   ├── textUtils.js       ← ÚJ
│   └── constants.js       ← ÚJ (httpCodes.json átnevezhető)
├── components/            ← ÚJ (shared UI)
│   ├── InfoBar.js
│   ├── ResultSection.js
│   ├── ResultContent.js
│   ├── ResultHeader.js
│   ├── ResultFooter.js
│   ├── ErrorSection.js
│   ├── CopyButton.js
│   └── styles/
│       ├── infoBar.scss
│       ├── ResultArea.scss
│       └── ...
├── popup/
│   ├── index.js
│   ├── index.html
│   ├── components/
│   │   ├── PopupPage.js
│   │   ├── InputArea.js
│   │   └── Header.js
│   └── styles/
├── content/
│   ├── index.js
│   ├── components/
│   │   ├── SearchContainer.js
│   │   ├── ResultPanel.js
│   │   └── SearchButton.js
│   └── styles/
├── options/
├── settings/
└── background/
```

**TEENDŐ: Könyvtárak létrehozása**

```bash
# Terminálban, src/ könyvtárból:
mkdir -p api
mkdir -p components/styles
```

---

### **FÁZIS 2: Új Utils Modulok Létrehozása**

#### **2.1 `src/api/wikipediaApi.js`**

**Forrás**: `src/common/wikisearch.js` → kinyerni az API logikát

```javascript
// MÁSOLJ: wikisearch.js-ből a FETCH és HTTP kezelési logikát
// Távolítsd el: React, JSX, settings, localization függőségeket
// Hagyj: getSearchUrl(), getSummaryUrl(), fetchWikiSummary(), handleHttpError()

import log from "loglevel";
import config from "../config.json";
import httpCodes from "../common/httpCodes.json";

const { DASH, NO_SUMMARY, WIKIPEDIA_API_URL, WIKIPEDIA_SUMMARY_API_URL, HTTPS } = config;
const { NOT_FOUND, SERVICE_UNAVAILABLE, TOO_MANY_REQUESTS } = httpCodes;

// A wikisearch.js-ből ide másolnak a fetch funkciókat (getFirstSearchResultTitle, fetchWikiSummary, stb.)
```

**Miért**: Ezáltal a keresés logika UI-agnosztikus és könnyen tesztelhető.

---

#### **2.2 `src/common/i18n.js`**

**Forrás**: `src/common/utils.js` → kigyűjteni az i18n függvényeket

```javascript
import browser from "webextension-polyfill";
import { getSettings } from "../settings/settings";

export function getLocaleMessage(key) {
  return browser.i18n.getMessage(key);
}

export function getTargetLang() {
  return getSettings("targetLang");
}

export function getSecondTargetLang() {
  return getSettings("secondTargetLang");
}

export function getMainLangText() {
  return getLocaleMessage(`lang_${getTargetLang()}`);
}

export function getSecondLangText() {
  return getLocaleMessage(`lang_${getSecondTargetLang()}`);
}
```

**Miért**: Localization logika egy helyen, könnyen módosítható.

---

#### **2.3 `src/common/urlUtils.js`**

**Forrás**: `src/common/utils.js` → URL és tab kezelés

```javascript
import browser from "webextension-polyfill";
import WP_LANG from "../settings/wikipedia.json";

export function tabsSendMessage(tab, message) {
  return browser.tabs.sendMessage(tab.id, { message });
}

export function getWikipediaName(langCode) {
  return WP_LANG[langCode];
}

// Egyéb URL/tab kezelés if szükséges
```

---

#### **2.4 `src/common/textUtils.js`**

**Forrás**: `src/common/utils.js` → splitLine()

```javascript
import React from "react";

export function splitLine(text) {
  const regex = /(\n)/g;
  if (!text) return;
  return text.split(regex).map((line, i) => (line.match(regex) ? React.createElement("br", { key: i }) : line));
}
```

---

#### **2.5 `src/common/constants.js`**

**Forrás**: `src/common/httpCodes.json` → konstansok

```javascript
// Alternatively, keep httpCodes.json és csak itt importáld:
export { default as HTTP_CODES } from "./httpCodes.json";
export { default as CONFIG } from "../config.json";
```

---

### **FÁZIS 3: Komponensek Mozgatása és Átnevezése**

**3.1 `src/common/` → `src/components/`-re mozgatandó:**

```bash
# Terminal-ben:
mv src/common/InfoBar.js src/components/
mv src/common/ResultArea.js src/components/
mv src/common/resultSection.js src/components/ResultSection.js
mv src/common/resultContent.js src/components/ResultContent.js
mv src/common/resultHeader.js src/components/ResultHeader.js
mv src/common/resultFooter.js src/components/ResultFooter.js
mv src/common/errorSection.js src/components/ErrorSection.js
mv src/common/CopyButton.js src/components/
mv src/common/resultSummary.js src/components/ResultSummary.js
mv src/common/wikiLink.js src/components/WikiLink.js

# Stílusok:
mkdir -p src/components/styles
mv src/common/styles/*.scss src/components/styles/
```

**3.2 Komponensek átnevezegetése (CamelCase)**:

```bash
mv src/components/resultSection.js src/components/ResultSection.js
mv src/components/resultContent.js src/components/ResultContent.js
# stb.
```

---

### **FÁZIS 4: Import Frissítések**

**4.1 `src/components/` fájlokban:**

**`ResultSection.js` (volt: `src/common/resultSection.js`)**

```javascript
// RÉGI:
import { ErrorSection } from "./errorSection";
import { ResultContent } from "./resultContent";
import { ResultFooter } from "./resultFooter";
import { ResultHeader } from "./resultHeader";

// ÚJ:
import { ErrorSection } from "./ErrorSection";
import { ResultContent } from "./ResultContent";
import { ResultFooter } from "./ResultFooter";
import { ResultHeader } from "./ResultHeader";
```

**`ResultContent.js` (volt: `src/common/resultContent.js`)**

```javascript
// RÉGI:
import { ResultSummary } from "./resultSummary";
import { WikipediaLink } from "./wikiLink";

// ÚJ:
import { ResultSummary } from "./ResultSummary";
import { WikiLink } from "./WikiLink";
```

---

**4.2 `src/popup/components/PopupPage.js`**

```javascript
// RÉGI:
import ResultArea from "../../common/ResultArea";
import { getTargetLang, tabsSendMessage } from "../../common/utils";

// ÚJ:
import ResultArea from "../../components/ResultArea";
import { getTargetLang } from "../../common/i18n";
import { tabsSendMessage } from "../../common/urlUtils";
```

---

**4.3 `src/popup/components/InputArea.js`**

```javascript
// RÉGI:
import { getLocaleMessage } from "../../common/utils";

// ÚJ:
import { getLocaleMessage } from "../../common/i18n";
```

---

**4.4 `src/common/ResultArea.js` (maradt közös komponens, de már át lett mozgatva)**

```javascript
// RÉGI:
import { ResultSection } from "./resultSection";
import InfoBar from "./infoBar";
import { getLocaleMessage, getWikipediaName } from "../common/utils";

// ÚJ:
import { ResultSection } from "../components/ResultSection";
import InfoBar from "../components/InfoBar";
import { getLocaleMessage } from "./i18n";
import { getWikipediaName } from "./urlUtils";
```

---

**4.5 `src/content/components/SearchContainer.js`**

```javascript
// RÉGI:
import { getTargetLang } from "../../common/utils";

// ÚJ:
import { getTargetLang } from "../../common/i18n";
```

---

**4.6 `src/content/components/ResultPanel.js`** (ha létezik)

```javascript
// RÉGI:
import { ResultSection } from "../../common/resultSection";

// ÚJ:
import { ResultSection } from "../../components/ResultSection";
```

---

### **FÁZIS 5: Background & Options Frissítések**

**5.1 `src/background/background.js`**

Ha használ `common/` fájlokat, frissítsd az importokat:

```javascript
// RÉGI (ha van):
import { getLocaleMessage } from "../common/utils";

// ÚJ:
import { getLocaleMessage } from "../common/i18n";
```

---

**5.2 `src/options/components/SettingsPage.js`** (ha használ utils-t)

```javascript
// RÉGI:
import { getLocaleMessage } from "../../common/utils";

// ÚJ:
import { getLocaleMessage } from "../../common/i18n";
```

---

### **FÁZIS 6: Érvényesítés & Tesztelés**

```bash
# Terminal-ben:

# 1. Build dev (webpack-kel)
npm run build:dev

# 2. Ellenőrizd a konzolon, nincs-e importálási hiba:
# - A webpack kimenetét nézd meg
# - Nyisd meg a popup-ot dev-ben és ellenőrizz konzolerrorokat
# - Teszteld a tartalomkeresést

# 3. Keresd meg az összes "require()" és "import" hibákat:
grep -r "from.*common/result" src/  # Ellenőrizd, hogy nincsenek-e régi útvonalak
grep -r "from.*common/errorSection" src/
```

---

### **FÁZIS 7: Tisztító Munka**

**7.1 `src/common/` tisztítása** (eltávolítandó fájlok)

```bash
# A mozgatott fájlok már eltávoztak, de ellenőrizd:
rm -f src/common/InfoBar.js
rm -f src/common/ResultArea.js
rm -f src/common/resultSection.js
# stb.

# Már csak közös utils marad:
ls src/common/
# Várható: i18n.js, urlUtils.js, textUtils.js, constants.js, utils.js (frissített), log.js, styles/
```

**7.2 `src/common/utils.js` tisztítása**

Csak a valóban közös függvények maradnak (ha vannak már máshol):

```javascript
// Távolítsd el a már átmozgatottakat
// Hagyj: csak azokat, amit több hely használ
// Vagy egyszerűen hagyd üresen / töröld, ha elég a szétválasztott modulok
```

---

## ✅ Ellenőrzési Lista

- [ ] `mkdir -p src/api`
- [ ] `mkdir -p src/components/styles`
- [ ] `src/api/wikipediaApi.js` létrehozva
- [ ] `src/common/i18n.js` létrehozva
- [ ] `src/common/urlUtils.js` létrehozva
- [ ] `src/common/textUtils.js` létrehozva
- [ ] Komponensek mozgatva `src/common/` → `src/components/`
- [ ] Fájlok átnevezve CamelCase-re
- [ ] Összes import frissítve `src/popup/`-ban
- [ ] Összes import frissítve `src/content/`-ban
- [ ] Összes import frissítve `src/components/`-ban
- [ ] `npm run build:dev` sikeres
- [ ] Nincsenek console errorok

---

## 💡 Tips

1. **Lépésről lépésre**: Ne csináld meg egyszerre a refactor-t. Csináld meg fázist és teszteld után.
2. **VS Code Find & Replace**: Ctrl+H → "find" az összes `.js` fájlban és replace az importokat
3. **Git branch**: Hozz létre egy új branch-et (`git checkout -b refactor/modularize`), így könnyebb visszaállni ha szükséges
4. **Commit gyakran**: Minden fázis után commit-olja: `git commit -m "refactor: move components to src/components/"`

---

## 🚀 Következő Lépések (Ha Kész)

- Unit tesztek írása az új `api/`-hoz
- TypeScript migrálás fontolgatása
- E2E tesztek
