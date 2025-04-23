import Head from "next/head";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import gsm8k from "@/data/gsm8k/test.json";

import type { Gsm8k } from "@/interfaces/datasets";

export default function DatasetPage() {
  const router = useRouter();

  function List({ data }: { data: Gsm8k[] }) {
    console.log("dateset size:", data.length);

    return data.slice(0, 10).map((value, index) => {
      return (
        <>
          <li key={index} className="mb-4">
            <Link href={`/dataset/${router.query.name}/${value.idx}`}>
              {index + 1}. {value.question}
            </Link>
          </li>
          <hr />
        </>
      );
    });
  }

  const data = Array.from(gsm8k);

  return (
    <>
      <Head>
        <title>AoT experiment</title>
        <meta name="description" content="AoT app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="my-10 flex justify-center">
        <div className="container w-10/12">
          <ul className="flex list-none flex-col gap-2">
            {router.query.name === "gsm8k" ? (
              <List data={data} />
            ) : (
              "No available"
            )}
          </ul>
        </div>
      </main>
    </>
  );
}
