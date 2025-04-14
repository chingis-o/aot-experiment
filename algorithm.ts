type Subquestion = {
  description: string;
  answer?: string;
  depend: number[]; // Indices of dependent subquestions
};

type DAG = {
  nodes: Subquestion[];
  edges: [number, number][]; // Dependency edges between subquestions
};

// Decompose the current question into a dependency-based DAG
const decompose = (question: string): DAG => {
  // Simulate LLM invocation to generate subquestions and dependencies
  const subquestions: Subquestion[] = [
    { description: "What are the known values?", depend: [] },
    { description: "Find cos B using sin B.", depend: [0] },
    { description: "Use the Law of Cosines to find BC.", depend: [1] },
  ];

  const edges: [number, number][] = subquestions.flatMap((node, index) =>
    node.depend.map((depIndex) => [depIndex, index] as [number, number]),
  );

  return { nodes: subquestions, edges };
};

// Categorize subquestions into independent and dependent
const categorizeSubquestions = (
  dag: DAG,
): { independent: Subquestion[]; dependent: Subquestion[] } => ({
  independent: dag.nodes.filter((node) => node.depend.length === 0),
  dependent: dag.nodes.filter((node) => node.depend.length > 0),
});

// Contract the DAG into a new independent question
const contract = (
  independent: Subquestion[],
  dependent: Subquestion[],
): string => {
  const knownConditions = independent
    .map((q) => `${q.description}: ${q.answer}`)
    .join(", ");
  const newQuestion = `Given ${knownConditions}, solve: ${dependent.map((q) => q.description).join(", ")}`;
  return newQuestion;
};

// Evaluate whether the algorithm should terminate
const shouldTerminate = (currentQuestion: string): boolean =>
  currentQuestion.includes("final answer");

// Solve the final contracted question
const solveFinalQuestion = (finalQuestion: string): string =>
  `<answer>${finalQuestion.split(":").pop()}</answer>`;

// Main AOT function implemented in a functional style
const atomOfThoughts = (initialQuestion: string): string => {
  const iterate = (
    question: string,
    iteration: number,
    maxDepth: number | null,
  ): string => {
    if (maxDepth !== null && iteration >= maxDepth) {
      return solveFinalQuestion(question);
    }

    // Step 1: Decompose the current question into a DAG
    const dag = decompose(question);

    // Determine the maximum depth if not already set
    const updatedMaxDepth = maxDepth ?? dag.nodes.length;

    // Step 2: Categorize subquestions
    const { independent, dependent } = categorizeSubquestions(dag);

    // Step 3: Contract the DAG into a new independent question
    const nextQuestion = contract(independent, dependent);

    // Termination check
    if (shouldTerminate(nextQuestion)) {
      return solveFinalQuestion(nextQuestion);
    }

    // Recursive call for the next iteration
    return iterate(nextQuestion, iteration + 1, updatedMaxDepth);
  };

  return iterate(initialQuestion, 0, null);
};

// Example usage
const initialQuestion =
  "For a given constant b > 10, there are two possible triangles ABC satisfying AB = 10, AC = b, and sin B = 3/5. Find the positive difference between the lengths of side BC.";
const finalAnswer = atomOfThoughts(initialQuestion);
console.log("Final Answer:", finalAnswer);
