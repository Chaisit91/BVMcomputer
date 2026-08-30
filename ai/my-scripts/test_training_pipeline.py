import random
import unittest

import pandas as pd

import build_training_dataset as dataset_builder
import train_models
from dataset_compatibility_rules import required_with_optional_constraint


class TrainingPipelineTests(unittest.TestCase):
    def test_reservoir_is_bounded_and_counts_seen_rows(self):
        random.seed(42)
        reservoir = dataset_builder.Reservoir(10)

        for value in range(1000):
            reservoir.append(value)

        self.assertEqual(len(reservoir), 10)
        self.assertEqual(reservoir.seen, 1000)
        self.assertEqual(len(set(reservoir)), 10)

    def test_supported_values_accept_common_delimiters(self):
        values = dataset_builder.get_values("ATX, Micro ATX; Mini ITX / E-ATX")
        self.assertEqual(values, {"atx", "micro atx", "mini itx", "e-atx"})

    def test_unknown_optional_constraint_preserves_required_result(self):
        self.assertEqual(required_with_optional_constraint(1, -1), 1)
        self.assertEqual(required_with_optional_constraint(1, None), 1)
        self.assertEqual(required_with_optional_constraint(1, 0), 0)
        self.assertEqual(required_with_optional_constraint(0, -1), 0)

    def test_training_keeps_required_specs_but_removes_target_helpers(self):
        frame = pd.DataFrame(
            {
                "gpu_id": ["gpu-1", "gpu-2"],
                "case_id": ["case-1", "case-2"],
                "gpu_length": [300, 320],
                "case_gpu_clearance": [310, 300],
                "length_difference": [10, -20],
                "gpu_case_length_ok": [1, 0],
                "label": [1, 0],
            }
        )

        features, labels = train_models.prepare_data(frame)

        self.assertEqual(
            list(features.columns),
            ["gpu_length", "case_gpu_clearance", "length_difference"],
        )
        self.assertEqual(labels.tolist(), [1, 0])


if __name__ == "__main__":
    unittest.main()
