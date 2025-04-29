export interface Gsm8k {
  question: string;
  answer: string;
  idx: number;
}

export interface Bbh {
  input: string;
  target: string;
}

export interface Hotpotqa {
  id: string;
  question: string;
  answer: string;
  type: string;
  level: string;
  supporting_facts: {
    title: string[];
    sent_id: number[];
  };
  context: {
    title: string[];
    sentences: string[][];
  };
  idx: number;
}

export interface Longbench {
  input: string;
  answers: string[];
  length: number;
  dataset: string;
  language: string;
  all_classes: null;
  _id: string;
}

export interface Math {
  problem: string;
  level: string;
  type: string;
  solution: string;
}

export interface Mmlu {
  Question: string;
  A: string;
  B: string;
  C: string;
  D: string;
  Answer: "A" | "B" | "C" | "D";
}
