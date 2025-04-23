import React, { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useLllm } from "~/hooks/llm.hook";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Result from "./Result";
import Cascade from "./Cascade";
import { parseDag, type DAG } from "@/utils/parseDag";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import prompts from "../prompts/examples";

const { label, solve, contract1 } = prompts;

export default function GenerateResponse({ question }: { question: string }) {
  const [prompt, setPrompt] = useState(label(question));
  const [subquestions, setSubquestions] = useState<DAG>();
  const { generate, result, loading, error, abort } = useLllm();

  // chain algorithm
  const [chain, setChain] = useState([
    { subquestion: "", result: "", contracted: "" },
  ]);

  async function handleClick() {
    const result = await generate(prompt);
    setSubquestions(parseDag(result as string));
  }

  async function handleChain() {}

  return (
    <div className="container grid justify-items-start">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Edit Profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value="Pedro Duarte" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input id="username" value="@peduarte" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Textarea
        className="mb-3"
        rows={10}
        onChange={(event) => setPrompt(event.target.value)}
        value={prompt}
      />
      <div className="flex w-full justify-end">
        {loading ? (
          <Button
            className="my-2 cursor-pointer px-7 py-1"
            onClick={() => abort()}
            type="reset"
          >
            Cancel
          </Button>
        ) : (
          <Button
            className="my-2 cursor-pointer px-7 py-1"
            onClick={handleClick}
          >
            Generate
          </Button>
        )}
      </div>
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
      <Cascade
        question={question}
        subquestions={subquestions}
        handleClick={handleChain}
      />
    </div>
  );
}
