import React from "react";
import GenerateResponse from "./GenerateResponse";

export default function Question({ data }: { data: any }) {
  return (
    <>
      <li className="flex gap-2.5">{`1 ) ${data && data?.question}`}</li>
      <hr />
      <li>{`Correct answer: ${data && data?.answer}`}</li>
      <hr />
      <GenerateResponse question={data?.question} />
    </>
  );
}
