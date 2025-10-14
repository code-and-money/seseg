import { type ClassValue, seseg } from "./exports";
import { test } from "bun:test";
import assert from "node:assert/strict";

test("keeps object keys with truthy values", () => {
  assert.strictEqual(
    seseg({
      one: true,
      two: false,
      three: 0,
      four: null,
      five: undefined,
      six: 1,
    }),
    "one six",
  );
});

test("joins arrays of class names and ignore falsy values", () => {
  assert.strictEqual(seseg("one", 0, null, undefined, true, 1, "seven"), "one 1 seven");
});

test("handles arrays that include falsy and true values", () => {
  assert.strictEqual(seseg(["one", 0, null, undefined, false, true, "seven"]), "one seven");
});

test("supports heterogenous arguments", () => {
  assert.strictEqual(
    seseg(0, false, "two", "five", { one: true }, [[{ six: true }]], {
      className: [{ seven: false }, [[{ eight: true }]]],
    }),
    "two five one six eight",
  );
});

test("should be trimmed", () => {
  assert.strictEqual(
    seseg(
      "",
      `          \n\n\n       two       
      
      
      
      \n\n\n  \r\n  three    \n\n\n    \n\r \r\n
       
      
       
       
      `,
      { four: true, "                five              ": true },
      "",
    ),
    "two three four five",
  );
});

test("returns an empty string for an empty configuration", () => {
  assert.strictEqual(seseg({}), "");
});

test("supports an array of class names", () => {
  assert.strictEqual(seseg(["one", "two"]), "one two");
});

test("joins array arguments with string arguments", () => {
  assert.strictEqual(seseg(["one", "two"], "three"), "one two three");
  assert.strictEqual(seseg("three", ["one", "two"]), "three one two");
});

test("handles multiple array arguments", () => {
  assert.strictEqual(seseg(["one", "two"], ["three", "four"]), "one two three four");
});

test("handles arrays that include arrays", () => {
  assert.strictEqual(seseg(["one", ["two", "three"]]), "one two three");
});

test("handles arrays that include objects", () => {
  assert.strictEqual(seseg(["one", { two: true, three: false }]), "one two");
});

test("handles deep array recursion", () => {
  assert.strictEqual(seseg(["one", ["two", ["three", { four: true }]]]), "one two three four");
});

test("handles arrays that are empty", () => {
  assert.strictEqual(seseg("one", []), "one");
});

test("handles nested arrays with nested arrays", () => {
  assert.strictEqual(seseg([[[[[[[[], [], [[], [[]]], [[[[[[[[[[[["one"]]]]]]]]]]]]]]]]]]]), "one");
});

test("handles nested arrays that have empty nested arrays", () => {
  assert.strictEqual(
    seseg([
      "one",
      [
        [
          [[[[[{}, {}]], {}, null]], { two: false }],
          // @ts-expect-error typings
          { three: () => {} },
        ],
      ],
    ]),
    "one",
  );
});

test("handles all types of truthy and falsy property values as expected", () => {
  // @ts-expect-error typings
  const res = seseg({
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
    nonEmptyList: [1, 2, 3],
    greaterZero: 1,
  });

  assert.strictEqual(res, "emptyObject nonEmptyString whitespace nonEmptyObject emptyList nonEmptyList greaterZero");
});

test("handles all types of truthy and falsy property values as expected", () => {
  const className = {
    "one two three": true,
    "four five": false,
    class: ["six", "seven", false, true, 0, null, { className: "nine" }],
  };

  const res = seseg({
    className,
    class: ["ten", ["eleven", ["twelve", { thirteen: true }]]],
  });

  assert.strictEqual(res.replace(/\s+/g, " "), "one two three six seven nine ten eleven twelve thirteen");
});

test("seseg", () => {
  const cases = [
    [null, ""],
    [undefined, ""],
    [["foo", null, "bar", undefined, "baz"], "foo bar baz"],
    [
      ["foo", [null, ["bar"], [undefined, ["baz", "qux", "quux", "quuz", [[[[[[[[["corge", "grault"]]]]], "garply"]]]]]]]],
      "foo bar baz qux quux quuz corge grault garply",
    ],
    [["foo", [1 && "bar", { baz: false, bat: null }, ["hello", ["world"]]], "cya"], "foo bar hello world cya"],
  ] satisfies [ClassValue, string][];

  for (const [options, expected] of cases) {
    assert.strictEqual(seseg(options), expected);
  }
});

