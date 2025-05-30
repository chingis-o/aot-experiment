import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";
import Markdown from "react-markdown";

export default function Result({
  answer: text,
  loading,
}: {
  answer: string;
  loading: boolean;
}) {
  const splitPosition =
    text.indexOf("</think>") > 0 ? text.indexOf("</think>") : text.length;

  const thinking = text.substring(0, splitPosition - 1).replace("<think>", "");

  const result = text
    .substring(splitPosition, text.length)
    .replace("</think>", "");

  return (
    <>
      <Accordion
        type="single"
        className="my-2 w-full"
        collapsible
        defaultValue="item-1"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="mb-1.5 bg-[#f7f8fc] px-2.5 py-2 text-sm font-medium">
            {loading ? "Thinking process..." : "Thinking completed"}
          </AccordionTrigger>
          <AccordionContent className="p-1.5 whitespace-pre-line text-[#8f91a8]">
            {thinking.trim()}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="w-full overflow-y-auto">
        <Markdown>{result.trim()}</Markdown>
      </div>
    </>
  );
}
