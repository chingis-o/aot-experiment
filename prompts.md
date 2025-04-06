## math

### direct

    You are a precise math problem solver. Solve the given math problem step by step:

    QUESTION: {question}
        
    Please extend your chain of thought as much as possible; the longer the chain of thought, the better.
        
    You can freely reason in your response, but please enclose the final answer within <answer></answer> tags (pure number without units and explanations)

### multistep

    You are a precise math problem solver. Solve the given math problem step by step:

    QUESTION: {question}
        
    Please extend your chain of thought as much as possible; the longer the chain of thought, the better.
        
    You can freely reason in your response, but please enclose the final answer within <answer></answer> tags (pure number without units and explanations)

### label

    You are tasked with breaking down a math problem reasoning process into sub-questions.

    Original Question: {question}
    Complete Reasoning Process: {trajectory}

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
        "sub-questions": [
            {{
                "description": "<clear interrogative question>",
                "answer": <numerical value without units>,
                "depend": [<indices of prerequisite sub-questions>]
            }},
            ...
        ],
        "answer": {answer}
    }}

### contract

    You are a math problem solver specializing in optimizing step-by-step reasoning processes. Your task is to optimize the existing reasoning trajectory into a more efficient, single self-contained question.
        
    For the original question: {question}
        
    Here are step-by-step reasoning process:
    {response}
        
    {sub_questions}
        
    Here are explanations of key concepts:
    1. self-contained: The optimized question must be solvable independently, without relying on any external information
    2. efficient: The optimized question must be simpler than the original, requiring fewer reasoning steps (these steps are reduced because some solved independent sub-problems become known conditions in the optimized question or are excluded as incorrect explorations)
        
    You can freely reason in your response, but please enclose the your optimized question within <question></question> tags

    The following sub-questions and their answers can serve as known conditions:
    {independent}
    
    The descriptions of the following questions can be used to form the description of the optimized problem:
    {dependent}    

### ensemble

    You are a precise math problem solver. Compare then synthesize the best answer from multiple solutions to solve the following question.

    QUESTION: {question}

    SOLUTIONS:
    {solutions}

    Please extend your chain of thought as much as possible; the longer the chain of thought, the better.

    You can freely reason in your response, but please enclose the final answer within <answer></answer> tags (pure number without units and explanations)

## multichoice

### direct

    You are a precise multiple choice question solver. Select the most correct option for the given question:

    QUESTION: {question}
        
    Please extend your chain of thought as much as possible; the longer the chain of thought, the better.
        
    You can freely reason in your response, but please enclose your final option within <answer>single letter of your chosen option</answer> tags.

## multistep

    You are a precise multiple choice question solver. Break down complex questions into simpler sub-questions to select the most correct option:

    QUESTION: {question}
        
    Please extend your chain of thought as much as possible; the longer the chain of thought, the better.
        
    You can freely reason in your response, but please
    - Continuously raise sub-questions until the problem can be solved.
    - enclose your final option within <answer>single letter of your chosen option</answer> tags.

## label

    You are tasked with breaking down a multiple choice question reasoning process into sub-questions.

    Original Question: {question}
    Complete Reasoning Process: {trajectory}

    Instructions:
    1. Break down the reasoning process into a series of sub-questions
    2. Each sub-question should:
        - Be written in interrogative form
        - Have a clear answer
        - List its other sub-questions' indexes it depends (0-based, can be an empty list)
    3. Dependencies are defined as information needed to answer the current sub-question that:
        - Does NOT come directly from the original question
        - MUST come from the answers of previous sub-questions

    Format your response as the following JSON object:
    {{
        "thought": "<the thought process of how to step by step propose the sub-questions until the answer of the original question in the given reasoning process is obtained>",
        "sub-questions": [
            {{
                "description": "<the description of the sub-question>", 
                "answer": <the answer to the sub-question>,
                "depend": [<indices of the dependent sub-questions>, ...]
            }}
        ],
        "answer": "{answer}"
    }}

