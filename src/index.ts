export type ClassValue = ClassArray | ClassDictionary | string | number | null | boolean | undefined
export type ClassArray = ClassValue[]
export type ClassDictionary = Record<string, ClassValue[] | string | number | null | boolean | undefined | Record<string, ClassValue[] | string | number | null | boolean | undefined>>

/**
 * Generates a className string from the given class values.
 *
 * @example
 * ```ts
 * import { classic } from "@alexvyber/classic";
 *
 * classic(
 *   { className: ["foo", { bar: true, className: "buz" }] },
 *   "lol",
 *   ["kek"]
 * ) // returns 'foo bar buz lol kek'
 * ```
 * @param {ClassValue} classes The classValues to compile into a string.
 * @returns {string} The compiled className string.
 */
function classic(...classes: ClassValue[]): string {
  let i = 0
  let str = ''
  let tmp: any

  const length = classes.length

  while (i < length) {
    if ((tmp = classes[i++])) str += produceClasses(tmp)
  }

  return str.trim()
}

function produceClasses(classes: ClassValue) {
  if (typeof classes === 'boolean' || !classes || typeof classes === 'function') {
    return ''
  }

  if (typeof classes === 'object') {
    let str = ''

    if (Array.isArray(classes)) {
      for (const item of classes.flat(Number.MAX_SAFE_INTEGER as 0)) {
        if (item) str += produceClasses(item)
      }
    } else {
      for (const key of Object.keys(classes)) {
        if (key === 'class' || key === 'className') str += produceClasses(classes[key])
        else if (classes[key] && typeof classes[key] !== 'function') str += key + ' '
      }
    }

    return str
  }

  return classes.toString()
}

export { classic }