test("strings", () => {
  assert.strictEqual(seseg(""), "");
  assert.strictEqual(seseg("foo"), "foo");
  assert.strictEqual(seseg("foo"), "foo");
  assert.strictEqual(seseg(false), "");
});

test("strings (variadic)", () => {
  assert.strictEqual(seseg(""), "");
  assert.strictEqual(seseg("foo", "bar"), "foo bar");
  assert.strictEqual(seseg("foo", false, "baz"), "foo baz");
  assert.strictEqual(seseg(false, "bar", "baz", ""), "bar baz");
});

test("objects", () => {
  assert.strictEqual(seseg({}), "");
  assert.strictEqual(seseg({ foo: true }), "foo");
  assert.strictEqual(seseg({ foo: true, bar: false }), "foo");
  assert.strictEqual(seseg({ foo: "hiya", bar: 1 }), "foo bar");
  assert.strictEqual(seseg({ foo: 1, bar: 0, baz: 1 }), "foo baz");
  assert.strictEqual(seseg({ "-foo": 1, "--bar": 1 }), "-foo --bar");
});

test("objects (variadic)", () => {
  assert.strictEqual(seseg({}, {}), "");
  assert.strictEqual(seseg({ foo: 1 }, { bar: 2 }), "foo bar");
  assert.strictEqual(seseg({ foo: 1 }, null, { baz: 1, bat: 0 }), "foo baz");
  assert.strictEqual(
    seseg(
      { foo: 1 },
      { bar: "a" },
      {
        baz: null,
        bat: Number.POSITIVE_INFINITY,
      },
    ),
    "foo bar bat",
  );
});

test("arrays", () => {
  assert.strictEqual(seseg([]), "");
  assert.strictEqual(seseg(["foo"]), "foo");
  assert.strictEqual(seseg(["foo", "bar"]), "foo bar");
  assert.strictEqual(seseg(["foo", 0 && "bar", 1 && "baz"]), "foo baz");
});

test("arrays (nested)", () => {
  assert.strictEqual(seseg([[[]]]), "");
  assert.strictEqual(seseg([[["foo"]]]), "foo");
  assert.strictEqual(seseg([true, [["foo"]]]), "foo");
  assert.strictEqual(seseg(["foo", ["bar", ["", [["baz"]]]]]), "foo bar baz");
});

test("arrays (variadic)", () => {
  assert.strictEqual(seseg([], []), "");
  assert.strictEqual(seseg(["foo"], ["bar"]), "foo bar");
  assert.strictEqual(seseg(["foo"], null, ["baz", ""], true, "", []), "foo baz");
});

test("arrays (no `push` escape)", () => {
  assert.strictEqual(seseg({ push: 1 }), "push");
  assert.strictEqual(seseg({ pop: true }), "pop");
  assert.strictEqual(seseg({ push: true }), "push");
  assert.strictEqual(seseg("hello", { world: 1, push: true }), "hello world push");
});

test("functions", () => {
  const foo = () => {};
  assert.strictEqual(
    seseg(
      // @ts-expect-error typings
      foo,
      "hello",
    ),
    "hello",
  );
  assert.strictEqual(
    seseg(
      // @ts-expect-error typings
      foo,
      "hello",
      seseg,
    ),
    "hello",
  );
  assert.strictEqual(
    seseg(
      // @ts-expect-error typings
      foo,
      "hello",
      [foo, [foo, seseg], "world"],
    ),
    "hello world",
  );
});

test("seseg", () => {
  const cases = [
    [{ class: "asdfasdf" }, "asdfasdf"],
    [{ className: "asdfasdf" }, "asdfasdf"],
    [[{ className: ["foo", { bar: true, className: "buz" }] }, "lol", ["kek"]], "foo bar buz lol kek"],
    [null, ""],
    [undefined, ""],
    [false, ""],
    ["foo", "foo"],
    [["foo", undefined, "bar", undefined, "baz"], "foo bar baz"],
    [
      ["foo", [undefined, ["bar"], [undefined, ["baz", "qux", "quux", "quuz", [[[[[[[[["corge", "grault"]]]]], "garply"]]]]]]]],
      "foo bar baz qux quux quuz corge grault garply",
    ],
    [["foo", [1 && "bar", { baz: false, bat: null }, ["hello", ["world"]]], "cya"], "foo bar hello world cya"],
  ] satisfies [ClassValue, string][];

  for (const [options, expected] of cases) {
    assert.strictEqual(seseg(options), expected);
  }
});
