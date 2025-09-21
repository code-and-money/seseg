# seseg

## Install

```bash
deno add jsr:@codeandmoney/seseg
```

## Usage

```ts
import { seseg } from "@codeandmoney/seseg"
// or
import { classes } from "@codeandmoney/seseg"

// "some other"
seseg( { className: "some", class: "otger" } )

// 'border italic underline text-2xl bg-red-500'
seseg(
  { className: [ "border", { italic: true, className: "underline" } ] },
  "text-2xl",
  [ "bg-red-500" ],
)

// 'border italic underline'
seseg( "border", true && "italic", "underline" )

// 'border underline'
seseg( { border: true, italic: false, underline: true } )

// 'border italic'
seseg( [ "border", 0, false, "italic" ] )

// 'border --adhoc'
seseg( { border: true }, { italic: false }, null, {
  "--adhoc": "some truthy value",
} )

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
