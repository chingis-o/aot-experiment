import React, { useEffect, useRef } from "react";
import Result from "./Result";
import type { Chain } from "~/interfaces/chain";
import autoAnimate from "@formkit/auto-animate";

export default function Cascade({ chain }: { chain: Chain[] }) {
  const parent = useRef(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  return (
    <div className="my-3 w-full">
      <ul ref={parent}>
        {chain.map((chain: Chain, index) => {
          return (
            <div key={index} className="grid grid-cols-[20px_1fr] text-sm">
              <div className="relative ml-1.5 w-[1px] translate-y-4 bg-slate-200">
                <div className="absolute top-0 right-1/2 h-1.5 w-1.5 translate-x-1/2 rounded-full bg-slate-200" />
              </div>
              <div className="pb-9">
                <div className="mt-2 mb-5 text-base font-medium ">
                  {chain.subquestion}
                </div>
                <Result answer={chain.result} loading={false} />
                {/* <h4 className="mt-3 font-medium">Contracted</h4>
                <Result result={chain.contracted} loading={false} /> */}
              </div>
            </div>
          );
        })}
      </ul>
    </div>
  );
}
