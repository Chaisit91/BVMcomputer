"""Validate training and external-validation CSVs before model training.

The checker streams each file once, validates schema and labels, detects repeated
product pairs, and rejects exact pair overlap between training and validation.
It uses ASCII console output so it works in Windows terminals with legacy code pages.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
TRAINING_DIR = ROOT / "data" / "processed" / "training"
VALIDATION_DIR = ROOT / "data" / "processed" / "validated"
LABEL_COLUMN = "label"
VALID_LABELS = frozenset({"0", "1"})
NULL_VALUES = frozenset({"", "none", "null", "nan"})

DATASETS: dict[str, tuple[str, ...]] = {
    "cpu_motherboard": ("cpu_id", "motherboard_id"),
    "cpu_cooler": ("cpu_id", "cooler_id"),
    "ram_motherboard": ("ram_id", "motherboard_id"),
    "gpu_case": ("gpu_id", "case_id"),
    "cooler_case": ("cooler_id", "case_id"),
    "motherboard_case": ("motherboard_id", "case_id"),
    "psu_case": ("psu_id", "case_id"),
    "storage_motherboard": ("storage_id", "motherboard_id"),
}


@dataclass
class CsvStats:
    path: str
    columns: tuple[str, ...] = ()
    rows: int = 0
    labels: Counter[str] = field(default_factory=Counter)
    pairs: dict[tuple[str, ...], str] = field(default_factory=dict, repr=False)
    duplicate_pairs: int = 0
    conflicting_pairs: int = 0
    blank_id_rows: int = 0
    malformed_rows: int = 0
    missing_values: int = 0
    invalid_labels: Counter[str] = field(default_factory=Counter)
    errors: list[str] = field(default_factory=list)

    def public_dict(self) -> dict[str, object]:
        return {
            "path": self.path,
            "columns": self.columns,
            "rows": self.rows,
            "labels": dict(self.labels),
            "duplicate_pairs": self.duplicate_pairs,
            "conflicting_pairs": self.conflicting_pairs,
            "blank_id_rows": self.blank_id_rows,
            "malformed_rows": self.malformed_rows,
            "missing_values": self.missing_values,
            "invalid_labels": dict(self.invalid_labels),
            "errors": self.errors,
        }


@dataclass
class DatasetResult:
    dataset: str
    training: CsvStats
    validation: CsvStats
    overlap_pairs: int = 0
    overlap_label_conflicts: int = 0
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return not (self.training.errors or self.validation.errors or self.errors)

    def public_dict(self) -> dict[str, object]:
        return {
            "dataset": self.dataset,
            "passed": self.passed,
            "training": self.training.public_dict(),
            "validation": self.validation.public_dict(),
            "overlap_pairs": self.overlap_pairs,
            "overlap_label_conflicts": self.overlap_label_conflicts,
            "warnings": self.warnings,
            "errors": self.errors,
        }


def normalized(value: object) -> str:
    return "" if value is None else str(value).strip()


def is_missing(value: object) -> bool:
    return normalized(value).casefold() in NULL_VALUES


def inspect_csv(path: Path, id_columns: tuple[str, ...]) -> CsvStats:
    stats = CsvStats(path=str(path))
    if not path.is_file():
        stats.errors.append("file not found")
        return stats

    try:
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            stats.columns = tuple(reader.fieldnames or ())
            if not stats.columns:
                stats.errors.append("header is missing")
                return stats
            if len(stats.columns) != len(set(stats.columns)):
                stats.errors.append("header contains duplicate column names")

            required = {*id_columns, LABEL_COLUMN}
            missing_columns = sorted(required - set(stats.columns))
            if missing_columns:
                stats.errors.append(f"missing required columns: {', '.join(missing_columns)}")
                return stats

            for row in reader:
                stats.rows += 1
                if None in row:
                    stats.malformed_rows += 1

                label = normalized(row.get(LABEL_COLUMN))
                if label in VALID_LABELS:
                    stats.labels[label] += 1
                else:
                    stats.invalid_labels[label or "<blank>"] += 1

                pair = tuple(normalized(row.get(column)) for column in id_columns)
                if any(not value for value in pair):
                    stats.blank_id_rows += 1
                else:
                    previous_label = stats.pairs.get(pair)
                    if previous_label is not None:
                        stats.duplicate_pairs += 1
                        if previous_label != label:
                            stats.conflicting_pairs += 1
                    else:
                        stats.pairs[pair] = label

                stats.missing_values += sum(
                    is_missing(row.get(column))
                    for column in stats.columns
                    if column != LABEL_COLUMN
                )
    except (OSError, UnicodeError, csv.Error) as error:
        stats.errors.append(f"cannot read CSV: {type(error).__name__}: {error}")
        return stats

    if stats.rows == 0:
        stats.errors.append("file has no data rows")
    if stats.invalid_labels:
        stats.errors.append(f"invalid labels: {dict(stats.invalid_labels)}")
    if set(stats.labels) != VALID_LABELS:
        stats.errors.append("both label classes 0 and 1 are required")
    if stats.blank_id_rows:
        stats.errors.append(f"rows with blank product IDs: {stats.blank_id_rows}")
    if stats.malformed_rows:
        stats.errors.append(f"malformed CSV rows: {stats.malformed_rows}")
    if stats.duplicate_pairs:
        stats.errors.append(f"duplicate product pairs: {stats.duplicate_pairs}")
    if stats.conflicting_pairs:
        stats.errors.append(f"pairs with conflicting labels: {stats.conflicting_pairs}")
    return stats


def validate_dataset(
    name: str,
    id_columns: tuple[str, ...],
    expected_validation_per_class: int | None,
) -> DatasetResult:
    training = inspect_csv(TRAINING_DIR / f"{name}.csv", id_columns)
    validation = inspect_csv(VALIDATION_DIR / f"{name}.csv", id_columns)
    result = DatasetResult(name, training, validation)

    if training.columns and validation.columns:
        training_set = set(training.columns)
        validation_set = set(validation.columns)
        missing = sorted(training_set - validation_set)
        extra = sorted(validation_set - training_set)
        if missing:
            result.errors.append(f"validation schema is missing: {', '.join(missing)}")
        if extra:
            result.errors.append(f"validation schema has extra columns: {', '.join(extra)}")
        if not missing and not extra and training.columns != validation.columns:
            result.warnings.append("column order differs; consumers must align by column name")

    overlap = training.pairs.keys() & validation.pairs.keys()
    result.overlap_pairs = len(overlap)
    result.overlap_label_conflicts = sum(
        training.pairs[pair] != validation.pairs[pair] for pair in overlap
    )
    if result.overlap_pairs:
        result.errors.append(
            f"training/validation leakage: {result.overlap_pairs} exact product pairs overlap"
        )
    if result.overlap_label_conflicts:
        result.errors.append(
            f"overlapping pairs with conflicting labels: {result.overlap_label_conflicts}"
        )

    if expected_validation_per_class is not None:
        expected = expected_validation_per_class
        actual = {label: validation.labels.get(label, 0) for label in sorted(VALID_LABELS)}
        if any(count != expected for count in actual.values()):
            result.errors.append(
                f"validation class counts must be {expected} each; found {actual}"
            )
    return result


def print_report(results: list[DatasetResult]) -> None:
    print("BuildCores training/validation integrity check")
    print("=" * 92)
    print(
        f"{'dataset':<23} {'train':>7} {'valid':>7} "
        f"{'labels(train/valid)':>22} {'overlap':>8} {'status':>8}"
    )
    print("-" * 92)
    for result in results:
        train_labels = f"{result.training.labels.get('0', 0)}/{result.training.labels.get('1', 0)}"
        valid_labels = f"{result.validation.labels.get('0', 0)}/{result.validation.labels.get('1', 0)}"
        print(
            f"{result.dataset:<23} {result.training.rows:>7,} {result.validation.rows:>7,} "
            f"{train_labels + ' | ' + valid_labels:>22} {result.overlap_pairs:>8,} "
            f"{'PASS' if result.passed else 'FAIL':>8}"
        )
        for warning in result.warnings:
            print(f"  WARN: {warning}")
        for error in [*result.training.errors, *result.validation.errors, *result.errors]:
            print(f"  ERROR: {error}")
    print("=" * 92)
    passed = sum(result.passed for result in results)
    print(f"Result: {passed}/{len(results)} datasets passed")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--expected-validation-per-class",
        type=int,
        default=2000,
        help="required validation rows for labels 0 and 1; use 0 to disable",
    )
    parser.add_argument("--json", action="store_true", help="write machine-readable JSON")
    args = parser.parse_args(argv)
    if args.expected_validation_per_class < 0:
        parser.error("--expected-validation-per-class cannot be negative")
    return args


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    expected = args.expected_validation_per_class or None
    results = [
        validate_dataset(name, id_columns, expected)
        for name, id_columns in DATASETS.items()
    ]
    if args.json:
        json.dump(
            {
                "passed": all(result.passed for result in results),
                "datasets": [result.public_dict() for result in results],
            },
            sys.stdout,
            ensure_ascii=True,
            indent=2,
        )
        print()
    else:
        print_report(results)
    return 0 if all(result.passed for result in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
