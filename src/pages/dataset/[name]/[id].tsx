import React from "react";
import Head from "next/head";
import Question from "~/components/Question";
import { useRouter } from "next/router";
import { handleRouterQuery } from "~/utils/handleRouterQuery";

import gsm8k from "@/data/gsm8k/test.json";
import bbh from "@/data/bbh/test.json";
import hotpotqa from "@/data/hotpotqa/test.json";
import longbench from "@/data/longbench/test.json";
import math from "@/data/math/test.json";
import mmlu from "@/data/mmlu/test.json";

import type { Gsm8k } from "@/interfaces/datasets";

export default function ProblemPage() {
  const router = useRouter();
  const data: Gsm8k[] = Array.from(gsm8k);

  const id = handleRouterQuery(router.query.id);

  return (
    <>
      <Head>
        <title>AoT experiment</title>
        <meta name="description" content="AoT app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ul className="my-5 grid gap-2.5">
        <Question data={data[Number(id)]} />
      </ul>
    </>
  );
}
