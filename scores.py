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
    def compare(groundtruth):
        return eval_math(prediction) == eval_math(groundtruth)

    try:
        if dataset == "math" and compare(extract_boxed(groundtruth)):
            return 1
        elif dataset == "gsm8k" and compare(groundtruth.split("####")[1]):
            return 1
        elif dataset == "aime" and compare(groundtruth):
            return 1
        else:
            return 0
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

    if normalize_answer(prediction) == normalize_answer(target):
        return 1
    else:
        return 0


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

    def compare():
        return normalized_prediction != normalized_ground_truth

    def check(text):
        return text in ["yes", "no", "noanswer"]

    if check(normalized_prediction) and compare():
        return ZERO_METRIC
    if check(normalized_ground_truth) and compare():
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
            return max([f1_score(prediction, gt)[0] for gt in groundtruth])
        else:
            return f1_score(prediction, groundtruth)[0]
    except:
        return 0
