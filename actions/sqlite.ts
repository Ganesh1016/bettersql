"use server";

import Database from "better-sqlite3";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { isQueryStatement, splitSqlStatements } from "@/lib/sql";
import type { QueryResult, SchemaTable } from "@/lib/types";

function assertAbsolutePath(filePath: string) {
  if (!path.isAbsolute(filePath)) {
    throw new Error("Only absolute file paths are allowed.");
  }
}

function escapeIdentifier(name: string) {
  return name.replaceAll('"', '""');
}

export async function runQuery(filePath: string, sql: string): Promise<QueryResult> {
  assertAbsolutePath(filePath);
  const startedAt = performance.now();
  const db = new Database(filePath);
  const statements = splitSqlStatements(sql);

  let rows: Record<string, unknown>[] = [];
  let columns: string[] = [];
  let rowCount = 0;

  try {
    for (const statement of statements) {
      if (isQueryStatement(statement)) {
        const prepared = db.prepare(statement);
        rows = prepared.all() as Record<string, unknown>[];
        columns = prepared.columns().map((column) => column.name);
        rowCount = rows.length;
      } else {
        const result = db.prepare(statement).run();
        rows = [];
        columns = [];
        rowCount = result.changes;
      }
    }

    return {
      rows,
      columns,
      rowCount,
      duration_ms: performance.now() - startedAt,
      statementCount: statements.length,
    };
  } catch (error) {
    return {
      rows: [],
      columns: [],
      rowCount: 0,
      duration_ms: performance.now() - startedAt,
      error: error instanceof Error ? error.message : "Unknown SQLite error",
      statementCount: statements.length,
    };
  } finally {
    db.close();
  }
}

export async function getSchema(filePath: string): Promise<{ tables: SchemaTable[] }> {
  assertAbsolutePath(filePath);
  const db = new Database(filePath, { readonly: true });

  try {
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
      )
      .all() as { name: string }[];

    const schema = tables.map((table) => {
      const columns = db
        .prepare(`PRAGMA table_info("${escapeIdentifier(table.name)}")`)
        .all() as {
        name: string;
        type: string;
        pk: number;
        notnull: number;
      }[];

      return {
        name: table.name,
        columns: columns.map((column) => ({
          name: column.name,
          type: column.type ?? "",
          pk: column.pk === 1,
          notnull: column.notnull === 1,
        })),
      };
    });

    return { tables: schema };
  } finally {
    db.close();
  }
}

export async function createDatabase(filePath: string) {
  assertAbsolutePath(filePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, new Uint8Array());
  const db = new Database(filePath);
  db.exec("PRAGMA journal_mode=WAL;");
  db.close();
}

