"use client";

import { useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { QueryResult } from "@/lib/types";
import { cn } from "@/lib/utils";

type ResultsPanelProps = {
  result: QueryResult | null;
};

function inferColumnType(values: unknown[]) {
  const firstNonNull = values.find(
    (value) => value !== null && value !== undefined,
  );
  if (firstNonNull === undefined) return "null";
  if (typeof firstNonNull === "number") return "number";
  if (typeof firstNonNull === "boolean") return "boolean";
  return "text";
}

function toCsv(result: QueryResult) {
  const headers = result.columns;
  const rows = result.rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return "";
        const raw = String(value).replaceAll('"', '""');
        return `"${raw}"`;
      })
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  const [sortState, setSortState] = useState<{
    column: string;
    direction: "asc" | "desc";
  } | null>(null);

  const sortedRows = useMemo(() => {
    if (!result || !sortState) return result?.rows ?? [];
    const rows = [...result.rows];
    rows.sort((a, b) => {
      const left = a[sortState.column];
      const right = b[sortState.column];
      const leftText = left === null || left === undefined ? "" : String(left);
      const rightText =
        right === null || right === undefined ? "" : String(right);
      const comparison = leftText.localeCompare(rightText, undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return sortState.direction === "asc" ? comparison : -comparison;
    });
    return rows;
  }, [result, sortState]);

  if (!result) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted-foreground">
        Run a query to see results.
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="h-full min-h-[200px] rounded-md border border-destructive/40 bg-destructive/10 p-3 shadow-sm">
        <p className="mb-2 text-xs font-semibold text-destructive">
          Execution Error
        </p>
        <pre className="whitespace-pre-wrap break-words font-mono text-xs text-destructive">
          {result.error}
        </pre>
      </div>
    );
  }

  const columnTypes = Object.fromEntries(
    result.columns.map((column) => [
      column,
      inferColumnType(result.rows.map((row) => row[column])),
    ]),
  );

  return (
    <div className="flex h-full min-h-[200px] flex-col rounded-md border border-border shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-2 text-xs">
        <p className="text-muted-foreground">
          {result.rowCount} rows • {result.duration_ms.toFixed(2)} ms
          {result.statementCount && result.statementCount > 1
            ? ` • Executed ${result.statementCount} statements`
            : ""}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const csv = toCsv(result);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "query-result.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="mr-1 h-3 w-3" />
          Export CSV
        </Button>
      </div>
      <ScrollArea className="h-full">
        <Table className="font-mono text-xs">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              {result.columns.map((column) => {
                const isActive = sortState?.column === column;
                const isAsc = sortState?.direction === "asc";
                return (
                  <TableHead
                    key={column}
                    className="min-w-[120px] border-r border-border last:border-r-0"
                  >
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() =>
                        setSortState((previous) => {
                          if (!previous || previous.column !== column) {
                            return { column, direction: "asc" };
                          }
                          return {
                            column,
                            direction:
                              previous.direction === "asc" ? "desc" : "asc",
                          };
                        })
                      }
                    >
                      {column}
                      <span className="text-muted-foreground">
                        ({columnTypes[column]})
                      </span>
                      {isActive ? (
                        isAsc ? (
                          <ArrowUpAZ className="h-3 w-3" />
                        ) : (
                          <ArrowDownAZ className="h-3 w-3" />
                        )
                      ) : null}
                    </button>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row, index) => (
              <TableRow key={`row-${index}`}>
                {result.columns.map((column, columnIndex) => {
                  const value = row[column];
                  const numeric = typeof value === "number";
                  return (
                    <TableCell
                      key={`${index}:${columnIndex}`}
                      className={cn(
                        "border-r border-border align-top last:border-r-0",
                        numeric ? "text-right" : "text-left",
                      )}
                    >
                      {value === null ? (
                        <span className="italic text-muted-foreground">
                          null
                        </span>
                      ) : (
                        String(value)
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
