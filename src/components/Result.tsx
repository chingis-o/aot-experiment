import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";
import { handleThinkTag } from "~/utils/handleThinkTag";

export default function Result({ result }: { result: string }) {
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
            Thinking completed
          </AccordionTrigger>
          <AccordionContent className="p-1.5 text-[#8f91a8]">
            {handleThinkTag(result).thinking}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div>{handleThinkTag(result).result}</div>
    </>
  );
}
