# classic

This module is available in three formats:

- **ES Module**: `dist/index.mjs`
- **CommonJS**:  `dist/index.js`
- **UMD**:       `dist/index.min.js`

## Install

```bash
npm install @alexvyber/classic
```

```bash
pnpm add @alexvyber/classic
```

```bash
pnpm yarn @alexvyber/classic
```

## Usage

```js
import classic from "@alexvyber/classic";
// or
import { classic } from "@alexvyber/classic";

// returns 'border italic underline text-2xl bg-red-500'
classic(
  { className: ["border", { italic: true, className: "underline" }] },
  "text-2xl",
  ["bg-red-500"],
);

// 'border italic underline'
classic("border", true && "italic", "underline");

// 'border underline'
classic({ border: true, italic: false, underline: true });

// 'border --adhoc'
classic({ border: true }, { italic: false }, null, {
  "--adhoc": "some truthy value",
});

// 'border italic'
classic(["border", 0, false, "italic"]);

// 'border italic underline bg-red-500 text-lg'
classic(
  ["border"],
  ["", 0, false, "italic"],
  [["underline", [["bg-red-500"], "text-lg"]]],
);

// 'border italic bg-red-500 text-lg adhoc'
classic(
  "border",
  [1 && "italic", { underline: false, bat: null }, ["bg-red-500", ["text-lg"]]],
  "adhoc",
);
```
