import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Affiché dans la vue carte mobile */
  hideOnMobile?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  onRowClick,
  caption,
  mobileTitle,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  caption?: string;
  mobileTitle?: (row: T) => ReactNode;
}) {
  return (
    <>
      {/* Tableau : tablette et desktop */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-soft md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            {caption ? <caption className="sr-only">{caption}</caption> : null}
            <thead className="bg-muted/60">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                      col.className,
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr
                  key={getRowId(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "transition-colors",
                    onRowClick && "cursor-pointer hover:bg-accent/50 focus-within:bg-accent/50",
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 align-middle", col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vue carte : mobile */}
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li key={getRowId(row)}>
            <button
              type="button"
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-soft"
            >
              {mobileTitle ? <div className="mb-2 font-medium text-foreground">{mobileTitle(row)}</div> : null}
              <dl className="space-y-2">
                {columns
                  .filter((c) => !c.hideOnMobile)
                  .map((col) => (
                    <div key={col.key} className="flex items-center justify-between gap-3">
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{col.header}</dt>
                      <dd className="text-sm">{col.cell(row)}</dd>
                    </div>
                  ))}
              </dl>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export function Pager({
  page,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Page {page} sur {pages} — {total} élément(s)
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-xl border border-input bg-card px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Précédent
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pages, page + 1))}
          disabled={page >= pages}
          className="rounded-xl border border-input bg-card px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
