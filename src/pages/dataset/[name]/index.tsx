import Head from "next/head";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { handleRouterQuery } from "~/utils/handleRouterQuery";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import type {
  Bbh,
  Gsm8k,
  Hotpotqa,
  Longbench,
  Math,
  Mmlu,
} from "@/interfaces/datasets";

type Dataset = Gsm8k | Bbh | Hotpotqa | Longbench | Math | Mmlu;

type DatasetMap = {
  gsm8k: Gsm8k;
  bbh: Bbh;
  hotpotqa: Hotpotqa;
  longbench: Longbench;
  math: Math;
  mmlu: Mmlu;
};

type DatasetName = keyof DatasetMap;

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
};

export function PaginationControls({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  const getPageUrl = (page: number) => {
    return `${baseUrl}?page=${page}`;
  };

  const renderPageNumbers = () => {
    const totalBlocksToShow = 12;
    const sidePages = Math.floor((totalBlocksToShow - 3) / 2); // Subtract 1 for current, 2 for first/last
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= totalBlocksToShow) {
      // Show all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always add first page
    pages.push(1);

    const start = Math.max(2, currentPage - sidePages);
    const end = Math.min(totalPages - 1, currentPage + sidePages);

    if (start > 2) {
      pages.push("ellipsis");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("ellipsis");
    }

    // Always add last page
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = renderPageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            href={getPageUrl(currentPage - 1)}
            aria-disabled={currentPage === 1}
            tabIndex={currentPage === 1 ? -1 : undefined}
            className={
              currentPage === 1 ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href={getPageUrl(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            href={getPageUrl(currentPage + 1)}
            aria-disabled={currentPage === totalPages}
            tabIndex={currentPage === totalPages ? -1 : undefined}
            className={
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

type ListProps<T extends Dataset> = {
  data: T[];
  name: string;
  currentPage: number;
  itemsPerPage?: number;
};

function List<T extends Dataset>({
  data,
  name,
  currentPage = 0,
  itemsPerPage = 10,
}: ListProps<T>) {
  function getQuestionText(item: any): string {
    if ("question" in item) return item.question;
    if ("input" in item) return item.input;
    if ("problem" in item) return item.problem;
    if ("Question" in item) return item.Question;
    return "Unknown question format";
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  console.log("currentPage");
  console.log(currentPage);

  console.log(paginatedData);

  return (
    <>
      <ul>
        {paginatedData.map((item, index) => {
          const actualIndex = (currentPage - 1) * itemsPerPage + index;

          return (
            <li key={actualIndex} className="mb-4">
              <Link href={`/dataset/${name}/${actualIndex}`}>
                {actualIndex + 1}. {getQuestionText(item)}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/dataset/${name}`}
      />
    </>
  );
}

export default function DatasetPage() {
  const router = useRouter();
  const { name, page } = router.query;
  const [data, setData] = useState<any[]>([]);

  const datasetName = handleRouterQuery(name);

  useEffect(() => {
    if (!isValidDatasetName(name)) return;

    async function loadDataset<T extends DatasetName>(
      name: T,
    ): Promise<DatasetMap[T][]> {
      const module = await import(`@/data/${name}/test.json`);
      return module.default;
    }

    async function fetchData() {
      if (!isValidDatasetName(datasetName)) {
        console.error("Invalid dataset name:", datasetName);
        return;
      }

      const loadedData = await loadDataset(datasetName);
      setData(loadedData);
    }

    fetchData();
  }, [name]);

  if (!isValidDatasetName(name)) {
    return <div>Invalid dataset</div>;
  }

  function isValidDatasetName(name: any): name is DatasetName {
    return ["gsm8k", "bbh", "hotpotqa", "longbench", "math", "mmlu"].includes(
      name,
    );
  }

  const pageNumber = parseInt(page as string, 10);

  // validate page number
  const currentPage = isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;

  return (
    <>
      <Head>
        <title>AoT experiment</title>
        <meta name="description" content="AoT app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ul className="flex list-none flex-col gap-2">
        <List data={data} name={name} currentPage={currentPage} />
      </ul>
    </>
  );
}
