import Head from "next/head";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { handleRouterQuery } from "~/utils/handleRouterQuery";

import type {
  Bbh,
  Gsm8k,
  Hotpotqa,
  Longbench,
  Math,
  Mmlu,
} from "@/interfaces/datasets";

type Dataset = Gsm8k | Bbh | Hotpotqa | Longbench | Math | Mmlu;

type DatasetMap = {
  gsm8k: Gsm8k;
  bbh: Bbh;
  hotpotqa: Hotpotqa;
  longbench: Longbench;
  math: Math;
  mmlu: Mmlu;
};

type DatasetName = keyof DatasetMap;

function List<T extends Dataset>({ data, name }: { data: T[]; name: string }) {
  function getQuestionText(item: any): string {
    if ("question" in item) return item.question;
    if ("input" in item) return item.input;
    if ("problem" in item) return item.problem;
    if ("Question" in item) return item.Question;
    return "Unknown question format";
  }

  return data.slice(0, 10).map((value, index) => {
    return (
      <>
        <li key={index} className="mb-4">
          <Link href={`/dataset/${name}/${index}`}>
            {index + 1}. {getQuestionText(value)}
          </Link>
        </li>
        <hr />
      </>
    );
  });
}

export default function DatasetPage() {
  const router = useRouter();
  const { name } = router.query;
  const [data, setData] = useState<any[]>([]);

  const datasetName = handleRouterQuery(name);

  useEffect(() => {
    if (!isValidDatasetName(name)) return;

    async function loadDataset<T extends DatasetName>(
      name: T,
    ): Promise<DatasetMap[T][]> {
      const module = await import(`@/data/${name}/test.json`);
      return module.default;
    }

    async function fetchData() {
      if (!isValidDatasetName(datasetName)) {
        console.error("Invalid dataset name:", datasetName);
        return;
      }

      const loadedData = await loadDataset(datasetName);
      setData(loadedData);
    }

    fetchData();
  }, [name]);

  if (!isValidDatasetName(name)) {
    return <div>Invalid dataset</div>;
  }

  function isValidDatasetName(name: any): name is DatasetName {
    return ["gsm8k", "bbh", "hotpotqa", "longbench", "math", "mmlu"].includes(
      name,
    );
  }

  return (
    <>
      <Head>
        <title>AoT experiment</title>
        <meta name="description" content="AoT app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ul className="flex list-none flex-col gap-2">
        <List data={data} name={name} />
      </ul>
    </>
  );
}
