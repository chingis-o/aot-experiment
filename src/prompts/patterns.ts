function direct(
  role: string,
  question: string,
  contexts: string,
  instructions: string,
  format: string,
) {
  return `${role}

    QUESTION: ${question}
        
    CONTEXTS: 
    ${contexts}

    INSTRUCTIONS:
    ${instructions}

    ${format}`;
}

function multistep(
  role: string,
  question: string,
  contexts: string,
  instructions: string,
  format: string,
) {
  return `${role}

    QUESTION: ${question}
        
    CONTEXTS: 
    ${contexts}

    INSTRUCTIONS:
    ${instructions}

    ${format}`;
}

function label(
  role: string,
  question: string,
  trajectory: string,
  format: string,
) {
  return `${role}

    Original Question: ${question}
    Complete Reasoning Process: ${trajectory}

    Instructions:
    1. Break down the reasoning process into a series of sub-questions
    2. Each sub-question should:
        - Be written in interrogative form
        - Have a clear numerical answer
        - List its other sub-questions' indexes it depends (0-based, can be an empty list)
    3. Dependencies are defined as information needed to answer the current sub-question that:
        - Does NOT come directly from the original question
        - MUST come from the answers of previous sub-questions

    ${format}`;
}

function contract(
  role: string,
  question: string,
  response: string,
  subquestions: string,
  format: string,
  independent: string,
  dependent: string,
) {
  return `${role}
        
    For the original question: ${question}
        
    Here are step-by-step reasoning process:
    ${response}
        
    ${subquestions}
        
    Here are explanations of key concepts:
    1. self-contained: The optimized question must be solvable independently, without relying on any external information
    2. efficient: The optimized question must be simpler than the original, requiring fewer reasoning steps (these steps are reduced because some solved independent sub-problems become known conditions in the optimized question or are excluded as incorrect explorations)
        
    ${format}

    The following sub-questions and their answers can serve as known conditions:
    ${independent}
    
    The descriptions of the following questions can be used to form the description of the optimized problem:
    ${dependent}`;
}

function ensemble(
  role: string,
  question: string,
  contexts: string,
  solutions: string,
  instructions: string,
  format: string,
) {
  return `${role}

    QUESTION: ${question}

    CONTEXTS:
    ${contexts}

    SOLUTIONS:
    ${solutions}

    INSTRUCTIONS:
    ${instructions}

    ${format}`;
}

function formatting(question: string) {
  return `You can freely reason in your response, but please enclose the final answer within <answer></answer> tags (pure number without units and explanations)

    Format your response as the following JSON object:
    {{
        "question": "${question}",
        "thought": "Explain your analysis of the different results and why you chose the final answer",
        "supporting_sentences": [
            "Include ALL sentences needed to justify your answer",
            "Use ... for long sentences when appropriate"
        ],
        "answer": "The most reliable answer following the answer instructions"
    }}`;
}

const pattern = {
  direct,
  multistep,
  label,
  contract,
  ensemble,
  formatting,
};

export default pattern;
