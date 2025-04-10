from functools import wraps
from experiment.utils import (
    extract_json,
    calculate_depth,
    score_math,
    score_mc,
    score_mh,
)
from llm import generate
from experiment.prompter import math, multichoice, multihop

count = 0
MAX_RETRIES = 5
LABEL_RETRIES = 3
ATOM_DEPTH = 3
score = None

module = None

# prompter
prompter = None


def set_module(module_name):  # math, multi-choice, multi-hop
    global module, prompter, score
    module = module_name
    if module == "math":
        prompter = math
        score = score_math
    elif module == "multi-choice":
        prompter = multichoice
        score = score_mc
    elif module == "multi-hop":
        prompter = multihop
        score = score_mh


async def direct(question: str):
    if isinstance(question, (list, tuple)):
        question = "".join(map(str, question))
    return prompter.direct(question)


async def multistep(question: str):
    return prompter.multistep(question)


async def label(question: str, sub_questions: str, answer: str = None):
    return prompter.label(question, sub_questions, answer)


async def contract(
    question: str,
    decompose_result: dict,
    independent_subqs: list,
    dependent_subqs: list,
):
    return prompter.contract(
        question, decompose_result, independent_subqs, dependent_subqs
    )


async def ensemble(question: str, results: list):
    return prompter.ensemble(question, results)


async def label(func_name, prompt):
    response = await generate(prompt, response_format="json_object")
    result = extract_json(response)

    if prompter.check(func_name, result):
        return result

    return {}


async def decompose(question: str):
    retries = LABEL_RETRIES

    if module == "multi-hop":
        multistep_result = await multistep(question)
        subquestions = label_result["sub-questions"]
        multistep_subquestions = multistep_result["sub-questions"]

        while retries > 0:
            label_result = await label(question, multistep_result)

            if len(subquestions) != len(multistep_subquestions):
                retries -= 1
                continue

            calculate_depth(subquestions)
            retries -= 1

        for step, note in zip(multistep_subquestions, subquestions):
            step["depend"] = note["depend"]
        return multistep_result
    else:
        multistep_result = await multistep(question)
        response = multistep_result["response"]

        while retries > 0:
            result = await label(question, response, multistep_result["answer"])
            calculate_depth(result["sub-questions"])
            result["response"] = response

            retries -= 1
        return result


async def merging(question: str, decompose_result: dict, contexts: str = None):
    subquestions = decompose_result["sub-questions"]

    independent_subqs = [sub_q for sub_q in subquestions if len(sub_q["depend"]) == 0]

    dependent_subqs = [
        sub_q for sub_q in subquestions if sub_q not in independent_subqs
    ]

    # contract
    contractd_result = await contract(
        question, decompose_result, independent_subqs, dependent_subqs
    )

    # Extract thought process and optimized question
    contractd_question = contractd_result.get("question", "")
    contraction_thought = contractd_result.get("response", "")

    # Solve the optimized question
    contraction_result = await direct(contractd_question, contexts)

    # Update contraction result with additional information
    contraction_result["contraction_thought"] = contraction_thought
    contraction_result["sub-questions"] = independent_subqs + [
        {
            "description": contractd_question,
            "response": contraction_thought,
            "answer": contraction_result.get("answer", ""),
            "depend": [],
        }
    ]

    return contraction_result


async def create_atom(question: str):
    direct_result = await direct(question)
    decompose_result = await decompose(question)
    contraction_result = await merging(question, decompose_result)

    # Get ensemble result
    ensemble_args = [
        question,
        direct_result["response"],
        decompose_result["response"],
        contraction_result["response"],
    ]

    # ensemble
    ensemble_result = await ensemble(*ensemble_args)
    ensemble_answer = ensemble_result.get("answer", "")

    # Calculate scores
    def is_all_answers_ensembled():
        return all(
            result["answer"] == ensemble_answer
            for result in [direct_result, decompose_result, contraction_result]
        )

    def generate_scores():
        if is_all_answers_ensembled():
            return [1, 1, 1]
        else:
            results = [direct_result, decompose_result, contraction_result]
            return [score(result["answer"], ensemble_answer) for result in results]

    scores = generate_scores()

    # Select best method based on scores
    methods = {
        2: ("contract", contraction_result),
        0: ("direct", direct_result),
        1: ("decompose", decompose_result),
        -1: ("ensemble", ensemble_result),
    }

    max_score_index = scores.index(max(scores))
    method, result = methods.get(max_score_index, methods[-1])

    log = {
        "scores": scores,
        "direct": direct_result,
        "decompose": decompose_result,
        "contract": contraction_result,
        "method": method,
    }

    # Return appropriate result format
    return result, log
