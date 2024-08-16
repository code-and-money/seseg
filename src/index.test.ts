import test, { describe } from 'node:test'
import classic, { ClassValue } from './index.js'
import assert from 'node:assert/strict'

test('keeps object keys with truthy values', () => {
  assert.strictEqual(classic({ one: true, two: false, three: 0, four: null, five: undefined, six: 1 }), 'one six')
})

test('joins arrays of class names and ignore falsy values', () => {
  assert.strictEqual(classic('one', 0, null, undefined, true, 1, 'seven'), 'one 1 seven')
})

test('handles arrays that include falsy and true values', () => {
  assert.strictEqual(classic(['one', 0, null, undefined, false, true, 'seven']), 'one seven')
})

test('supports heterogenous arguments', () => {
  assert.strictEqual(
    classic({ one: true }, 'two', 0, false, 'five', [[{ six: true }]], {
      className: [{ seven: false }, [[{ eight: true }]]],
    }),
    'one two five six eight'
  )
})

test('should be trimmed', () => {
  assert.strictEqual(
    classic('', '                   two             three            ', { four: true, '                five              ': true }, '').replace(/\s+/g, ' '),
    'two three four five'
  )
})

test('returns an empty string for an empty configuration', () => {
  assert.strictEqual(classic({}), '')
})

test('supports an array of class names', () => {
  assert.strictEqual(classic(['one', 'two']), 'one two')
})

test('joins array arguments with string arguments', () => {
  assert.strictEqual(classic(['one', 'two'], 'three'), 'one two three')
  assert.strictEqual(classic('three', ['one', 'two']), 'three one two')
})

test('handles multiple array arguments', () => {
  assert.strictEqual(classic(['one', 'two'], ['three', 'four']), 'one two three four')
})

test('handles arrays that include arrays', () => {
  assert.strictEqual(classic(['one', ['two', 'three']]), 'one two three')
})

test('handles arrays that include objects', () => {
  assert.strictEqual(classic(['one', { two: true, three: false }]), 'one two')
})

test('handles deep array recursion', () => {
  assert.strictEqual(classic(['one', ['two', ['three', { four: true }]]]), 'one two three four')
})

test('handles arrays that are empty', () => {
  assert.strictEqual(classic('one', []), 'one')
})

test('handles nested arrays with nested arrays', () => {
  assert.strictEqual(classic([[[[[[[[], [], [[], [[]]], [[[[[[[[[[[['one']]]]]]]]]]]]]]]]]]]), 'one')
})

test('handles nested arrays that have empty nested arrays', () => {
  assert.strictEqual(
    classic([
      'one',
      [
        [
          [[[[[{}, {}]], {}, null]], { two: false }],
          // @ts-expect-error
          { three: () => {} },
        ],
      ],
    ]),
    'one'
  )
})

test('handles all types of truthy and falsy property values as expected', () => {
  // @ts-expect-error
  const res = classic({
    // These ARE causing TypeScript errors:

    function: Object.prototype.toString,
    emptyObject: {},

    // falsy:
    null: null,
    emptyString: '',
    noNumber: Number.NaN,
    zero: 0,
    negativeZero: -0,
    false: false,
    undefined: undefined,

    // truthy
    nonEmptyString: 'foobar',
    whitespace: ' ',
    nonEmptyObject: { a: 1, b: 2 },
    emptyList: [],
    nonEmptyList: [1, 2, 3],
    greaterZero: 1,
  })

  assert.strictEqual(res, 'emptyObject nonEmptyString whitespace nonEmptyObject emptyList nonEmptyList greaterZero')
})

test('handles all types of truthy and falsy property values as expected', () => {
  const className = {
    'one two three': true,
    'four five': false,
    class: ['six', 'seven', false, true, 0, null, { className: 'nine' }],
  }

  const res = classic({ className, class: ['ten', ['eleven', ['twelve', { thirteen: true }]]] })

  assert.strictEqual(res.replace(/\s+/g, ' '), 'one two three six seven nine ten eleven twelve thirteen')
})

describe('classic', () => {
  const cases = [
    [null, ''],
    [undefined, ''],
    [['foo', null, 'bar', undefined, 'baz'], 'foo bar baz'],
    [['foo', [null, ['bar'], [undefined, ['baz', 'qux', 'quux', 'quuz', [[[[[[[[['corge', 'grault']]]]], 'garply']]]]]]]], 'foo bar baz qux quux quuz corge grault garply'],
    [['foo', [1 && 'bar', { baz: false, bat: null }, ['hello', ['world']]], 'cya'], 'foo bar hello world cya'],
  ] satisfies [ClassValue, string][]

  for (const [options, expected] of cases) {
    assert.strictEqual(classic(options), expected)
  }
})

