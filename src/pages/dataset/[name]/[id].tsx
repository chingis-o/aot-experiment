import React from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import Question from "~/components/Question";
import { useRouter } from "next/router";
import Link from "next/link";

import gsm8k from "@/data/gsm8k/test.json";

import type { Gsm8k } from "@/interfaces/datasets";

export default function ProblemPage() {
  const router = useRouter();
  const data: Gsm8k[] = Array.from(gsm8k);

  function handleRouterQuery(query: string | string[] | undefined) {
    if (query === undefined) {
      return "";
    }

    if (Array.isArray(query)) {
      return query.join("");
    }

    return query;
  }

  const id = handleRouterQuery(router.query.id);

  return (
    <>
      <Head>
        <title>AoT experiment</title>
        <meta name="description" content="AoT app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="my-10 flex min-h-screen flex-col items-center">
        <div className="container grid max-w-2/3 justify-start">
          <ul className="my-5 flex justify-start gap-2.5">
            <li>
              <Button className="cursor-pointer">
                <Link href={`/dataset/gsm8k`}>gsm8k</Link>
              </Button>
            </li>
          </ul>
          <ul className="my-5 grid gap-2.5">
            <Question data={data[Number(id)]} />
          </ul>
        </div>
      </main>
    </>
  );
}
