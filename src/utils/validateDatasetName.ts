import type { DatasetName } from "@/interfaces/datasets";

const validNames: DatasetName[] = [
  "gsm8k",
  "bbh",
  "hotpotqa",
  "longbench",
  "math",
  "mmlu",
];

export function isValidDatasetName(name: any): name is DatasetName {
  return validNames.includes(name as DatasetName);
}
