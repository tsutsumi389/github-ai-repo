import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PageItem = number | "ellipsis";

export function computePageItems(
  currentPage: number,
  totalPages: number,
): readonly PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: PageItem[] = [1];
  const windowStart = Math.max(2, currentPage - 2);
  const windowEnd = Math.min(totalPages - 1, currentPage + 2);

  if (windowStart > 2) {
    items.push("ellipsis");
  }
  for (let p = windowStart; p <= windowEnd; p++) {
    items.push(p);
  }
  if (windowEnd < totalPages - 1) {
    items.push("ellipsis");
  }
  items.push(totalPages);
  return items;
}

function buildHref(page: number, query?: string): string {
  const params = new URLSearchParams();
  if (query) {
    params.set("q", query);
  }
  params.set("page", String(page));
  return `/?${params.toString()}`;
}

type Props = {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly query?: string;
};

export function RepositoryPagination({
  currentPage,
  totalPages,
  query,
}: Props) {
  const items = computePageItems(currentPage, totalPages);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;
  const disabledClass = "pointer-events-none opacity-50";

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={isFirst ? undefined : buildHref(currentPage - 1, query)}
            aria-disabled={isFirst || undefined}
            tabIndex={isFirst ? -1 : undefined}
            className={isFirst ? disabledClass : undefined}
            text="前へ"
          />
        </PaginationItem>
        {items.map((item, idx) => (
          <PaginationItem
            key={item === "ellipsis" ? `ellipsis-${idx}` : `page-${item}`}
          >
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={buildHref(item, query)}
                isActive={item === currentPage}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={isLast ? undefined : buildHref(currentPage + 1, query)}
            aria-disabled={isLast || undefined}
            tabIndex={isLast ? -1 : undefined}
            className={isLast ? disabledClass : undefined}
            text="次へ"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
