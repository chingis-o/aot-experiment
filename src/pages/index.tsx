import Head from "next/head";
import Link from "next/link";
import { datasets } from "~/constants/datasets";

export default function Home() {
  return (
    <>
      <Head>
        <title>AoT experiment</title>
        <meta name="description" content="AoT app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
    </>
  );
}
