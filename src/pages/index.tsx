import Head from "next/head";
import { Button } from "@/components/ui/button";
import Question from "~/components/Question";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import gsm8k from "../data/gsm8k/test.json";

export default function Home() {
  return (
    <>
      <Head>
        <title>AoT experiment</title>
        <meta name="description" content="AoT app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="my-10 flex min-h-screen flex-col items-center">
        <div className="container grid max-w-2/3 justify-start">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <ul className="my-5 flex justify-start gap-2.5">
            <li>
              <Button className="cursor-pointer">gsm8k</Button>
            </li>
          </ul>
          <ul className="my-5 grid gap-2.5">
            <Question data={gsm8k[0]} />
          </ul>
        </div>
      </main>
    </>
  );
}