### contract

    You are a multiple choice question solver specializing in optimizing step-by-step reasoning processes. Your task is to optimize the existing reasoning trajectory into a more efficient, single self-contained question.
        
    For the original question: {question}
    
    Here are step-by-step reasoning process:
    {response}
    
    {sub_questions}
    
    Here are explanations of key concepts:
    1. self-contained: The optimized question must be solvable independently, without relying on any external information
    2. efficient: The optimized question must be simpler than the original, requiring fewer reasoning steps and having a clearer reasoning process (these steps are reduced because some solved sub-problems become known conditions in the optimized question or are excluded as incorrect explorations)
    
    Note: Since this is a multiple choice question, the optimized question must completely retain the options of the original question.
    
    You can freely reason in your response, but please enclose the your optimized question within <question></question> tags

    The following sub-questions and their answers can serve as known conditions:
    {independent}

    The descriptions of the following questions can be used to form the description of the optimized problem:
    {dependent}

### ensemble

You are a precise multiple choice question solver. Compare then synthesize the best answer from multiple solutions to select the most correct option:

    QUESTION: {question}

    SOLUTIONS:
    {solutions}
        
    Extend your chain of thought as much as possible; the longer the chain of thought, the better.

    You can freely reason in your response, even propose new reasoning to get a better answer than all solutions, but please mark the final option with <answer>single letter of your chosen option</answer> tags

## multihop

### cot

    Please solve the multi-hop question below based on the following contexts step by step:

    QUESTION: 
    {question}

    CONTEXTS: 
    {contexts}

    Provide your response in this JSON format:
    {{
        "thought": "Give your step-by-step reasoning process",
        "answer": "Your precise answer"
    }}

### direct

    You are a precise question-answering solver. Answer the following question using only the provided contexts:

    QUESTION: 
    {question}

    CONTEXTS: 
    {contexts}

    INSTRUCTIONS:
    1. Answer Selection Rules:
       a) Use ONLY information from the given contexts
       b) For yes/no questions: Answer with exactly "yes" or "no"
       c) For other questions: Extract a precise answer that is:
          - CONTINUOUS: Must be an unbroken segment from the text
          - EXACT: Use the original text without modifications
          - MINIMAL: Include only the essential information

    2. Supporting Evidence:
       - Select ALL relevant sentences that lead to your answer
       - Include complete context when needed
       - You may use ellipsis (...) to connect relevant parts of long sentences
       
       EXAMPLE:
       Question: "Where was the rock band Letters to Cleo formed?"
       Supporting Sentences: 
       ✓ Good: "Letters to Cleo are an alternative rock band from Boston, Massachusetts..."
       × Bad: "The band was formed in Boston, Massachusetts" (lacks subject reference)

    3. Answer Extraction Guidelines:
       a) CONTINUOUS text only:
          Question: "Where is BTS from?"
          Context: "BTS is a South Korean boy band formed in Seoul"
          ✓ CORRECT: "Seoul"
          × WRONG: "Seoul, South Korea" (combining segments)

       b) EXACT text:
          Question: "When was Nixon president?"
          Context: "Nixon was president from 1969 until 1974"
          ✓ CORRECT: "1969 until 1974"
          × WRONG: "1969-1974" (modified text)

       c) MINIMAL answer:
          Question: "What was Tesla's profession?"
          Context: "Nikola Tesla was a brilliant Serbian-American inventor"
          ✓ CORRECT: "inventor"
          × WRONG: "brilliant Serbian-American inventor" (includes unnecessary details)

    4. Important:
       - Handle unclear questions by focusing on the main intent
       - Avoid common pitfalls like combining disconnected information
       - Prioritize precision over completeness
    
    5. Robustness:
        Sometimes the question may have some errors, leading to a situation where there is actually no answer in the context. I hope you can infer what the questioner is actually asking and then respond according to the above process.

    Provide your response in this JSON format:
    {{
        "question": {question},
        "thought": "give your step by step thought process here",
        "supporting_sentences": [
            "Include ALL sentences needed to justify your answer",
            "Use ... for long sentences when appropriate"
        ],
        "answer": "Your precise answer following the instructions above" or "none" if no answer can be found
    }}

