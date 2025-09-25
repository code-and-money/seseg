import { type ClassValue, seseg } from "./mod.ts"
import { assertStrictEquals } from "@std/assert"

Deno.test("keeps object keys with truthy values", () => {
  assertStrictEquals( seseg( { one: true, two: false, three: 0, four: null, five: undefined, six: 1 } ), "one six" )
})

Deno.test("joins arrays of class names and ignore falsy values", () => {
  assertStrictEquals( seseg( "one", 0, null, undefined, true, 1, "seven" ), "one 1 seven" )
})

Deno.test("handles arrays that include falsy and true values", () => {
  assertStrictEquals( seseg( [ "one", 0, null, undefined, false, true, "seven" ] ), "one seven" )
})

Deno.test("supports heterogenous arguments", () => {
  assertStrictEquals(
    seseg(
      0,
      false,
      "two",
      "five",
      { one: true },
      [ [ { six: true } ] ],
      { className: [ { seven: false }, [ [ { eight: true } ] ] ] },
    ),
    "two five one six eight",
  )
})

Deno.test("should be trimmed", () => {
  assertStrictEquals(
    seseg(
      "",
      `          \n\n\n       two       
      
      
      
      \n\n\n  \r\n  three    \n\n\n    \n\r \r\n
       
      
       
       
      `,
      { four: true, "                five              ": true },
      "",
    ),
    "two three four five",
  )
})

Deno.test("returns an empty string for an empty configuration", () => {
  assertStrictEquals( seseg( {} ), "" )
})

Deno.test("supports an array of class names", () => {
  assertStrictEquals( seseg( [ "one", "two" ] ), "one two" )
})

Deno.test("joins array arguments with string arguments", () => {
  assertStrictEquals( seseg( [ "one", "two" ], "three" ), "one two three" )
  assertStrictEquals( seseg( "three", [ "one", "two" ] ), "three one two" )
})

Deno.test("handles multiple array arguments", () => {
  assertStrictEquals( seseg( [ "one", "two" ], [ "three", "four" ] ), "one two three four" )
})

Deno.test("handles arrays that include arrays", () => {
  assertStrictEquals( seseg( [ "one", [ "two", "three" ] ] ), "one two three" )
})

Deno.test("handles arrays that include objects", () => {
  assertStrictEquals( seseg( [ "one", { two: true, three: false } ] ), "one two" )
})

Deno.test("handles deep array recursion", () => {
  assertStrictEquals( seseg( [ "one", [ "two", [ "three", { four: true } ] ] ] ), "one two three four" )
})

Deno.test("handles arrays that are empty", () => {
  assertStrictEquals( seseg( "one", [] ), "one" )
})

