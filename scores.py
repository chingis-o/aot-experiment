import string
import re
from collections import Counter
from typing import Union

def extract_boxed(s):
    import re

    pattern = r"\\boxed{((?:[^{}]|{(?:[^{}]|{[^{}]*})*?)*)}"
    match = re.search(pattern, s)
    if match:
        return match.group(1)
    return ""

def eval_math(s):
    try:
        return eval(str(s).replace(",", ""))
    except:
        return 0

def score_math(prediction, groundtruth, dataset="aime"):
    try:
        if dataset == "math":
            return (
                1
                if eval_math(prediction) == eval_math(extract_boxed(groundtruth))
                else 0
            )
        elif dataset == "gsm8k":
            return (
                1
                if eval_math(prediction) == eval_math(groundtruth.split("####")[1])
                else 0
            )
        elif dataset == "aime":
            return 1 if eval_math(prediction) == eval_math(groundtruth) else 0
    except:
        return 0

def score_multichain(prediction, target):
    if not prediction or not target:
        return 0

    prediction = str(prediction).upper()
    target = str(target).upper()

    def normalize_answer(answer):
        # Remove any brackets and convert to uppercase
        return answer.replace("(", "").replace(")", "").upper()

    return 1 if normalize_answer(prediction) == normalize_answer(target) else 0


def normalize_answer(s):

    def remove_articles(text):
        return re.sub(r"\b(a|an|the)\b", " ", text)

    def white_space_fix(text):
        return " ".join(text.split())

    def remove_punc(text):
        exclude = set(string.punctuation)
        return "".join(ch for ch in text if ch not in exclude)

    def lower(text):
        return text.lower()

    return white_space_fix(remove_articles(remove_punc(lower(s))))

def f1_score(prediction, ground_truth):
    normalized_prediction = normalize_answer(prediction)
    normalized_ground_truth = normalize_answer(ground_truth)

    ZERO_METRIC = (0, 0, 0)

    if (
        normalized_prediction in ["yes", "no", "noanswer"]
        and normalized_prediction != normalized_ground_truth
    ):
        return ZERO_METRIC
    if (
        normalized_ground_truth in ["yes", "no", "noanswer"]
        and normalized_prediction != normalized_ground_truth
    ):
        return ZERO_METRIC

    prediction_tokens = normalized_prediction.split()
    ground_truth_tokens = normalized_ground_truth.split()
    common = Counter(prediction_tokens) & Counter(ground_truth_tokens)
    num_same = sum(common.values())
    if num_same == 0:
        return ZERO_METRIC
    precision = 1.0 * num_same / len(prediction_tokens)
    recall = 1.0 * num_same / len(ground_truth_tokens)
    f1 = (2 * precision * recall) / (precision + recall)
    return f1, precision, recall

def score_multihop(prediction: str, groundtruth: Union[str, list]):
    try:
        if isinstance(groundtruth, list):
            f1 = max([f1_score(prediction, gt)[0] for gt in groundtruth])
        else:
            f1 = f1_score(prediction, groundtruth)[0]
        return f1
    except:
        return 0