# seseg

This module is available in three formats:

- **ES Module**: `dist/index.mjs`
- **CommonJS**: `dist/index.js`
- **UMD**: `dist/index.min.js`

## Install

```bash
npm install @alexvyber/seseg
```

```bash
pnpm add @alexvyber/seseg
```

```bash
pnpm yarn @alexvyber/seseg
```

## Usage

```js
import seseg from "@alexvyber/seseg"
// or
import { seseg } from "@alexvyber/seseg"

// returns 'border italic underline text-2xl bg-red-500'
seseg(
  { className: [ "border", { italic: true, className: "underline" } ] },
  "text-2xl",
  [ "bg-red-500" ],
)

// 'border italic underline'
seseg( "border", true && "italic", "underline" )

// 'border underline'
seseg( { border: true, italic: false, underline: true } )

// 'border --adhoc'
seseg( { border: true }, { italic: false }, null, {
  "--adhoc": "some truthy value",
} )

// 'border italic'
seseg( [ "border", 0, false, "italic" ] )

// 'border italic underline bg-red-500 text-lg'
seseg(
  [ "border" ],
  [ "", 0, false, "italic" ],
  [ [ "underline", [ [ "bg-red-500" ], "text-lg" ] ] ],
)

// 'border italic bg-red-500 text-lg adhoc'
seseg(
  "border",
  [ 1 && "italic", { underline: false, bat: null }, [ "bg-red-500", [ "text-lg" ] ] ],
  "adhoc",
)
```
