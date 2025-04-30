import React, { useState } from "react";
import GenerateResponse from "./GenerateResponse";
import prompts from "../prompts/examples";
import Prompt from "./Prompt";
import {
  type QuestionData,
  getQuestionText,
  getAnswerText,
  getIndex,
} from "@/types/question";

const { label } = prompts;

interface QuestionProps {
  data: QuestionData;
}

function getAnswerComponent(data: QuestionData) {
  if ("A" in data && "B" in data && "C" in data && "D" in data) {
    return (
      <>
        <p>
          <strong>Options:</strong>
        </p>
        <ul className="ml-5 list-disc">
          <li>A: {data.A}</li>
          <li>B: {data.B}</li>
          <li>C: {data.C}</li>
          <li>D: {data.D}</li>
        </ul>
        <p>
          ✅ Correct answer: <strong>{data.Answer}</strong>
        </p>
      </>
    );
  }

  if ("context" in data && Array.isArray(data.context.sentences)) {
    return (
      <>
        <p>
          <strong>Context:</strong>
        </p>
        <ul className="ml-5 list-disc">
          {data.context.sentences.map((sent, i) => (
            <li key={i}>{sent}</li>
          ))}
        </ul>
        <p>
          ✅ Correct answer: <strong>{data.answer}</strong>
        </p>
      </>
    );
  }

  return (
    <p>
      ✅ Correct answer: <strong>{getAnswerText(data)}</strong>
    </p>
  );
}

export default function Question({ data }: QuestionProps) {
  const [prompt, setPrompt] = useState(label(getQuestionText(data)));

  return (
    <>
      <div className="grid grid-cols-[1fr_auto]">
        <li className="mr-3 flex gap-2.5">
          {`${getIndex(data) + 1}) ${getQuestionText(data)}`}
        </li>
        <Prompt prompt={prompt} setPrompt={setPrompt} />
      </div>
      <hr />
      <li className="text-sm text-gray-700">{getAnswerComponent(data)}</li>
      <hr />
      <GenerateResponse prompt={prompt} />
    </>
  );
}
