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
    <main className="grid min-h-screen grid-cols-[250px_1fr] bg-[#f7f8fc]">
      <aside className="flex flex-col pl-6">
        <div className="grid place-items-center pt-4">
          <Link
            href="/"
            className="text-primary-foreground text-xl font-bold tracking-wider select-none"
          >
            Atom of Thoughts
          </Link>
        </div>
        <menu className="mt-5 flex flex-col gap-2">
          {datasets.map((value) => {
            return (
              <li key={value} className="text-xl">
                <Link href={`/dataset/${value}`}>
                  <Button
                    className="cursor-pointer"
                    variant={name === value ? "default" : "secondary"}
                  >
                    {value}
                  </Button>
                </Link>
              </li>
            );
          })}
        </menu>
      </aside>
      <div className="grid max-h-screen justify-start overflow-y-scroll rounded-md bg-white p-10">
        {children}
      </div>
    </main>
  );
}