### multistep

    You are a precise question-answering solver. Breaks down multi-hop questions into single-hop sub-questions to answer the following question using only the provided contexts:

    QUESTION: 
    {question}

    CONTEXTS: 
    {contexts}

    INSTRUCTIONS:
    1. Answer Selection Rules:
        a) Use ONLY information from the given contexts
        b) For yes/no questions: Answer with exactly "yes" or "no"
        c) For other questions: Extract a precise answer that is:
            - CONTINUOUS: Must be an unbroken segment from the text
            - EXACT: Use the original text without modifications
            - MINIMAL: Include only the essential information

    2. Supporting Evidence:
        - Select ALL relevant sentences that lead to your answer
        - Include complete context when needed
        - You may use ellipsis (...) to connect relevant parts of long sentences
           
        EXAMPLE:
        Question: "Where was the rock band Letters to Cleo formed?"
        Supporting Sentences: 
        ✓ Good: "Letters to Cleo are an alternative rock band from Boston, Massachusetts..."
        × Bad: "The band was formed in Boston, Massachusetts" (lacks subject reference)

    3. Answer Extraction Guidelines:
        a) CONTINUOUS text only:
            Question: "Where is BTS from?"
            Context: "BTS is a South Korean boy band formed in Seoul"
            ✓ CORRECT: "Seoul"
            × WRONG: "Seoul, South Korea" (combining segments)

        b) EXACT text:
            Question: "When was Nixon president?"
            Context: "Nixon was president from 1969 until 1974"
            ✓ CORRECT: "1969 until 1974"
            × WRONG: "1969-1974" (modified text)

        c) MINIMAL answer:
            Question: "What was Tesla's profession?"
            Context: "Nikola Tesla was a brilliant Serbian-American inventor"
            ✓ CORRECT: "inventor"
            × WRONG: "brilliant Serbian-American inventor" (includes unnecessary details)

    4. Important:
        - Handle unclear questions by focusing on the main intent
        - Avoid common pitfalls like combining disconnected information
        - Prioritize precision over completeness
           
    5. Robustness:
        Sometimes the question may have some errors, leading to a situation where there is actually no answer in the context. I hope you can infer what the questioner is actually asking and then respond according to the above process.

    Provide your response in this JSON format:
    {{
        "question": {question},
        "thought": "give your step by step thought process here",
        "sub-questions": [
            {{
                "description": "the description of the sub-question",
                "supporting_sentences": [
                    "Include ALL sentences needed to justify your answer to this sub-question",
                    "Use ... for long sentences when appropriate"
                ],
                "answer": "Answer to this sub-question"
            }},
            ...more sub-questions as needed
        ],
        "conclusion": "Explain how the sub-answers combine to answer the main question",
        "answer": "Your precise answer to the main question" or "none" if no answer can be found
    }}

