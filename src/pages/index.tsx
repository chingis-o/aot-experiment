import Head from "next/head";
import Link from "next/link";

export default function Home() {
  const datasets = ["bbh", "gsm8k", "hotpotqa", "longbench", "math", "mmlu"];

  return (
    <>
      <Head>
        <title>AoT experiment</title>
        <meta name="description" content="AoT app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="my-10 flex justify-center">
        <div className="container w-10/12">
          <h1 className="mb-6">Select a dataset</h1>
          <ul className="flex flex-col gap-0.5">
            {datasets.map((value) => {
              return (
                <li key={value} className="text-xl">
                  <Link href={`/dataset/${value}`}>{value}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </>
  );
}
