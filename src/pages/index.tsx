import Head from "next/head";
import { useState } from "react";
import { ChatOllama } from "@langchain/ollama";
import type { MessageContent } from "@langchain/core/messages";

const llm = new ChatOllama({
  model: "deepseek-r1:7b",
  temperature: 0,
});

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<MessageContent>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  return (
    <>
      <Head>
        <title>AoT experiment</title>
        <meta name="description" content="AoT app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <textarea
          className="mb-6 rounded-md border-2 border-blue-300 px-4 py-1 outline focus:border-blue-400"
          onChange={(event) => setPrompt(event.target.value)}
        >
          {prompt}
        </textarea>
        <button
          className="cursor-pointer rounded-md border-2 border-blue-300 px-7 py-1"
          disabled={loading}
          onClick={async () => {
            console.log("call");
            setLoading(true);
            setError(false);
            setResult("");
            try {
              const result = await llm.invoke(prompt);

              setResult(result.content);
            } catch (error) {
              setError(true);
              console.log(error);
            }
            setLoading(false);
          }}
        >
          Invoke
        </button>
        {loading ? "generating..." : ""}
        {error ? "Error occurred" : ""}
        <div>{String(result ?? "")}</div>
      </main>
    </>
  );
}