test('strings', () => {
  assert.strictEqual(classic(''), '')
  assert.strictEqual(classic('foo'), 'foo')
  assert.strictEqual(classic('foo'), 'foo')
  assert.strictEqual(classic(false), '')
})

test('strings (variadic)', () => {
  assert.strictEqual(classic(''), '')
  assert.strictEqual(classic('foo', 'bar'), 'foo bar')
  assert.strictEqual(classic('foo', false, 'baz'), 'foo baz')
  assert.strictEqual(classic(false, 'bar', 'baz', ''), 'bar baz')
})

test('objects', () => {
  assert.strictEqual(classic({}), '')
  assert.strictEqual(classic({ foo: true }), 'foo')
  assert.strictEqual(classic({ foo: true, bar: false }), 'foo')
  assert.strictEqual(classic({ foo: 'hiya', bar: 1 }), 'foo bar')
  assert.strictEqual(classic({ foo: 1, bar: 0, baz: 1 }), 'foo baz')
  assert.strictEqual(classic({ '-foo': 1, '--bar': 1 }), '-foo --bar')
})

test('objects (variadic)', () => {
  assert.strictEqual(classic({}, {}), '')
  assert.strictEqual(classic({ foo: 1 }, { bar: 2 }), 'foo bar')
  assert.strictEqual(classic({ foo: 1 }, null, { baz: 1, bat: 0 }), 'foo baz')
  assert.strictEqual(classic({ foo: 1 }, {}, {}, { bar: 'a' }, { baz: null, bat: Number.POSITIVE_INFINITY }), 'foo bar bat')
})

test('arrays', () => {
  assert.strictEqual(classic([]), '')
  assert.strictEqual(classic(['foo']), 'foo')
  assert.strictEqual(classic(['foo', 'bar']), 'foo bar')
  assert.strictEqual(classic(['foo', 0 && 'bar', 1 && 'baz']), 'foo baz')
})

test('arrays (nested)', () => {
  assert.strictEqual(classic([[[]]]), '')
  assert.strictEqual(classic([[['foo']]]), 'foo')
  assert.strictEqual(classic([true, [['foo']]]), 'foo')
  assert.strictEqual(classic(['foo', ['bar', ['', [['baz']]]]]), 'foo bar baz')
})

test('arrays (variadic)', () => {
  assert.strictEqual(classic([], []), '')
  assert.strictEqual(classic(['foo'], ['bar']), 'foo bar')
  assert.strictEqual(classic(['foo'], null, ['baz', ''], true, '', []), 'foo baz')
})

test('arrays (no `push` escape)', () => {
  assert.strictEqual(classic({ push: 1 }), 'push')
  assert.strictEqual(classic({ pop: true }), 'pop')
  assert.strictEqual(classic({ push: true }), 'push')
  assert.strictEqual(classic('hello', { world: 1, push: true }), 'hello world push')
})

test('functions', () => {
  const foo = () => {}
  // @ts-expect-error
  assert.strictEqual(classic(foo, 'hello'), 'hello')
  // @ts-expect-error
  assert.strictEqual(classic(foo, 'hello', classic), 'hello')
  // @ts-expect-error
  assert.strictEqual(classic(foo, 'hello', [[classic], 'world']), 'hello world')
})

describe('classic', () => {
  const cases = [
    [{ class: 'asdfasdf' }, 'asdfasdf'],
    [{ className: 'asdfasdf' }, 'asdfasdf'],
    [[{ className: ['foo', { bar: true, className: 'buz' }] }, 'lol', ['kek']], 'foo bar buz lol kek'],
    [null, ''],
    [undefined, ''],
    [false, ''],
    ['foo', 'foo'],
    [['foo', undefined, 'bar', undefined, 'baz'], 'foo bar baz'],
    [['foo', [undefined, ['bar'], [undefined, ['baz', 'qux', 'quux', 'quuz', [[[[[[[[['corge', 'grault']]]]], 'garply']]]]]]]], 'foo bar baz qux quux quuz corge grault garply'],
    [['foo', [1 && 'bar', { baz: false, bat: null }, ['hello', ['world']]], 'cya'], 'foo bar hello world cya'],
  ] satisfies [ClassValue, string][]

  for (const [options, expected] of cases) {
    assert.strictEqual(classic(options), expected)
  }
})
