import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { useLllm } from "~/hooks/llm.hook";
import Cascade from "./Cascade";
import autoAnimate from "@formkit/auto-animate";

import Result from "./Result";

export default function GenerateResponse({ question }: { question: string }) {
  const { generate, decomposed, loading, error, abort, chain } = useLllm();
  const parent = useRef(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  return (
    <div className="container grid justify-items-start" ref={parent}>
      <div className="my-2 flex w-full justify-end py-1">
        {loading ? (
          <Button onClick={() => abort()} type="reset">
            Cancel
          </Button>
        ) : (
          <Button onClick={() => generate(question)}>Generate</Button>
        )}
      </div>
      {error ? "Error occurred" : ""}
      {decomposed && <Result answer={decomposed} loading={loading} />}
      <Cascade chain={chain} />
    </div>
  );
}
