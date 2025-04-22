export type Subquestion = {
  description: string;
  answer?: string;
  depend: number[]; // Indices of dependent subquestions
};

export type DAG = {
  nodes: Subquestion[];
  edges: [number, number][]; // Dependency edges between subquestions
};

export function parseDag(plainText: string): DAG | undefined {
  const jsonBlockRegex = /``` json\s*({[\s\S]*?})\s* ```/;
  const jsonMatch = plainText.match(jsonBlockRegex);

  if (!jsonMatch) {
    return undefined;
  }

  const jsonContent = jsonMatch[1];

  function formatSubquestions(input: any): Subquestion[] {
    return input[" sub Questions "].map((value: any) => {
      return {
        description: value[" description "].trim(),
        depend: value[" depend "],
      };
    });
  }

  const subquestions = formatSubquestions(JSON.parse(jsonContent ?? ""));

  const edges: [number, number][] = subquestions.flatMap((node, index) =>
    node.depend.map((depIndex) => [depIndex, index] as [number, number]),
  );

  return { nodes: subquestions, edges };
}
