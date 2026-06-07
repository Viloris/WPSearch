# Contributing

Köszönjük, hogy hozzájárulsz a WPSearch-hoz! Ez egy rövid útmutató a helyi fejlesztéshez.

- Telepítés

```bash
npm install
```

- Linter

Futtasd az ESLint-et a forrásfájlokon:

```bash
npm run lint
```

- Fejlesztés

A fejlesztéshez használd a watch build scriptet:

```bash
npm run watch-dev
```

- Beállítások cache és listener API

A projekt mostantól központi settings kezelőt használ. Használd az alábbi API-t a beállítás-változások figyelésére:

```js
import { addSettingsChangeListener, removeSettingsChangeListener } from "src/settings/settings";

const onSettingsChanged = (changes) => {
  // kezelendő változások
};

addSettingsChangeListener(onSettingsChanged);
// eltávolítás komponens unmountkor
removeSettingsChangeListener(onSettingsChanged);
```

- Commit és PR folyamat

1. Készíts feature branch-et: `git checkout -b feature/your-feature`
2. Futtasd a lintert és javítsd a hibákat: `npm run lint`
3. Commitolj világos üzenetekkel: `git add -A && git commit -m "feat: ..."`
4. Pushold a branch-et és nyiss pull request-et.

---

Kérdés esetén nyiss issue-t vagy írj a repo ownernek.