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

seseg( { className: "some", class: "otger" } ) // "some other"

seseg(
  { className: [ "border", { italic: true, className: "underline" } ] },
  "text-2xl",
  [ "bg-red-500" ],
)
// 'border italic underline text-2xl bg-red-500'

seseg( "border", true && "italic", "underline" ) // 'border italic underline'

seseg( { border: true, italic: false, underline: true } ) // 'border underline'

seseg( { border: true }, { italic: false }, null, {
  "--adhoc": "some truthy value",
} )
// 'border --adhoc'

seseg( [ "border", 0, false, "italic" ] ) // 'border italic'

seseg(
  [ "border" ],
  [ "", 0, false, "italic" ],
  [ [ "underline", [ [ "bg-red-500" ], "text-lg" ] ] ],
)
// 'border italic underline bg-red-500 text-lg'

seseg(
  "border",
  [ 1 && "italic", { underline: false, bat: null }, [ "bg-red-500", [ "text-lg" ] ] ],
  "adhoc",
)
// 'border italic bg-red-500 text-lg adhoc'
```