Deno.test("handles nested arrays with nested arrays", () => {
  assertStrictEquals(
    seseg( [ [ [ [ [ [ [ [], [], [ [], [ [] ] ], [ [ [ [ [ [ [ [ [ [ [ [ "one" ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ] ),
    "one",
  )
})

Deno.test("handles nested arrays that have empty nested arrays", () => {
  assertStrictEquals(
    // @ts-expect-error typings
    seseg( [ "one", [ [ [ [ [ [ [ {}, {} ] ], {}, null ] ], { two: false } ], { three: () => {} } ] ] ] ),
    "one",
  )
})

Deno.test("handles all types of truthy and falsy property values as expected", () => {
  // @ts-expect-error typings
  const res = seseg( {
    // These ARE causing TypeScript errors:
    function: Object.prototype.toString,
    emptyObject: {},

    // falsy:
    null: null,
    emptyString: "",
    noNumber: Number.NaN,
    zero: 0,
    negativeZero: -0,
    false: false,
    undefined: undefined,

    // truthy
    nonEmptyString: "foobar",
    whitespace: " ",
    nonEmptyObject: { a: 1, b: 2 },
    emptyList: [],
    nonEmptyList: [ 1, 2, 3 ],
    greaterZero: 1,
  } )

  assertStrictEquals( res, "emptyObject nonEmptyString whitespace nonEmptyObject emptyList nonEmptyList greaterZero" )
})

Deno.test("handles all types of truthy and falsy property values as expected", () => {
  const className = {
    "one two three": true,
    "four five": false,
    class: [ "six", "seven", false, true, 0, null, { className: "nine" } ],
  }

  const res = seseg( { className, class: [ "ten", [ "eleven", [ "twelve", { thirteen: true } ] ] ] } )

  assertStrictEquals( res.replace( /\s+/g, " " ), "one two three six seven nine ten eleven twelve thirteen" )
})

Deno.test("seseg", () => {
  const cases = [
    [ null, "" ],
    [ undefined, "" ],
    [ [ "foo", null, "bar", undefined, "baz" ], "foo bar baz" ],
    [ [ "foo", [ null, [ "bar" ], [ undefined, [ "baz", "qux", "quux", "quuz", [ [ [ [ [ [ [ [ [
      "corge",
      "grault",
    ] ] ] ] ], "garply" ] ] ] ] ] ] ] ], "foo bar baz qux quux quuz corge grault garply" ],
    [
      [ "foo", [ 1 && "bar", { baz: false, bat: null }, [ "hello", [ "world" ] ] ], "cya" ],
      "foo bar hello world cya",
    ],
  ] satisfies [ ClassValue, string ][]

  for ( const [ options, expected ] of cases ) {
    assertStrictEquals( seseg( options ), expected )
  }
})

Deno.test("strings", () => {
  assertStrictEquals( seseg( "" ), "" )
  assertStrictEquals( seseg( "foo" ), "foo" )
  assertStrictEquals( seseg( "foo" ), "foo" )
  assertStrictEquals( seseg( false ), "" )
})

Deno.test("strings (variadic)", () => {
  assertStrictEquals( seseg( "" ), "" )
  assertStrictEquals( seseg( "foo", "bar" ), "foo bar" )
  assertStrictEquals( seseg( "foo", false, "baz" ), "foo baz" )
  assertStrictEquals( seseg( false, "bar", "baz", "" ), "bar baz" )
})

Deno.test("objects", () => {
  assertStrictEquals( seseg( {} ), "" )
  assertStrictEquals( seseg( { foo: true } ), "foo" )
  assertStrictEquals( seseg( { foo: true, bar: false } ), "foo" )
  assertStrictEquals( seseg( { foo: "hiya", bar: 1 } ), "foo bar" )
  assertStrictEquals( seseg( { foo: 1, bar: 0, baz: 1 } ), "foo baz" )
  assertStrictEquals( seseg( { "-foo": 1, "--bar": 1 } ), "-foo --bar" )
})

Deno.test("objects (variadic)", () => {
  assertStrictEquals( seseg( {}, {} ), "" )
  assertStrictEquals( seseg( { foo: 1 }, { bar: 2 } ), "foo bar" )
  assertStrictEquals( seseg( { foo: 1 }, null, { baz: 1, bat: 0 } ), "foo baz" )
  assertStrictEquals( seseg( { foo: 1 }, { bar: "a" }, { baz: null, bat: Number.POSITIVE_INFINITY } ), "foo bar bat" )
})

Deno.test("arrays", () => {
  assertStrictEquals( seseg( [] ), "" )
  assertStrictEquals( seseg( [ "foo" ] ), "foo" )
  assertStrictEquals( seseg( [ "foo", "bar" ] ), "foo bar" )
  assertStrictEquals( seseg( [ "foo", 0 && "bar", 1 && "baz" ] ), "foo baz" )
})

Deno.test("arrays (nested)", () => {
  assertStrictEquals( seseg( [ [ [] ] ] ), "" )
  assertStrictEquals( seseg( [ [ [ "foo" ] ] ] ), "foo" )
  assertStrictEquals( seseg( [ true, [ [ "foo" ] ] ] ), "foo" )
  assertStrictEquals( seseg( [ "foo", [ "bar", [ "", [ [ "baz" ] ] ] ] ] ), "foo bar baz" )
})

Deno.test("arrays (variadic)", () => {
  assertStrictEquals( seseg( [], [] ), "" )
  assertStrictEquals( seseg( [ "foo" ], [ "bar" ] ), "foo bar" )
  assertStrictEquals( seseg( [ "foo" ], null, [ "baz", "" ], true, "", [] ), "foo baz" )
})

Deno.test("arrays (no `push` escape)", () => {
  assertStrictEquals( seseg( { push: 1 } ), "push" )
  assertStrictEquals( seseg( { pop: true } ), "pop" )
  assertStrictEquals( seseg( { push: true } ), "push" )
  assertStrictEquals( seseg( "hello", { world: 1, push: true } ), "hello world push" )
})

Deno.test("functions", () => {
  const foo = () => {}
  // @ts-expect-error typings
  assertStrictEquals( seseg( foo, "hello" ), "hello" )
  // @ts-expect-error typings
  assertStrictEquals( seseg( foo, "hello", seseg ), "hello" )
  // @ts-expect-error typings
  assertStrictEquals( seseg( foo, "hello", [ foo, [ foo, seseg ], "world" ] ), "hello world" )
})

Deno.test("seseg", () => {
  const cases = [
    [ { class: "asdfasdf" }, "asdfasdf" ],
    [ { className: "asdfasdf" }, "asdfasdf" ],
    [
      [ { className: [ "foo", { bar: true, className: "buz" } ] }, "lol", [ "kek" ] ],
      "foo bar buz lol kek",
    ],
    [ null, "" ],
    [ undefined, "" ],
    [ false, "" ],
    [ "foo", "foo" ],
    [ [ "foo", undefined, "bar", undefined, "baz" ], "foo bar baz" ],
    [ [ "foo", [ undefined, [ "bar" ], [ undefined, [ "baz", "qux", "quux", "quuz", [ [ [
      [ [ [ [ [ [ "corge", "grault" ] ] ] ] ], "garply" ],
    ] ] ] ] ] ] ], "foo bar baz qux quux quuz corge grault garply" ],
    [ [
      "foo",
      [ 1 && "bar", { baz: false, bat: null }, [ "hello", [ "world" ] ] ],
      "cya",
    ], "foo bar hello world cya" ],
  ] satisfies [ ClassValue, string ][]

  for ( const [ options, expected ] of cases ) {
    assertStrictEquals( seseg( options ), expected )
  }
})
