export enum RangeFlag {
  Empty = 'empty',
  LowerBoundClosed = 'lowerClosed',
  UpperBoundClosed = 'upperClosed',
}

export class RangeParserError extends Error {
  name = 'RangeParserError'
}

export class Range<T extends {}> {
  constructor(
    public lower: T | null,
    public upper: T | null,
    private flags: RangeFlag[] = [],
  ) {}

  hasFlag(flag: RangeFlag): boolean {
    return this.flags.includes(flag)
  }

  hasFlags(flags: RangeFlag[]): boolean {
    return flags.every(flag => this.flags.includes(flag))
  }

  isEmpty(): boolean {
    return this.hasFlags([RangeFlag.Empty])
  }

  isLowerBoundClosed(): boolean {
    return this.hasFlag(RangeFlag.LowerBoundClosed)
  }

  isUpperBoundClosed(): boolean {
    return this.hasFlag(RangeFlag.UpperBoundClosed)
  }

  containsPoint(point: T): boolean {
    if (this.lower !== null && this.upper !== null) {
      const inLower = this.isLowerBoundClosed()
                ? this.lower <= point
        : this.lower < point
      const inUpper = this.isUpperBoundClosed()
                ? this.upper >= point
        : this.upper > point
      return inLower && inUpper
        }
    if (this.lower !== null) {
      return this.isLowerBoundClosed()
                ? this.lower <= point
        : this.lower < point
        }
    if (this.upper !== null) {
      return this.isUpperBoundClosed()
                ? this.upper >= point
        : this.upper > point
    }
    return true // Infinite range
  }

  containsRange(range: Range<T>): boolean {
    return (
      (!range.lower || this.containsPoint(range.lower)) &&
      (!range.upper || this.containsPoint(range.upper))
    )
  }
}

const EMPTY = 'empty'
const INFINITY = 'infinity'

export function parse<T extends {}>(
  input: string,
  transform: (value: string) => T = x => x as any,
): Range<T> {
  input = input.trim()
    if (input === EMPTY) {
    return new Range<T>(null, null, [RangeFlag.Empty])
    }

  let ptr = 0
  const flags: RangeFlag[] = []

    if (input[ptr] === '[') {
    flags.push(RangeFlag.LowerBoundClosed)
    ptr += 1
  } else if (input[ptr] === '(') {
    ptr += 1
  } else {
    throw new RangeParserError(
      `Unexpected character '${input[ptr]}'. Position: ${ptr}`,
    )
  }

  const range = new Range<T>(null, null, flags)

  ptr = parseBound(range, 'lower', input, ptr, transform)

    if (input[ptr] === ',') {
    ptr += 1
  } else {
    throw new RangeParserError(
      `Expected comma as the delimiter, got '${input[ptr]}'. Position: ${ptr}`,
    )
  }

  ptr = parseBound(range, 'upper', input, ptr, transform)

    if (input[ptr] === ']') {
    flags.push(RangeFlag.UpperBoundClosed)
    ptr += 1
  } else if (input[ptr] === ')') {
    ptr += 1
  } else {
    throw new RangeParserError(
      `Unexpected character '${input[ptr]}'. Position: ${ptr}`,
    )
  }

  return range
}

function parseBound<T extends {}>(
  range: Range<T>,
  key: 'lower' | 'upper',
  input: string,
  ptr: number,
  transform: (value: string) => T,
) {
  let ch = input[ptr]

  if (ch === ',' || ch === ')' || ch === ']') {
    return ptr
  }

  let inQuote = false
  let value = ''
  let pos = ptr

  while (
    inQuote ||
    !(input[ptr] === ',' || input[ptr] === ')' || input[ptr] === ']')
  ) {
    ch = input[ptr++]
            if (ch === undefined) {
      throw new RangeParserError(`Unexpected end of input. Position: ${ptr}`)
            }
            if (ch === '\\') {
                if (input[ptr] === undefined) {
        throw new RangeParserError(`Unexpected end of input. Position: ${ptr}`)
                }
      value += input.slice(pos, ptr - 1) + input[ptr]
      ptr += 1
      pos = ptr
    } else if (ch === '"') {
                if (!inQuote) {
        inQuote = true
        pos += 1
      } else if (input[ptr] === '"') {
        value += input.slice(pos, ptr - 1) + input[ptr]
        ptr += 1
        pos = ptr
      } else {
        inQuote = false
        value += input.slice(pos, ptr - 1)
        pos = ptr + 1
                }
            }
        }

        if (ptr > pos) {
    value += input.slice(pos, ptr)
  }

  if (!value.endsWith(INFINITY)) {
    range[key] = transform(value)
  }

  return ptr
}

export function serialize<T extends {}>(
  range: Range<T>,
  format: (value: T) => string = String,
): string {
  return range.isEmpty()
    ? EMPTY
    : (range.isLowerBoundClosed() ? '[' : '(') +
        (range.lower !== null ? serializeBound(format(range.lower)) : '') +
        ',' +
        (range.upper !== null ? serializeBound(format(range.upper)) : '') +
        (range.isUpperBoundClosed() ? ']' : ')')
}

function serializeBound(bnd: any): string {
  let needsQuotes = false
  let pos = 0
  let value = ''

    if (typeof bnd !== 'string') {
    if (typeof bnd === 'number' || typeof bnd === 'bigint') {
      return bnd.toString()
    }
    bnd = String(bnd)
    }

    if (bnd === null || bnd.length === 0) {
    return '""'
    }

  bnd = bnd.trim()
    for (let i = 0; i < bnd.length; i++) {
    const ch = bnd[i]
    if (
      ch === '"' ||
            ch === '\\' ||
            ch === '(' ||
            ch === ')' ||
            ch === '[' ||
            ch === ']' ||
            ch === ',' ||
      ch === ' '
    ) {
      needsQuotes = true
      break
        }
    }

    if (needsQuotes) {
    value += '"'
    }

  let ptr = 0
    for (; ptr < bnd.length; ptr++) {
    const ch = bnd[ptr]
        if (ch === '"' || ch === '\\') {
      value += bnd.slice(pos, ptr + 1) + ch
      pos = ptr + 1
        }
    }

    if (ptr > pos) {
    value += bnd.slice(pos, ptr)
    }

    if (needsQuotes) {
    value += '"'
  }

  return value
}
