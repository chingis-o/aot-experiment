function direct(question?: string) {
  return `You are a precise math problem solver. Solve the given math problem step by step:

    QUESTION: ${question}
        
    Please extend your chain of thought as much as possible; the longer the chain of thought, the better.
        
    You can freely reason in your response, but please enclose the final answer within <answer></answer> tags (pure number without units and explanations)`;
}

function multistep(question?: string) {
  return `You are a precise math problem solver. Solve the given math problem step by step:

    QUESTION: ${question}
        
    Please extend your chain of thought as much as possible; the longer the chain of thought, the better.
        
    You can freely reason in your response, but please enclose the final answer within <answer></answer> tags (pure number without units and explanations)`;
}

function label(question: string) {
  return `You are tasked with breaking down a math problem reasoning process into sub-questions.

    Original Question: ${question}

    Instructions:
    1. Break down the reasoning process into a series of sub-questions
    2. Each sub-question should:
        - Be written in interrogative form
        - Have a clear numerical answer
        - List its other sub-questions' indexes it depends (0-based, can be an empty list)
    3. Dependencies are defined as information needed to answer the current sub-question that:
        - Does NOT come directly from the original question
        - MUST come from the answers of previous sub-questions

    Format your response as the following JSON object:
    {{
        "subQuestions": [
            {{
                "description": "<clear interrogative question>",
                "depend": [<indices of prerequisite sub-questions>]
            }},
            ...
        ],
    }}`;
}

function solve(original: string, subQuestion: string) {
  return `You are a math problem solver specializing in optimizing step-by-step reasoning processes. Your task is to optimize the existing reasoning trajectory into a more efficient, single self-contained question.
        
    For the original question: ${original}
        
    Solve this subquestion:
    ${subQuestion} `;
}

function contract1(
  question?: string,
  response?: string,
  sub_questions?: string,
  independent?: string,
) {
  return `You are a math problem solver specializing in optimizing step-by-step reasoning processes. Your task is to optimize the existing reasoning trajectory into a more efficient, single self-contained question.
        
    For the original question: ${question}
        
    Here are step-by-step reasoning process:
    ${response}
        
    ${sub_questions}
        
    Here are explanations of key concepts:
    1. self-contained: The optimized question must be solvable independently, without relying on any external information
    2. efficient: The optimized question must be simpler than the original, requiring fewer reasoning steps (these steps are reduced because some solved independent sub-problems become known conditions in the optimized question or are excluded as incorrect explorations)
        
    You can freely reason in your response, but please enclose the your optimized question within <question></question> tags

    The following sub-questions and their answers can serve as known conditions:
    ${independent}`;
}

function contract(
  question?: string,
  response?: string,
  sub_questions?: string,
  independent?: string,
  dependent?: string,
) {
  return `You are a math problem solver specializing in optimizing step-by-step reasoning processes. Your task is to optimize the existing reasoning trajectory into a more efficient, single self-contained question.
        
    For the original question: ${question}
        
    Here are step-by-step reasoning process:
    ${response}
        
    ${sub_questions}
        
    Here are explanations of key concepts:
    1. self-contained: The optimized question must be solvable independently, without relying on any external information
    2. efficient: The optimized question must be simpler than the original, requiring fewer reasoning steps (these steps are reduced because some solved independent sub-problems become known conditions in the optimized question or are excluded as incorrect explorations)
        
    You can freely reason in your response, but please enclose the your optimized question within <question></question> tags

    The following sub-questions and their answers can serve as known conditions:
    ${independent}
    
    The descriptions of the following questions can be used to form the description of the optimized problem:
    ${dependent}`;
}

function ensemble(question?: string, solutions?: string) {
  return `You are a precise math problem solver. Compare then synthesize the best answer from multiple solutions to solve the following question.

    QUESTION: ${question}

    SOLUTIONS:
    ${solutions}

    Please extend your chain of thought as much as possible; the longer the chain of thought, the better.

    You can freely reason in your response, but please enclose the final answer within <answer></answer> tags (pure number without units and explanations)`;
}

export { direct, multistep, label, contract, ensemble, solve, contract1 };
