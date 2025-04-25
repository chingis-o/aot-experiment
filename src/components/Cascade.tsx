import React from "react";
import Result from "./Result";
import type { Chain } from "~/interfaces/chain";

export default function Cascade({ chain }: { chain: Chain[] }) {
  return (
    <div className="my-3 w-full">
      <ul>
        {chain.map((chain: Chain, index) => {
          return (
            <div key={index} className="grid grid-cols-[20px_1fr] text-sm">
              <div className="relative ml-1.5 w-[1px] translate-y-2 bg-slate-200">
                <div className="absolute top-0 right-1/2 h-1.5 w-1.5 translate-x-1/2 rounded-full bg-slate-200" />
              </div>
              <div className="pb-3">
                <h3 className="font-semibold">Subquestion</h3>
                <div className="mt-2">{chain.subquestion}</div>
                <Result result={chain.result} loading={false} />
                <h4 className="mt-3 font-medium">Contracted</h4>
                <Result result={chain.contracted} loading={false} />
              </div>
            </div>
          );
        })}
      </ul>
    </div>
  );
}
