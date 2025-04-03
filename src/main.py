import asyncio
import os
import time
import argparse
from dataclasses import dataclass
from typing import Dict, List, Any, Tuple
from tqdm.asyncio import tqdm

from experiment.dataset import load_data
from experiment.module import set_module, atom
from experiment.utils import (
    duration_formatter,
    load_json,
    save_json,
    get_next_log_file,
    get_file_count,
)
from llm import get_token, get_call_count, set_model

# Configuration constants log directory
LOG_DIR = "log/{dataset}/{size}"

# Dataset configuration
@dataclass
class DatasetConfig:
    question_key: str
    answer_key: str
    module_type: str
    scoring_function: str
    
    def requires_context(self) -> bool:
        return self.module_type == "multi-hop"
# some bullshit

# Dataset configuration mapping
DATASET_CONFIGS = {
    "gsm8k": DatasetConfig(question_key="question", answer_key="answer", 
                          module_type="math", scoring_function="score_math"),
    "math": DatasetConfig(question_key="problem", answer_key="solution", 
                         module_type="math", scoring_function="score_math"),
    "bbh": DatasetConfig(question_key="input", answer_key="target", 
                        module_type="multi-choice", scoring_function="score_mc"),
    "mmlu": DatasetConfig(question_key=["Question", "A", "B", "C", "D"], answer_key="Answer", 
                         module_type="multi-choice", scoring_function="score_mc"),
    "hotpotqa": DatasetConfig(question_key="question", answer_key="answer", 
                             module_type="multi-hop", scoring_function="score_mh"),
    "longbench": DatasetConfig(question_key="input", answer_key="answers", 
                              module_type="multi-hop", scoring_function="score_mh"),
}

def format_question_from_keys(item: Dict[str, Any], keys: List[str]) -> str:
    # When question_key is a list, concatenate values from multiple keys into a single question
    parts = []
    for key in keys:
        if key in item:
            parts.append(f"{key}: {item[key]}")
    return "\n".join(parts)

async def gather_results(config: DatasetConfig, dataset: str, testset: List[Dict[str, Any]]) -> List[Any]:
    # Collect experiment results
    set_module(config.module_type)
    # some modules
    
    # some question key
    question_key = config.question_key
    # list of tasks
    tasks = []
    
    if config.requires_context():
        from experiment.prompter.multihop import contexts
        # Handle case where question_key is a list
        if isinstance(question_key, list):
            formatted_questions = [format_question_from_keys(item, question_key) for item in testset]
            # tasks from atom
            tasks = [atom(question, contexts(item, dataset)) 
                     for question, item in zip(formatted_questions, testset)]
        else:
            tasks = [atom(item[question_key], contexts(item, dataset)) for item in testset]
    else:
        # Handle case where question_key is a list
        if isinstance(question_key, list):
            tasks = [atom(format_question_from_keys(item, question_key)) for item in testset]
        else:
            tasks = [atom(item[question_key]) for item in testset]

    return await tqdm.gather(*tasks, desc=f"Processing {dataset} tasks")

def construct_entry(config: DatasetConfig, dataset: str, result: Tuple[Dict[str, Any], Any], data: Dict[str, Any]) -> Dict[str, Any]:
    # Construct result entry
    result_data, log = result
    question_key = config.question_key
    answer_key = config.answer_key
        
    # Handle case where question_key is a list
    if isinstance(question_key, list):
        question = format_question_from_keys(data, question_key)
    else:
        question = data[question_key]
            
    groundtruth = data[answer_key]
        
    entry = {
        "problem": question,
        "groundtruth": groundtruth,
        "response": result_data.get("response"),
        "answer": result_data.get("answer"),
        "log": log
    }
        
    # Dynamically import scoring function
    scoring_function = getattr(__import__(f"experiment.utils", fromlist=[config.scoring_function]), 
                                config.scoring_function)
        
        # Pass different parameters based on scoring function
    if config.scoring_function == "score_math":
        entry["score"] = scoring_function(entry["answer"], groundtruth, dataset)
    else:
        entry["score"] = scoring_function(entry["answer"], groundtruth)
    return entry

def update_score_log(start: int, end: int, dataset: str, interval: str, accuracy: float) -> None:
    # Update score log
    log_entry = {
        "start": start,
        "end": end,
        "token": {"prompt": get_token()[0], "completion": get_token()[1]},
        "call_count": get_call_count(),
        "accuracy": accuracy,
    }
    
    score_log_file = LOG_DIR.format(dataset=dataset, size=interval) + "/score.json"
    existing_log = load_json(score_log_file) if os.path.exists(score_log_file) else {}
    count = get_file_count(LOG_DIR, interval, dataset, exclude_score=True)

    if dataset not in existing_log:
        existing_log[dataset] = {}
    existing_log[dataset][str(count)] = log_entry
    save_json(score_log_file, existing_log)

async def run(dataset: str, model: str, start: int = 0, end: int = -1):
    print(f"Running experiment on {dataset} dataset from index {start} to {end}")

    interval = "full" if end is None else f"{start}-{end}"
    timestamp = time.time()

    if dataset not in DATASET_CONFIGS:
        raise ValueError(f"Unsupported dataset: {dataset}")
            
    config = DATASET_CONFIGS[dataset]
    set_model(model)

    testset = load_data(dataset, "test")[start:end]
    results = await gather_results(config, dataset, testset)

    json_obj = [construct_entry(result, data) for result, data in zip(results, testset)]
    accuracy = sum(entry["score"] for entry in json_obj) / len(json_obj)

    # Save results
    log_file = get_next_log_file(LOG_DIR, interval, dataset)
    save_json(log_file, json_obj)

    # Update score log
    update_score_log(accuracy)

    # Print result summary
    print(f"Unsolved: {round((1-accuracy) * len(json_obj))}")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Time taken: {duration_formatter(time.time() - timestamp)}")
        
    return accuracy

async def main():
    # Main function
    parser = argparse.ArgumentParser(description='Run experiments on various datasets')
    parser.add_argument('--dataset', type=str, default='mmlu', 
                        choices=list(DATASET_CONFIGS.keys()),
                        help='Dataset to run experiment on')
    parser.add_argument('--start', type=int, default=0, 
                        help='Start index of the dataset')
    parser.add_argument('--end', type=int, default=2, 
                        help='End index of the dataset (-1 for all)')
    parser.add_argument('--model', type=str, default='gpt-4o-mini',
                        help='Model to use for the experiment')
    
    args = parser.parse_args()
    
    # Run experiment
    await run(args.dataset, args.model, args.start, args.end)

if __name__ == "__main__":
    asyncio.run(main())
