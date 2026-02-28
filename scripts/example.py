#!/usr/bin/env python3
"""Example script - replace or remove as needed."""

import argparse


def main() -> None:
    parser = argparse.ArgumentParser(description="Example script")
    parser.add_argument("--name", default="World", help="Name to greet")
    args = parser.parse_args()
    print(f"Hello, {args.name}!")


if __name__ == "__main__":
    main()
