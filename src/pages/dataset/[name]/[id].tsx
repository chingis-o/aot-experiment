import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import Question from "@/components/Question";
import { isValidDatasetName } from "@/utils/validateDatasetName";
import { handleRouterQuery } from "@/utils/handleRouterQuery";
import { loadDataset } from "@/utils/loadDataset";

export default function QuestionPage() {
  const router = useRouter();
  const name = handleRouterQuery(router.query.name);
  const id = handleRouterQuery(router.query.id);

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!isValidDatasetName(name)) {
        console.error("Invalid dataset name:", name);
        setLoading(false);
        return;
      }

      try {
        const data = await loadDataset(name); // T[] where T is Gsm8k, Bbh, etc.
        const index = parseInt(id, 10);

        if (isNaN(index) || index < 0 || index >= data.length) {
          console.error("Invalid question index:", id);
          setLoading(false);
          return;
        }

        setItem(data[index]);
      } catch (err) {
        console.error("Failed to load dataset:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [name, id]);

  if (!isValidDatasetName(name)) {
    return <div>Dataset not found</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!item) {
    return <div>Question not found</div>;
  }

  return (
    <>
      <Head>
        <title>AoT experiment</title>
        <meta name="description" content="AoT app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ul className="my-5 grid gap-2.5">
        <Question data={item} />
      </ul>
    </>
  );
}
