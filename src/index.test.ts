import { describe, expect, test } from 'vitest'
import { Range, RangeFlag, parse, serialize } from './index'

describe('parse', () => {
  const cases = [
    ['empty', new Range(null, null, [RangeFlag.Empty])],
    ['(,)', new Range(null, null)],
    ['(-infinity,infinity)', new Range(null, null)],
    ['(0,)', new Range('0', null)],
    ['(0,10)', new Range('0', '10')],
    ['(,10)', new Range(null, '10')],
    ['(0,1]', new Range('0', '1', [RangeFlag.UpperBoundClosed])],
    [
      '[0,1]',
      new Range('0', '1', [
        RangeFlag.LowerBoundClosed,
        RangeFlag.UpperBoundClosed,
      ]),
    ],
    ['[0,1)', new Range('0', '1', [RangeFlag.LowerBoundClosed])],
  ] as const

  for (const [input, output] of cases) {
    test(input, () => {
      expect(parse(input)).toStrictEqual(output)
    })
  }
})

describe('parse: integer', () => {
  const cases = [
    ['empty', new Range(null, null, [RangeFlag.Empty])],
    ['(,)', new Range(null, null)],
    ['(0,)', new Range(0, null)],
    ['(0,10)', new Range(0, 10, [])],
    ['(,10)', new Range(null, 10)],
    ['(0,1]', new Range(0, 1, [RangeFlag.UpperBoundClosed])],
    [
      '[0,1]',
      new Range(0, 1, [RangeFlag.LowerBoundClosed, RangeFlag.UpperBoundClosed]),
    ],
    ['[0,1)', new Range(0, 1, [RangeFlag.LowerBoundClosed])],
  ] as const

  for (const [input, output] of cases) {
    test(input, () => {
      const actual = parse(input, x => Number.parseInt(x, 10))
      expect(actual).toStrictEqual(output)
    })
  }
})

describe('parse: strings', () => {
  const cases = [
    ['(,"")', new Range(null, '')],
    ['("",)', new Range('', null)],
    ['(A,Z)', new Range('A', 'Z', [])],
    ['("A","Z")', new Range('A', 'Z', [])],
    ['("""A""","""Z""")', new Range('"A"', '"Z"', [])],
    ['("\\"A\\"","\\"Z\\"")', new Range('"A"', '"Z"', [])],
    ['("\\(A\\)","\\(Z\\)")', new Range('(A)', '(Z)', [])],
    ['("\\[A\\]","\\[Z\\]")', new Range('[A]', '[Z]', [])],
  ] as const

  for (const [input, output] of cases) {
    test(input, () => {
      const actual = parse(input)
      expect(actual).toStrictEqual(output)
    })
  }
})

describe('serialize: strings', () => {
  const cases = [
    ['(,"")', new Range(null, '')],
    ['("",)', new Range('', null)],
    ['("""A""","""Z""")', new Range('"A"', '"Z"', [])],
    ['("\\\\A\\\\","\\\\Z\\\\")', new Range('\\A\\', '\\Z\\', [])],
    ['("(A)","(Z)")', new Range('(A)', '(Z)', [])],
    ['("[A]","[Z]")', new Range('[A]', '[Z]', [])],
  ] as const

  for (const [output, input] of cases) {
    test(output, () => {
      const actual = serialize(input)
      expect(actual).toStrictEqual(output)
    })
  }
})

describe('serialize: numbers', () => {
  const cases = [
    ['(,0)', new Range(null, 0)],
    ['(0,)', new Range(0, null)],
    ['(1.1,9.9)', new Range(1.1, 9.9)],
  ] as const

  for (const [output, input] of cases) {
    test(output, () => {
      const actual = serialize(input)
      expect(actual).toStrictEqual(output)
    })
  }
})

describe('Range methods', () => {
  test('[1, 10).containsPoint(5) is true', () => {
    const range = parse('[1, 10)', x => Number.parseInt(x))
    expect(range.containsPoint(5)).toBe(true)
  })

  test('[1, 10).containsPoint(-5) is false', () => {
    const range = parse('[1, 10)', x => Number.parseInt(x))
    expect(range.containsPoint(-5)).toBe(false)
  })

  test('[1, 10).containsRange([1, 3]) is true', () => {
    const range1 = parse('[1, 10)', x => Number.parseInt(x))
    const range2 = parse('[1, 3]', x => Number.parseInt(x))
    expect(range1.containsRange(range2)).toBe(true)
  })

  test('[1, 10).containsRange([-1, 3]) is false', () => {
    const range1 = parse('[1, 10)', x => Number.parseInt(x))
    const range2 = parse('[-1, 3]', x => Number.parseInt(x))
    expect(range1.containsRange(range2)).toBe(false)
  })
})
