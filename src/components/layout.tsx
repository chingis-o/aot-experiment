import React, { type JSX } from "react";
import { Button } from "@/components/ui/button";
import { datasets } from "~/constants/datasets";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Layout({ children }: { children: JSX.Element }) {
  const router = useRouter();

  function handleRouterQuery(query: string | string[] | undefined) {
    if (query === undefined) {
      return "";
    }

    if (Array.isArray(query)) {
      return query.join("");
    }

    return query;
  }

  const name = handleRouterQuery(router.query.name);

  return (
    <main className="my-10 flex min-h-screen flex-col items-center">
      <div className="container grid max-w-2/3 justify-start">
        <ul className="my-5 flex justify-start gap-2.5">
          {datasets.map((value) => {
            return (
              <li key={value}>
                <Link href={`/dataset/${value}`}>
                  <Button
                    className="cursor-pointer"
                    variant={name === value ? "default" : "outline"}
                  >
                    {value}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
        {children}
      </div>
    </main>
  );
}
