"use client";

import { useMemo, useState, memo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Database,
  RefreshCw,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SchemaTable } from "@/lib/types";
import { cn } from "@/lib/utils";

type SchemaExplorerProps = {
  tables: SchemaTable[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onRefresh: () => Promise<void>;
  onInsertText: (text: string) => void;
};

function SchemaExplorerComponent({
  tables,
  collapsed,
  onToggleCollapsed,
  onRefresh,
  onInsertText,
}: SchemaExplorerProps) {
  const [filter, setFilter] = useState("");
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>(
    {},
  );
  const filteredTables = useMemo(
    () =>
      tables.filter((table) =>
        table.name.toLowerCase().includes(filter.toLowerCase().trim()),
      ),
    [tables, filter],
  );

  if (collapsed) {
    return (
      <div className="flex h-full w-12 flex-col items-center gap-2 border-r border-border py-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleCollapsed}
          title="Expand schema"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onRefresh}
          title="Refresh schema"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Database className="mt-2 h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col border-r border-border">
      <div className="space-y-2 border-b border-border p-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium">Schema Explorer</p>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={onRefresh}
              title="Refresh schema"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onToggleCollapsed}
              title="Collapse schema"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Filter tables..."
            className="h-8 pl-7 text-xs"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="h-full">
        <div className="p-2">
          {filteredTables.map((table) => (
            <div
              key={table.name}
              className="mb-1 rounded-md border border-border"
            >
              <div className="flex items-center">
                <button
                  type="button"
                  className="flex-1 truncate p-2 text-left text-xs hover:bg-accent"
                  onClick={() =>
                    onInsertText(`SELECT * FROM ${table.name} LIMIT 50;`)
                  }
                >
                  {table.name}
                </button>
                <button
                  type="button"
                  className="px-2 py-2 text-muted-foreground hover:bg-accent"
                  onClick={() =>
                    setExpandedTables((previous) => ({
                      ...previous,
                      [table.name]: !previous[table.name],
                    }))
                  }
                >
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 transition-transform",
                      expandedTables[table.name] ? "rotate-90" : "",
                    )}
                  />
                </button>
              </div>
              {expandedTables[table.name] ? (
                <div className="space-y-1 border-t border-border px-2 py-1">
                  {table.columns.map((column) => (
                    <button
                      type="button"
                      key={`${table.name}:${column.name}`}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-1 py-1 text-left text-xs hover:bg-accent",
                        "font-mono",
                      )}
                      onClick={() => onInsertText(column.name)}
                    >
                      <span className="truncate">{column.name}</span>
                      <span className="ml-2 flex items-center gap-1">
                        <span className="text-muted-foreground">
                          {column.type || "?"}
                        </span>
                        {column.pk ? (
                          <Badge variant="secondary">PK</Badge>
                        ) : null}
                        {column.notnull ? (
                          <Badge variant="outline">NOT NULL</Badge>
                        ) : null}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export const SchemaExplorer = memo(SchemaExplorerComponent);
