/**
 * Test Suite for Name Detector Module
 *
 * Tests the name detection functionality with names from various
 * regions and languages to ensure the extended lexicon works correctly.
 *
 * Run with: npx jest name-detector.test.ts
 * Or with vitest: npx vitest name-detector.test.ts
 */

import { describe, test, expect } from 'vitest';
import {
  detectNames,
  containsPersonName,
  extractNames,
  NameDetectionResult,
} from './name-detector';

// =============================================================================
// Indian Names (South Asian)
// =============================================================================

describe('Indian Names', () => {
  test('detects "Navin Goyal" as a person name', () => {
    const result = detectNames('Navin Goyal is the CEO.');
    expect(result.hasNames).toBe(true);
    expect(result.names).toContain('Navin Goyal');
  });

  test('detects "Priya Sharma" as a person name', () => {
    const result = detectNames('Priya Sharma joined the team.');
    expect(result.hasNames).toBe(true);
    expect(result.names).toContain('Priya Sharma');
  });

  test('detects multiple Indian names in one sentence', () => {
    const text = 'Rajesh Kumar and Anita Desai attended the meeting.';
    const result = detectNames(text);
    expect(result.hasNames).toBe(true);
    expect(result.names.length).toBeGreaterThanOrEqual(1);
  });

  test('containsPersonName returns true for Indian names', () => {
    expect(containsPersonName('Vikram Singh is here.')).toBe(true);
  });

  test('extractNames returns Indian names as array', () => {
    const names = extractNames('Sunita Patel works here.');
    expect(names.length).toBeGreaterThanOrEqual(1);
  });
});

// =============================================================================
// Chinese and East Asian Names
// =============================================================================

describe('Chinese and East Asian Names', () => {
  test('detects "Wei Zhang" as a person name', () => {
    const result = detectNames('Wei Zhang presented the report.');
    expect(result.hasNames).toBe(true);
  });

  test('detects "Li Chen" as a person name', () => {
    expect(containsPersonName('Li Chen is the manager.')).toBe(true);
  });

  test('detects Japanese names', () => {
    const result = detectNames('Yuki Tanaka joined us.');
    expect(result.hasNames).toBe(true);
  });

  test('detects Korean names', () => {
    const result = detectNames('Kim Min-jun is the director.');
    expect(result.hasNames).toBe(true);
  });

  test('extractNames works for East Asian names', () => {
    const names = extractNames('Wang Lei and Sato Kenji met today.');
    expect(names.length).toBeGreaterThanOrEqual(1);
  });
});

// =============================================================================
// Arabic and Middle Eastern Names
// =============================================================================

describe('Arabic and Middle Eastern Names', () => {
  test('detects "Ahmed Hassan" as a person name', () => {
    const result = detectNames('Ahmed Hassan is the founder.');
    expect(result.hasNames).toBe(true);
  });

  test('detects "Fatima Ali" as a person name', () => {
    expect(containsPersonName('Fatima Ali works here.')).toBe(true);
  });

  test('detects "Mohammed" as a first name', () => {
    const result = detectNames('Mohammed Ibrahim attended.');
    expect(result.hasNames).toBe(true);
  });

  test('detects Persian/Iranian names', () => {
    const result = detectNames('Dariush Ahmadi is present.');
    expect(result.hasNames).toBe(true);
  });

  test('detects Turkish names', () => {
    expect(containsPersonName('Mehmet Yilmaz is the CEO.')).toBe(true);
  });
});

// =============================================================================
// Western Names
// =============================================================================

describe('Western Names', () => {
  test('detects "John Smith" as a person name', () => {
    const result = detectNames('John Smith wrote the book.');
    expect(result.hasNames).toBe(true);
    expect(result.names).toContain('John Smith');
  });

  test('detects "Maria Garcia" as a person name', () => {
    const result = detectNames('Maria Garcia is the director.');
    expect(result.hasNames).toBe(true);
  });

  test('detects German names', () => {
    expect(containsPersonName('Hans Mueller is here.')).toBe(true);
  });

  test('detects French names', () => {
    const result = detectNames('Jean-Pierre Dupont arrived.');
    expect(result.hasNames).toBe(true);
  });

  test('detects Italian names', () => {
    expect(containsPersonName('Giuseppe Rossi is the chef.')).toBe(true);
  });

  test('detects names with honorifics', () => {
    const result = detectNames('Dr. Sarah Johnson presented.');
    expect(result.hasNames).toBe(true);
  });

  test('extractNames works for Western names', () => {
    const names = extractNames('Michael Brown and Emily Davis met.');
    expect(names.length).toBeGreaterThanOrEqual(1);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('Edge Cases', () => {
  test('returns empty result for empty string', () => {
    const result = detectNames('');
    expect(result.hasNames).toBe(false);
    expect(result.names).toEqual([]);
    expect(result.people).toEqual([]);
  });

  test('returns empty result for null/undefined input', () => {
    expect(detectNames(null as unknown as string).hasNames).toBe(false);
    expect(detectNames(undefined as unknown as string).hasNames).toBe(false);
  });

  test('returns false for text without names', () => {
    expect(containsPersonName('The weather is nice today.')).toBe(false);
  });

  test('returns false for numbers only', () => {
    expect(containsPersonName('123 456 789')).toBe(false);
  });

  test('returns empty array for text without names', () => {
    expect(extractNames('Hello world!')).toEqual([]);
  });

  test('handles mixed content with names', () => {
    const text = 'On January 5th, Navin Goyal presented at 123 Main Street.';
    const result = detectNames(text);
    expect(result.hasNames).toBe(true);
    expect(result.names.length).toBeGreaterThanOrEqual(1);
  });

  test('handles text with only first name', () => {
    const result = containsPersonName('Hello John!');
    expect(typeof result).toBe('boolean');
  });

  test('handles very long text', () => {
    const longText = 'John Smith '.repeat(100) + 'is here.';
    const result = detectNames(longText);
    expect(result.hasNames).toBe(true);
  });

  test('handles special characters in text', () => {
    const text = "It's Maria's book, written by John O'Brien.";
    const result = detectNames(text);
    expect(result.hasNames).toBe(true);
  });

  test('handles unicode names', () => {
    const text = 'José García and François Müller met.';
    const result = detectNames(text);
    expect(result.hasNames).toBe(true);
  });
});

// =============================================================================
// Return Type Validation
// =============================================================================

describe('Return Type Validation', () => {
  test('detectNames returns correct structure', () => {
    const result: NameDetectionResult = detectNames('John Smith is here.');

    expect(result).toHaveProperty('hasNames');
    expect(result).toHaveProperty('names');
    expect(result).toHaveProperty('people');
    expect(typeof result.hasNames).toBe('boolean');
    expect(Array.isArray(result.names)).toBe(true);
    expect(Array.isArray(result.people)).toBe(true);
  });

  test('people array contains correct structure', () => {
    const result = detectNames('Navin Goyal is the CEO.');

    if (result.people.length > 0) {
      const person = result.people[0];
      expect(person).toHaveProperty('text');
      expect(typeof person.text).toBe('string');
    }
  });

  test('extractNames returns string array', () => {
    const names = extractNames('John Smith and Jane Doe met.');
    expect(Array.isArray(names)).toBe(true);
    names.forEach((name) => {
      expect(typeof name).toBe('string');
    });
  });

  test('containsPersonName returns boolean', () => {
    expect(typeof containsPersonName('Hello John')).toBe('boolean');
    expect(typeof containsPersonName('Hello world')).toBe('boolean');
  });
});
