"use client";

import { Clock3, Eraser } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { QueryHistoryEntry } from "@/store";

type QueryHistoryProps = {
  entries: QueryHistoryEntry[];
  onLoad: (sql: string) => void;
  onClear: () => void;
};

function truncateSql(sql: string) {
  const singleLine = sql.replace(/\s+/g, " ").trim();
  if (singleLine.length <= 72) return singleLine;
  return `${singleLine.slice(0, 72)}...`;
}

export function QueryHistory({ entries, onLoad, onClear }: QueryHistoryProps) {
  return (
    <div className="flex h-full flex-col rounded-md border border-border shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-2">
        <p className="text-xs font-medium">Query History</p>
        <Button size="sm" variant="ghost" onClick={onClear}>
          <Eraser className="mr-1 h-3 w-3" />
          Clear
        </Button>
      </div>
      <ScrollArea className="h-full">
        <div className="space-y-1 p-2">
          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="w-full rounded-md border border-border p-2 text-left hover:bg-accent"
              onClick={() => onLoad(entry.sql)}
            >
              <p className="truncate font-mono text-xs">{truncateSql(entry.sql)}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock3 className="h-3 w-3" />
                {new Date(entry.timestamp).toLocaleString()} • {entry.rowCount} rows
              </p>
            </button>
          ))}
          {entries.length === 0 ? (
            <p className="p-2 text-xs text-muted-foreground">No history yet.</p>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  );
}

