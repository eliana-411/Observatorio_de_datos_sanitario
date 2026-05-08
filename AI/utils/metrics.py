from typing import List
import numpy as np


def rmse(actual: List[float], predicted: List[float]) -> float:
    errors = np.array(actual) - np.array(predicted)
    return float(np.sqrt(np.mean(errors ** 2)))


def mae(actual: List[float], predicted: List[float]) -> float:
    return float(np.mean(np.abs(np.array(actual) - np.array(predicted))))


def r2_score(actual: List[float], predicted: List[float]) -> float:
    actual_arr = np.array(actual)
    residuals = actual_arr - np.array(predicted)
    ss_res = np.sum(residuals ** 2)
    ss_tot = np.sum((actual_arr - np.mean(actual_arr)) ** 2)
    return float(1.0 - ss_res / ss_tot) if ss_tot != 0 else 0.0


def precision(true_positive: int, false_positive: int) -> float:
    return float(true_positive / (true_positive + false_positive)) if (true_positive + false_positive) > 0 else 0.0


def recall(true_positive: int, false_negative: int) -> float:
    return float(true_positive / (true_positive + false_negative)) if (true_positive + false_negative) > 0 else 0.0
