/**
 * Name Detector Module for Compromise NLP
 *
 * This module extends the compromise NLP library with a custom lexicon of
 * international names (87,000+ entries from 105 countries) to improve
 * person name detection accuracy.
 *
 * @module name-detector
 * @see https://github.com/spencermountain/compromise
 * @see https://github.com/philipperemy/name-dataset
 */

import nlp from 'compromise';
import { nameLexicon } from './names-lexicon';

// =============================================================================
// Types
// =============================================================================

/**
 * Represents a detected person with parsed name components.
 */
export interface DetectedPerson {
  /** The full text of the detected name */
  text: string;
  /** The first/given name if detected */
  firstName?: string;
  /** The last/family name if detected */
  lastName?: string;
}

/**
 * Result of name detection analysis.
 */
export interface NameDetectionResult {
  /** Whether any names were found in the text */
  hasNames: boolean;
  /** Array of detected name strings */
  names: string[];
  /** Array of parsed person objects with name components */
  people: DetectedPerson[];
}

/**
 * Term object from compromise's JSON output.
 */
interface CompromiseTerm {
  text: string;
  normal?: string;
  tags?: string[];
}

/**
 * Match object from compromise's JSON output.
 */
interface CompromiseMatch {
  text: string;
  terms?: CompromiseTerm[];
}

// =============================================================================
// Initialization
// =============================================================================

/**
 * Extend compromise with the custom name lexicon.
 * This adds ~87,000 first and last names from 105 countries.
 *
 * The extension happens once at module load time, making all
 * subsequent nlp() calls aware of the additional names.
 */
nlp.extend({
  words: nameLexicon,
});

// =============================================================================
// Detection Functions
// =============================================================================

/**
 * Detects person names in text and returns detailed information.
 *
 * This function uses compromise's `.people()` method to find person entities,
 * then parses the results to extract first and last name components.
 *
 * @param text - The text to analyze for person names
 * @returns Object containing detection results with parsed name components
 *
 * @example
 * ```typescript
 * const result = detectNames('Navin Goyal met with Priya Sharma.');
 * // {
 * //   hasNames: true,
 * //   names: ['Navin Goyal', 'Priya Sharma'],
 * //   people: [
 * //     { text: 'Navin Goyal', firstName: 'Navin', lastName: 'Goyal' },
 * //     { text: 'Priya Sharma', firstName: 'Priya', lastName: 'Sharma' }
 * //   ]
 * // }
 * ```
 */
export function detectNames(text: string): NameDetectionResult {
  if (!text || typeof text !== 'string') {
    return { hasNames: false, names: [], people: [] };
  }

  const doc = nlp(text);
  const people = doc.people();

  if (!people.found) {
    return { hasNames: false, names: [], people: [] };
  }

  const names = people.out('array') as string[];

  const parsedPeople: DetectedPerson[] = (people.json() as CompromiseMatch[]).map(
    (match: CompromiseMatch) => {
      const result: DetectedPerson = {
        text: match.text,
      };

      const terms = match.terms || [];

      const firstNameTerm = terms.find(
        (term: CompromiseTerm) => term.tags?.includes('FirstName')
      );
      const lastNameTerm = terms.find(
        (term: CompromiseTerm) => term.tags?.includes('LastName')
      );

      if (firstNameTerm) {
        result.firstName = firstNameTerm.text;
      }
      if (lastNameTerm) {
        result.lastName = lastNameTerm.text;
      }

      return result;
    }
  );

  return {
    hasNames: true,
    names,
    people: parsedPeople,
  };
}

/**
 * Checks if the given text contains any person names.
 *
 * This is a lightweight check that returns a boolean without
 * parsing the name components.
 *
 * @param text - The text to check for person names
 * @returns True if at least one person name is detected
 *
 * @example
 * ```typescript
 * containsPersonName('Hello, John Smith!'); // true
 * containsPersonName('The weather is nice.'); // false
 * ```
 */
export function containsPersonName(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  return nlp(text).people().found;
}

/**
 * Extracts all person names from text as an array of strings.
 *
 * @param text - The text to extract names from
 * @returns Array of detected name strings
 *
 * @example
 * ```typescript
 * extractNames('Dr. Wei Zhang and Maria Garcia attended.');
 * // ['Wei Zhang', 'Maria Garcia']
 * ```
 */
export function extractNames(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  return nlp(text).people().out('array') as string[];
}

// =============================================================================
// Exports
// =============================================================================

/**
 * Re-export the extended nlp instance for direct use.
 *
 * This allows consumers to use the full compromise API with
 * the custom name lexicon already loaded.
 *
 * @example
 * ```typescript
 * import { nlp } from './name-detector';
 *
 * const doc = nlp('Navin Goyal is here.');
 * doc.people().json();
 * ```
 */
export { nlp };

/**
 * Re-export the lexicon for inspection or custom use.
 */
export { nameLexicon };