### label

    For the original question: {question},
    We have broken it down into the following sub-questions:
    SUB-QUESTIONS:
    {result["sub-questions"]}
    And obtained a complete reasoning process for the original question:
    {result}
    We define the dependency relationship between sub-questions as: which information in the current sub-question description does not come directly from the original question and contexts, but from the results of other sub-questions.
        
    You are a question answering expert specializing in analyzing the dependency relationships between these sub-questions. Please return a JSON object that expresses a complete reasoning trajectory for the original question, including the question, answer, supporting evidence, and dependency relationships of each sub-question. The dependency relationships are represented by the indices of the dependent sub-questions in SUB-QUESTIONS, starting from zero.

    Format your response as the following JSON object:
        {
            "thought": "Give your thought process here",
            "sub-questions": [
    '''
        for i, sub_q in enumerate(result["sub-questions"]):
        formatter += f'''                {{"description": "{sub_q["description"]}", "answer": "{sub_q["answer"]}", "supporting_sentences": {sub_q["supporting_sentences"]}, "depend": [<indices of the dependent sub-questions>, ...]}}'''
        if i != len(result["sub-questions"]) - 1:
            formatter += ",\n"
        else:
            formatter += "\n            ]\n        }"

### contract

    You are a precise question-answering solver specializing in optimizing step-by-step reasoning processes. Your task is to optimize the existing reasoning trajectory into a more efficient, single-hop and self-contained question.
        
    For the original question: {question}
        
    Here are the contexts that can be used to answer the original question (but only some of them can be directly used to solve the question):
    {contexts}
        
    Here are step-by-step reasoning process:
    {response}
        
    {sub_questions}
        
    Here are explanations of key concepts:
    1. self-contained: The optimized question must be solvable independently, without relying on any external information
    2. efficient: The optimized question must be simpler than the original, requiring fewer reasoning steps and having a clearer reasoning process (these steps are reduced because some solved sub-problems become known conditions in the optimized question or are excluded as incorrect explorations)
        
    You can freely reason in your response, but please enclose the your optimized question within <question></question> tags, and enclose the complete context needed to answer the optimized question within <context></context> tags

    The following sub-questions and their answers can serve as known conditions:
    {independent}

    The descriptions of the following questions can be used to form the description of the optimized problem:
    {dependent}

### ensemble

    You are a precise question answering expert. Compare then synthesize the best answer from multiple solutions to solve the following question.
        
    QUESTION:
    {question}

    CONTEXTS:
    {contexts}

    SOLUTIONS:
    {solutions}

    INSTRUCTIONS:
    1. Answer Selection Rules:
        a) Use ONLY information from the given contexts
        b) For yes/no questions: Answer with exactly "yes" or "no"
        c) For other questions: Extract a precise answer that is:
            - CONTINUOUS: Must be an unbroken segment from the text
            - EXACT: Use the original text without modifications
            - MINIMAL: Include only the essential information

    2. Supporting Evidence:
        - Select ALL relevant sentences that lead to your answer
        - Include complete context when needed
        - You may use ellipsis (...) to connect relevant parts of long sentences
           
        EXAMPLE:
        Question: "Where was the rock band Letters to Cleo formed?"
        Supporting Sentences: 
        ✓ Good: "Letters to Cleo are an alternative rock band from Boston, Massachusetts..."
        × Bad: "The band was formed in Boston, Massachusetts" (lacks subject reference)

    3. Answer Extraction Guidelines:
        a) CONTINUOUS text only:
            Question: "Where is BTS from?"
            Context: "BTS is a South Korean boy band formed in Seoul"
            ✓ CORRECT: "Seoul"
            × WRONG: "Seoul, South Korea" (combining segments)

        b) EXACT text:
            Question: "When was Nixon president?"
            Context: "Nixon was president from 1969 until 1974"
            ✓ CORRECT: "1969 until 1974"
            × WRONG: "1969-1974" (modified text)

        c) MINIMAL answer:
            Question: "What was Tesla's profession?"
            Context: "Nikola Tesla was a brilliant Serbian-American inventor"
            ✓ CORRECT: "inventor"
            × WRONG: "brilliant Serbian-American inventor" (includes unnecessary details)

    4. Important:
        - Handle unclear questions by focusing on the main intent
        - Avoid common pitfalls like combining disconnected information
        - Prioritize precision over completeness
        
    5. Robustness:
        Sometimes the question may have some errors, leading to a situation where there is actually no answer in the context. I hope you can infer what the questioner is actually asking and then respond according to the above process.

    Format your response as the following JSON object:
    {{
        "question": "{question}",
        "thought": "Explain your analysis of the different results and why you chose the final answer",
        "supporting_sentences": [
            "Include ALL sentences needed to justify your answer",
            "Use ... for long sentences when appropriate"
        ],
        "answer": "The most reliable answer following the answer instructions"
    }}

