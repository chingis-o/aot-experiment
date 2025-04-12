const prompt = {
  direct: `You are a precise math problem solver. Solve the given math problem step by step:

    QUESTION: {question}
        
    Please extend your chain of thought as much as possible; the longer the chain of thought, the better.
        
    You can freely reason in your response, but please enclose the final answer within <answer></answer> tags (pure number without units and explanations)`,
};

export default prompt;
