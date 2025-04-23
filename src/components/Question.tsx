import React, { useState } from "react";
import GenerateResponse from "./GenerateResponse";
import prompts from "../prompts/examples";
import Prompt from "./Prompt";

const { label } = prompts;

export default function Question({ data }: { data: any }) {
  const [prompt, setPrompt] = useState(label(data && data?.question));

  return (
    <>
      <div className="grid grid-cols-[1fr_auto]">
        <li className="mr-3 flex gap-2.5">{`1 ) ${data && data?.question}`}</li>
        <Prompt prompt={prompt} setPrompt={setPrompt} />
      </div>
      <hr />
      <li>{`Correct answer: ${data && data?.answer}`}</li>
      <hr />
      <GenerateResponse question={data?.question} prompt={prompt} />
    </>
  );
}
