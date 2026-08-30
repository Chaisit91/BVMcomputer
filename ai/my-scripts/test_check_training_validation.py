import csv
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import check_training_validation as checker


FIELDS = ("left_id", "right_id", "feature", "label")


def write_csv(path: Path, rows: list[tuple[str, str, str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(FIELDS)
        writer.writerows(rows)


class TrainingValidationCheckTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        root = Path(self.temporary.name)
        self.training = root / "training"
        self.validation = root / "validation"
        self.training.mkdir()
        self.validation.mkdir()

    def tearDown(self):
        self.temporary.cleanup()

    def validate(self):
        with (
            patch.object(checker, "TRAINING_DIR", self.training),
            patch.object(checker, "VALIDATION_DIR", self.validation),
        ):
            return checker.validate_dataset("sample", ("left_id", "right_id"), 1)

    def test_accepts_disjoint_balanced_data(self):
        write_csv(self.training / "sample.csv", [("a", "b", "1", "0"), ("c", "d", "2", "1")])
        write_csv(self.validation / "sample.csv", [("e", "f", "3", "0"), ("g", "h", "4", "1")])
        self.assertTrue(self.validate().passed)

    def test_rejects_pair_leakage(self):
        write_csv(self.training / "sample.csv", [("a", "b", "1", "0"), ("c", "d", "2", "1")])
        write_csv(self.validation / "sample.csv", [("a", "b", "3", "0"), ("g", "h", "4", "1")])
        result = self.validate()
        self.assertFalse(result.passed)
        self.assertEqual(result.overlap_pairs, 1)

    def test_rejects_invalid_labels_and_duplicate_pairs(self):
        write_csv(self.training / "sample.csv", [("a", "b", "1", "2"), ("a", "b", "2", "1")])
        write_csv(self.validation / "sample.csv", [("e", "f", "3", "0"), ("g", "h", "4", "1")])
        result = self.validate()
        self.assertFalse(result.passed)
        self.assertIn("2", result.training.invalid_labels)
        self.assertEqual(result.training.duplicate_pairs, 1)


if __name__ == "__main__":
    unittest.main()
