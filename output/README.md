# Name Lexicon for Compromise NLP

This package provides an extended name lexicon for the [compromise](https://github.com/spencermountain/compromise) NLP library, enabling better detection of international person names.

## Overview

The default compromise lexicon contains ~14,000 words and may miss names from non-Western cultures. This lexicon extends it with **87,039 names** from **105 countries**, including:

- 60,671 first names (both male and female)
- 26,368 last names

Names are sourced from the [name-dataset](https://github.com/philipperemy/name-dataset) library, which was compiled from Facebook's 533M user dataset.

## Installation

### 1. Install Dependencies

```bash
npm install compromise
```

### 2. Copy the Lexicon Files

Copy the files from this directory to your TypeScript/JavaScript project:

```
output/
├── names-lexicon.ts      # TypeScript module
├── names-lexicon.json    # Raw JSON (for other uses)
├── names-lexicon.mjs     # ESM module
├── names-lexicon.cjs     # CommonJS module
├── name-detector.ts      # TypeScript integration module
└── name-detector.test.ts # Test suite
```

## Usage

### Quick Start (TypeScript)

```typescript
import { detectNames, containsPersonName, extractNames } from './name-detector';

// Check if text contains a person name
containsPersonName('Navin Goyal is the CEO'); // true
containsPersonName('The weather is nice');    // false

// Extract all names as strings
extractNames('Priya Sharma and John Smith met.');
// ['Priya Sharma', 'John Smith']

// Get detailed detection results
detectNames('Navin Goyal is the CEO.');
// {
//   hasNames: true,
//   names: ['Navin Goyal'],
//   people: [
//     { text: 'Navin Goyal', firstName: 'Navin', lastName: 'Goyal' }
//   ]
// }
```

### Direct Compromise Usage

If you prefer to use compromise directly:

```typescript
import nlp from 'compromise';
import { nameLexicon } from './names-lexicon';

// Extend compromise with the custom lexicon
nlp.extend({ words: nameLexicon });

// Now use compromise as usual
const doc = nlp('Wei Zhang and Maria Garcia attended.');
doc.people().out('array'); // ['Wei Zhang', 'Maria Garcia']
```

### Using the JSON File

For non-TypeScript projects or custom integrations:

```javascript
const compromise = require('compromise');
const lexicon = require('./names-lexicon.json');

// Pass lexicon inline
const doc = compromise('Ahmed Hassan is here', lexicon);
doc.people().text(); // 'Ahmed Hassan'

// Or extend globally
compromise.extend({ words: lexicon });
```

## API Reference

### `detectNames(text: string): NameDetectionResult`

Analyzes text for person names and returns detailed information.

**Returns:**
```typescript
interface NameDetectionResult {
  hasNames: boolean;      // Whether any names were found
  names: string[];        // Array of detected name strings
  people: DetectedPerson[]; // Parsed name components
}

interface DetectedPerson {
  text: string;           // Full name text
  firstName?: string;     // Given name (if detected)
  lastName?: string;      // Family name (if detected)
}
```

### `containsPersonName(text: string): boolean`

Returns `true` if the text contains at least one person name.

### `extractNames(text: string): string[]`

Returns an array of detected person name strings.

## Supported Regions

The lexicon includes names from 105 countries across all continents:

- **South Asia**: India, Pakistan, Bangladesh, Sri Lanka, Nepal
- **East Asia**: China, Japan, Korea, Taiwan, Hong Kong
- **Middle East**: Saudi Arabia, UAE, Egypt, Turkey, Iran, Iraq
- **Europe**: UK, Germany, France, Italy, Spain, Netherlands, Poland
- **Americas**: USA, Canada, Mexico, Brazil, Argentina
- **Africa**: Nigeria, South Africa, Egypt, Kenya
- And many more...

## Regenerating the Lexicon

To regenerate the lexicon with different parameters:

```bash
# Install Python dependencies
pip install names-dataset pycountry

# Run extraction (default: top 500 names per country)
python scripts/extract_names.py --top-n 500 --output output

# For more comprehensive coverage
python scripts/extract_names.py --top-n 1000 --output output
```

**Note:** The name-dataset library requires ~3.2GB of RAM to load.

## Running Tests

```bash
# Install test dependencies
npm install -D vitest

# Run tests
npx vitest name-detector.test.ts
```

## File Sizes

| File | Size |
|------|------|
| names-lexicon.json | ~2.2 MB |
| names-lexicon.ts | ~2.2 MB |
| names-lexicon.mjs | ~2.2 MB |
| names-lexicon.cjs | ~2.2 MB |

## Limitations

1. **Ambiguous names**: Some names can be both first and last names (e.g., "Jordan"). These are tagged as `FirstName` by default; compromise uses context to disambiguate.

2. **Memory**: The lexicon adds ~10-30 MB to memory usage when loaded.

3. **False positives**: Common words that happen to be names may be detected (e.g., "Rose", "Faith").

4. **Script support**: Non-Latin script names (Arabic, Chinese characters) work best when transliterated to Latin characters.

## License

The lexicon data is derived from [name-dataset](https://github.com/philipperemy/name-dataset) which is licensed under Apache-2.0.

## Credits

- [compromise](https://github.com/spencermountain/compromise) - NLP library by Spencer Kelly
- [name-dataset](https://github.com/philipperemy/name-dataset) - Name database by Philippe Remy
