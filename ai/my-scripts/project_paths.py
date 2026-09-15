"""Central paths for AI source code and its separately stored data."""

from __future__ import annotations

import os
from pathlib import Path


AI_ROOT = Path(__file__).resolve().parent.parent
DATA_ROOT = Path(os.getenv("AI_DATA_DIR", AI_ROOT.parent / "database")).resolve()

OPEN_DB_DIR = DATA_ROOT / "open-db"
DATA_DIR = DATA_ROOT / "data"
DATASET_DIR = DATA_ROOT / "dataset"
MODEL_DIR = DATA_ROOT / "models"
