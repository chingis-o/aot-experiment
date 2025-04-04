from functools import wraps
from experiment.utils import (
    extract_json,
    extract_xml,
    calculate_depth,
    score_math,
    score_mc,
    score_mh,
)
from llm import generate
from experiment.prompter import math, multichoice, multihop
from contextlib import contextmanager

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


def retry(func_name):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            global MAX_RETRIES
            retries = MAX_RETRIES
            while retries >= 0:
                prompt = getattr(prompter, func_name)(*args, **kwargs)

                if module == "multi-hop" and func_name != "contract":
                    response = await generate(prompt, response_format="json_object")
                    result = extract_json(response)
                    result["response"] = response
                else:
                    if func_name == "label":
                        response = await generate(prompt, response_format="json_object")
                        result = extract_json(response)
                    else:
                        response = await generate(prompt, response_format="text")
                        result = extract_xml(response)
                        if isinstance(result, dict):
                            result["response"] = response

                if prompter.check(func_name, result):
                    return result
                retries -= 1

            global count
            if MAX_RETRIES > 1:
                count += 1
            if count > 300:
                raise Exception("Too many failures")
            return result if isinstance(result, dict) else {}

        return wrapper

    return decorator

async def execute(func_name, *args, **kwargs):
    if isinstance(question, (list, tuple)) and func_name == 'direct':
        question = "".join(map(str, question))
    
    global MAX_RETRIES
    retries = MAX_RETRIES

    # retries
    while retries >= 0:
        prompt = getattr(prompter, func_name)(*args, **kwargs)
        if module == "multi-hop" and func_name != "contract":
            response = await generate(prompt, response_format="json_object")
            result = extract_json(response)
            result["response"] = response
        else:
            if func_name == "label":
                response = await generate(prompt, response_format="json_object")
                result = extract_json(response)
            else:
                response = await generate(prompt, response_format="text")
                result = extract_xml(response)
                if isinstance(result, dict):
                    result["response"] = response
        if prompter.check(func_name, result):
            return result
        retries -= 1

    # calculate count
    global count
    if MAX_RETRIES > 1:
        count += 1
    if count > 300:
        raise Exception("Too many failures")
    return result if isinstance(result, dict) else {}

async def decompose(question: str, contexts):
    retries = LABEL_RETRIES
    if module == "multi-hop":
        if contexts == None:
            raise Exception("Multi-hop must have contexts")
        multistep_result = await multistep(question, contexts)
        subquestions = label_result["sub-questions"]
        multistep_subquestions = multistep_result["sub-questions"]

        while retries > 0:
            label_result = await label(question, multistep_result)

            try:
                if len(subquestions) != len(multistep_subquestions):
                    retries -= 1
                    continue
                calculate_depth(subquestions)
                break
            except:
                retries -= 1
                continue
        for step, note in zip(
            multistep_subquestions, subquestions
        ):
            step["depend"] = note["depend"]
        return multistep_result
    else:
        multistep_result = await multistep(question)
        response = multistep_result["response"]

        while retries > 0:
            result = await label(question, response, multistep_result["answer"])

            try:
                calculate_depth(result["sub-questions"])
                result["response"] = response
                break
            except:
                retries -= 1
                continue
        return result


async def merging(question: str, decompose_result: dict, contexts: str = None):
    independent_subqs = [
        sub_q
        for sub_q in decompose_result["sub-questions"]
        if len(sub_q["depend"]) == 0
    ]
    dependent_subqs = [
        sub_q
        for sub_q in decompose_result["sub-questions"]
        if sub_q not in independent_subqs
    ]

    # contract
    contractd_result = await contract(question, independent_subqs, dependent_subqs, contexts)

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


async def create_atom(question: str, contexts: str = None):
    # call direct
    direct_result = await direct(question, contexts)

    # decompose
    decompose_result = await decompose(question, contexts)

    # contraction result
    contraction_result = await merging(question, decompose_result, contexts)

    # Get ensemble result
    ensemble_args = [
        question,
        direct_result["response"],
        decompose_result["response"],
        contraction_result["response"],
        contexts,
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


# direct answer
@retry("direct")
async def direct(question: str, contexts: str = None):
    if isinstance(question, (list, tuple)):
        question = "".join(map(str, question))
    pass


# multistep?
@retry("multistep")
async def multistep(question: str, contexts: str = None):
    pass


# label?
@retry("label")
async def label(question: str, sub_questions: str, answer: str = None):
    pass


@retry("contract")
async def contract(
    question: str,
    independent_subqs: list,
    dependent_subqs: list,
    contexts: str = None,
):
    pass


#
@retry("ensemble")
async def ensemble(question: str, results: list, contexts: str = None):
    pass


@contextmanager
def temporary_retries(value):
    global MAX_RETRIES
    original = MAX_RETRIES
    MAX_RETRIES = value
    try:
        yield
    finally:
        MAX_RETRIES = original
