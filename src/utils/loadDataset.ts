import type { DatasetName, DatasetMap } from "@/interfaces/datasets";

export async function loadDataset<T extends DatasetName>(
  name: T,
): Promise<DatasetMap[T][]> {
  const module = await import(`@/data/${name}/test.json`);
  return module.default;
}
