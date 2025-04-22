import React from "react";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import Result from "./Result";

export default function QuestionBlock({
  question,
  loading,
  generate,
  abort,
  error,
  result,
}: {
  question: string;
  loading: any;
  generate: any;
  abort: any;
  error: any;
  result: any;
}) {
  return (
    <>
      <div>{question}</div>
      <Button
        className="my-2 cursor-pointer px-7 py-1"
        disabled={loading}
        onClick={generate}
      >
        Generate
      </Button>
      <Button
        className="my-2 cursor-pointer px-7 py-1"
        onClick={() => abort()}
        type="reset"
      >
        Cancel
      </Button>
      {error ? "Error occurred" : ""}
      {result && (
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>{String(result)}</AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      <Result result="<think>Tought process</think> Hello! How can I assist you today? 😊" />
    </>
  );
}
