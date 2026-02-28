# Python Scripts

A monorepo for miscellaneous Python scripts.

## Structure

```
python-scripts/
├── scripts/           # All scripts live here
│   ├── utils/         # Shared utilities
│   └── *.py           # Individual scripts
├── pyproject.toml
├── requirements.txt
└── README.md
```

## Setup

```bash
# Create virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install in editable mode (optional, for imports)
pip install -e .
```

## Running Scripts

Run any script directly:

```bash
python scripts/example.py --name "Your Name"
```

Or from the project root with module syntax:

```bash
python -m scripts.example --name "Your Name"
```

## Adding New Scripts

1. Add new `.py` files under `scripts/`
2. Use `scripts.utils` for shared code
3. Add any new dependencies to `requirements.txt`
# python-scripts
