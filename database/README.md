# AI data storage

This directory keeps the AI data separate from the AI application source code.

- `open-db/` — BuildCores source records
- `data/` — processed, training, validation, and web-catalog files
- `dataset/` — flattened CSV exports
- `models/` — trained model artifacts and evaluation summaries

`ai/my-scripts/project_paths.py` uses this directory by default. Set
`AI_DATA_DIR` to an absolute path only when the data is stored elsewhere.
