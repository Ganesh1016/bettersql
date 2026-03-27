export type PlaygroundMode = "wasm" | "file";

export type SchemaColumn = {
  name: string;
  type: string;
  pk: boolean;
  notnull: boolean;
};

export type SchemaTable = {
  name: string;
  columns: SchemaColumn[];
};

export type QueryResult = {
  rows: Record<string, unknown>[];
  columns: string[];
  rowCount: number;
  duration_ms: number;
  error?: string;
  statementCount?: number;
};

