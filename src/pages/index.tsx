import Head from "next/head";
import { useState } from "react";
import { ChatOllama } from "@langchain/ollama";
import type { MessageContent } from "@langchain/core/messages";
import bbh from "../data/bbh/test.json";
import gsm8k from "../data/gsm8k/test.json";
import hotpotqa from "../data/hotpotqa/test.json";
import longbench from "../data/longbench/test.json";
import math from "../data/math/test.json";
import mmlu from "../data/mmlu/test.json";
import prompts from "../prompts/examples";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const llm = new ChatOllama({
  model: "deepseek-r1:7b",
  temperature: 0,
});

const tests = [
  { name: "bbh", dataset: bbh },
  { name: "gsm8k", dataset: gsm8k },
  { name: "hotpotqa", dataset: hotpotqa },
  { name: "longbench", dataset: longbench },
  { name: "math", dataset: math },
  { name: "mmlu", dataset: mmlu },
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<MessageContent>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [dataset, setDataset] = useState(
    tests.find((value) => value.name === "bbh")?.dataset,
  );

  return (
    <>
      <Head>
        <title>AoT experiment</title>
        <meta name="description" content="AoT app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="my-10 flex min-h-screen flex-col items-center justify-center">
        <div className="container grid max-w-2/3 justify-start">
          <div className="my-5 grid justify-start gap-2.5">
            {prompts.direct}
          </div>
          <ul className="my-5 grid justify-start gap-2.5">
            {tests.map((data, index) => {
              return (
                <li
                  key={index}
                  onClick={() =>
                    setDataset(
                      tests.find((value) => value.name === data.name)?.dataset,
                    )
                  }
                >
                  <Button className="cursor-pointer">{data.name}</Button>
                </li>
              );
            })}
          </ul>

          <ul className="my-5 grid gap-2.5">
            {Array.isArray(dataset)
              ? dataset.slice(0, 10).map((data, index) => {
                  return (
                    <>
                      <li key={index}>
                        {index + 1} ) {data && data?.input}
                        {data && data?.question}
                        {data && data?.Question}
                        {data && data?.problem}
                      </li>
                      <hr />
                    </>
                  );
                })
              : null}
          </ul>
          <div className="container grid justify-items-start">
            <Textarea
              className="mb-6"
              rows={10}
              onChange={(event) => setPrompt(event.target.value)}
              value={prompt}
            />
            <Button
              className="cursor-pointer px-7 py-1"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setError(false);
                setResult("");
                try {
                  const stream = await llm.stream(prompt);
                  for await (const chunk of stream) {
                    setResult((prev) => `${prev} ${chunk.content}`); // Print each chunk as it arrives
                  }
                } catch (error) {
                  setError(true);
                  console.log(error);
                }
                setLoading(false);
              }}
            >
              Invoke
            </Button>
            {error ? "Error occurred" : ""}
            <div>{String(result ?? "")}</div>
          </div>
        </div>
      </main>
    </>
  );
}
