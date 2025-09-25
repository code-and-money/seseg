export type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | null
  | boolean
  | undefined

export type ClassArray = ClassValue[]

export type ClassDictionary = Record<
  string,
  | ClassValue[]
  | string
  | number
  | null
  | boolean
  | undefined
  | Record<
    string,
    | ClassValue[]
    | string
    | number
    | null
    | boolean
    | undefined
  >
>

/**
 * Generates a className string from the given class values.
 *
 * @example
 * ```ts
 * import { seseg } from "@codeandmoney/seseg";
 *
 * seseg(
 *   { className: ["foo", { bar: true, className: "buz" }] },
 *   "lol",
 *   ["kek"]
 * ) // returns 'foo bar buz lol kek'
 * ```
 * @param {ClassValue} classes The classValues to compile into a string.
 * @returns {string} The compiled className string.
 */
function seseg( ...classes: ClassValue[] ): string {
  // deno-lint-ignore no-explicit-any
  let tmp: any
  let i = 0
  let str = ""

  const length = classes.length

  while ( i < length ) {
    if ( ( tmp = classes[i++] ) ) {
      str += produceClasses( tmp )
    }
  }

  return str.trim().replace( /\s+/g, " " )
}

function produceClasses( classes: ClassValue ): string {
  if ( !classes || typeof classes === "boolean" || typeof classes === "function" ) {
    return ""
  }

  if ( typeof classes === "object" ) {
    if ( Array.isArray( classes ) ) {
      let str = ""

      for ( const item of classes.flat( Number.MAX_SAFE_INTEGER as 0 ) ) {
        if ( item ) {
          str += produceClasses( item )
        }
      }

      return str
    }

    let str = ""

    for ( const key of Object.keys( classes ) ) {
      if ( key === "class" || key === "className" ) {
        str += produceClasses( classes[key] )
      } else if ( classes[key] && typeof classes[key] !== "function" ) {
        str += key + " "
      }
    }

    return str
  }

  return classes.toString() + " "
}

export { seseg, seseg as classes }
