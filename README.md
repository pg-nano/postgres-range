# postgres-range

Parse and serialize PostgreSQL range types.

⚠️ **This package is unreleased.** It gets bundled into `pg-nano`.

## Usage

```sh
import { Range, RangeFlag, RangeParserError } from 'pg-nano'
```

### Enums

#### `RangeFlag`

An enumeration of flags used to describe range properties.

- `Empty`: Indicates an empty range
- `LowerBoundClosed`: Indicates a closed lower bound
- `UpperBoundClosed`: Indicates a closed upper bound

### Classes

#### `RangeParserError`

A custom error class for range parsing errors.

#### `Range<T>`

A class representing a range of values of type `T`.

##### Constructor
- `constructor(lower: T | null, upper: T | null, flags: RangeFlag[] = [])`

##### Methods
- `hasFlag(flag: RangeFlag): boolean`: Checks if the range has a specific flag
- `hasFlags(flags: RangeFlag[]): boolean`: Checks if the range has all the specified flags
- `isEmpty(): boolean`: Checks if the range is empty
- `isLowerBoundClosed(): boolean`: Checks if the lower bound is closed
- `isUpperBoundClosed(): boolean`: Checks if the upper bound is closed
- `containsPoint(point: T): boolean`: Checks if the range contains a specific point
- `containsRange(range: Range<T>): boolean`: Checks if the range contains another range

### Functions

#### `parse<T>(input: string, transform?: (value: string) => T): Range<T>`

Parses a string representation of a range into a `Range<T>` object.

#### `serialize<T>(range: Range<T>, format?: (value: T) => string): string`

Serializes a `Range<T>` object into its string representation.
