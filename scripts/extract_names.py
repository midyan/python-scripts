#!/usr/bin/env python3
"""
Extract first and last names from the name-dataset library and export them
in formats suitable for compromise NLP integration.

This script extracts the top N names per country from the name-dataset library
(730K+ first names, 983K+ last names from 105 countries) and generates lexicon
files that can be imported into compromise NLP to improve person name detection.

Source: https://github.com/philipperemy/name-dataset

Usage:
    python scripts/extract_names.py --top-n 500 --output output

Output files:
    - names-lexicon.json: Raw JSON lexicon
    - names-lexicon.ts: TypeScript module
    - names-lexicon.mjs: ESM JavaScript module
    - names-lexicon.cjs: CommonJS module

Note: The name-dataset library requires approximately 3.2GB of RAM to load.
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, Set

from names_dataset import NameDataset


def initialize_dataset() -> NameDataset:
    """
    Initialize the NameDataset. This loads the full database into memory.
    
    Returns:
        NameDataset: Initialized dataset object
        
    Note:
        This operation requires ~3.2GB of RAM and may take a minute to complete.
    """
    print("Loading name dataset (this may take a minute and ~3.2GB RAM)...")
    return NameDataset()


def get_country_codes(nd: NameDataset) -> list:
    """
    Get all available country codes from the dataset.
    
    Args:
        nd: Initialized NameDataset object
        
    Returns:
        List of ISO 3166-1 alpha-2 country codes (e.g., ['US', 'IN', 'DE'])
    """
    return nd.get_country_codes(alpha_2=True)


def extract_first_names(
    nd: NameDataset,
    country_codes: list,
    top_n: int
) -> Set[str]:
    """
    Extract the top N first names per country for both genders.
    
    Args:
        nd: Initialized NameDataset object
        country_codes: List of country codes to process
        top_n: Number of top names to extract per country per gender
        
    Returns:
        Set of unique first names (title-cased as returned by the library)
    """
    first_names: Set[str] = set()
    
    for country in country_codes:
        # Extract male names
        try:
            male_names = nd.get_top_names(
                n=top_n,
                use_first_names=True,
                country_alpha2=country,
                gender='Male'
            )
            if country in male_names and 'M' in male_names[country]:
                first_names.update(male_names[country]['M'])
        except Exception as e:
            print(f"  Warning: Could not get male names for {country}: {e}")
        
        # Extract female names
        try:
            female_names = nd.get_top_names(
                n=top_n,
                use_first_names=True,
                country_alpha2=country,
                gender='Female'
            )
            if country in female_names and 'F' in female_names[country]:
                first_names.update(female_names[country]['F'])
        except Exception as e:
            print(f"  Warning: Could not get female names for {country}: {e}")
    
    return first_names


def extract_last_names(
    nd: NameDataset,
    country_codes: list,
    top_n: int
) -> Set[str]:
    """
    Extract the top N last names per country.
    
    Args:
        nd: Initialized NameDataset object
        country_codes: List of country codes to process
        top_n: Number of top names to extract per country
        
    Returns:
        Set of unique last names (title-cased as returned by the library)
    """
    last_names: Set[str] = set()
    
    for country in country_codes:
        try:
            surnames = nd.get_top_names(
                n=top_n,
                use_first_names=False,
                country_alpha2=country
            )
            if country in surnames:
                last_names.update(surnames[country])
        except Exception as e:
            print(f"  Warning: Could not get last names for {country}: {e}")
    
    return last_names


def build_lexicon(
    first_names: Set[str],
    last_names: Set[str]
) -> Dict[str, str]:
    """
    Build a compromise-compatible lexicon from the extracted names.
    
    Compromise uses lowercase keys in its lexicon. Names are tagged as:
    - 'FirstName': Given names
    - 'LastName': Family names
    
    When a name appears in both sets (e.g., "Jordan"), it's kept as FirstName
    since compromise's pattern matching can handle context-based disambiguation.
    
    Args:
        first_names: Set of first names
        last_names: Set of last names
        
    Returns:
        Dictionary mapping lowercase names to their compromise tags
    """
    lexicon: Dict[str, str] = {}
    
    # Add first names (these take priority for ambiguous names)
    for name in first_names:
        key = name.lower()
        lexicon[key] = 'FirstName'
    
    # Add last names (skip if already a first name)
    for name in last_names:
        key = name.lower()
        if key not in lexicon:
            lexicon[key] = 'LastName'
    
    return lexicon


def generate_json_output(lexicon: Dict[str, str], output_path: Path) -> None:
    """
    Generate a JSON file containing the lexicon.
    
    Args:
        lexicon: The name lexicon dictionary
        output_path: Directory to save the output file
    """
    json_file = output_path / "names-lexicon.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(lexicon, f, ensure_ascii=False, indent=2)
    print(f"  Saved JSON lexicon to {json_file}")


def generate_typescript_output(lexicon: Dict[str, str], output_path: Path) -> None:
    """
    Generate a TypeScript module containing the lexicon.
    
    Args:
        lexicon: The name lexicon dictionary
        output_path: Directory to save the output file
    """
    ts_file = output_path / "names-lexicon.ts"
    with open(ts_file, 'w', encoding='utf-8') as f:
        f.write("// Auto-generated name lexicon for compromise NLP\n")
        f.write("// Source: https://github.com/philipperemy/name-dataset\n")
        f.write("// Do not edit manually - regenerate using extract_names.py\n\n")
        f.write("export const nameLexicon: Record<string, string> = ")
        json.dump(lexicon, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    print(f"  Saved TypeScript module to {ts_file}")


def generate_esm_output(lexicon: Dict[str, str], output_path: Path) -> None:
    """
    Generate an ESM (ECMAScript Module) JavaScript file containing the lexicon.
    
    Args:
        lexicon: The name lexicon dictionary
        output_path: Directory to save the output file
    """
    mjs_file = output_path / "names-lexicon.mjs"
    with open(mjs_file, 'w', encoding='utf-8') as f:
        f.write("// Auto-generated name lexicon for compromise NLP\n")
        f.write("// Source: https://github.com/philipperemy/name-dataset\n")
        f.write("// Do not edit manually - regenerate using extract_names.py\n\n")
        f.write("export const nameLexicon = ")
        json.dump(lexicon, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    print(f"  Saved ESM module to {mjs_file}")


def generate_cjs_output(lexicon: Dict[str, str], output_path: Path) -> None:
    """
    Generate a CommonJS module containing the lexicon.
    
    Args:
        lexicon: The name lexicon dictionary
        output_path: Directory to save the output file
    """
    cjs_file = output_path / "names-lexicon.cjs"
    with open(cjs_file, 'w', encoding='utf-8') as f:
        f.write("// Auto-generated name lexicon for compromise NLP\n")
        f.write("// Source: https://github.com/philipperemy/name-dataset\n")
        f.write("// Do not edit manually - regenerate using extract_names.py\n\n")
        f.write("const nameLexicon = ")
        json.dump(lexicon, f, ensure_ascii=False, indent=2)
        f.write(";\n\n")
        f.write("module.exports = { nameLexicon };\n")
    print(f"  Saved CommonJS module to {cjs_file}")


def print_statistics(
    first_names: Set[str],
    last_names: Set[str],
    lexicon: Dict[str, str],
    country_count: int,
    top_n: int
) -> None:
    """
    Print summary statistics about the extraction.
    
    Args:
        first_names: Set of extracted first names
        last_names: Set of extracted last names
        lexicon: The final lexicon dictionary
        country_count: Number of countries processed
        top_n: Top N parameter used
    """
    first_count = sum(1 for v in lexicon.values() if v == 'FirstName')
    last_count = sum(1 for v in lexicon.values() if v == 'LastName')
    ambiguous_count = len(first_names & last_names)
    
    print("\n" + "=" * 50)
    print("EXTRACTION SUMMARY")
    print("=" * 50)
    print(f"Parameters:")
    print(f"  - Countries processed: {country_count}")
    print(f"  - Top N per country: {top_n}")
    print(f"\nExtracted names:")
    print(f"  - Unique first names: {len(first_names):,}")
    print(f"  - Unique last names: {len(last_names):,}")
    print(f"  - Ambiguous (both): {ambiguous_count:,}")
    print(f"\nFinal lexicon:")
    print(f"  - Total entries: {len(lexicon):,}")
    print(f"  - Tagged as FirstName: {first_count:,}")
    print(f"  - Tagged as LastName: {last_count:,}")
    print("=" * 50)


def extract_names(top_n: int, output_dir: str) -> Dict[str, str]:
    """
    Main extraction function that orchestrates the entire process.
    
    Args:
        top_n: Number of top names to extract per country
        output_dir: Directory to save output files
        
    Returns:
        The generated lexicon dictionary
    """
    # Initialize dataset
    nd = initialize_dataset()
    
    # Get country codes
    country_codes = get_country_codes(nd)
    print(f"Processing {len(country_codes)} countries...")
    
    # Extract first names
    print("\nExtracting first names...")
    first_names = extract_first_names(nd, country_codes, top_n)
    print(f"  Found {len(first_names):,} unique first names")
    
    # Extract last names
    print("\nExtracting last names...")
    last_names = extract_last_names(nd, country_codes, top_n)
    print(f"  Found {len(last_names):,} unique last names")
    
    # Build lexicon
    print("\nBuilding lexicon...")
    lexicon = build_lexicon(first_names, last_names)
    print(f"  Created lexicon with {len(lexicon):,} entries")
    
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Generate output files
    print("\nGenerating output files...")
    generate_json_output(lexicon, output_path)
    generate_typescript_output(lexicon, output_path)
    generate_esm_output(lexicon, output_path)
    generate_cjs_output(lexicon, output_path)
    
    # Print statistics
    print_statistics(first_names, last_names, lexicon, len(country_codes), top_n)
    
    return lexicon


def main():
    """
    CLI entry point with argument parsing.
    """
    parser = argparse.ArgumentParser(
        description='Extract names from name-dataset for compromise NLP lexicon.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/extract_names.py --top-n 500 --output output
  python scripts/extract_names.py -n 1000 -o ./lexicon

Note: The name-dataset library requires ~3.2GB RAM to load.
        """
    )
    parser.add_argument(
        '-n', '--top-n',
        type=int,
        default=500,
        help='Number of top names per country (default: 500)'
    )
    parser.add_argument(
        '-o', '--output',
        type=str,
        default='output',
        help='Output directory for generated files (default: output)'
    )
    
    args = parser.parse_args()
    
    if args.top_n <= 0:
        print("Error: --top-n must be a positive integer", file=sys.stderr)
        sys.exit(1)
    
    try:
        extract_names(top_n=args.top_n, output_dir=args.output)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
