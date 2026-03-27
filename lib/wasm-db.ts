"use client";

import { splitSqlStatements } from "@/lib/sql";
import type { QueryResult, SchemaTable } from "@/lib/types";

type SqlJsDatabase = {
  close: () => void;
  exec: (sql: string) => Array<{ columns: string[]; values: unknown[][] }>;
  export: () => Uint8Array;
};

let sqliteDb: SqlJsDatabase | null = null;
let sqliteInitPromise: Promise<void> | null = null;

async function ensureInit() {
  if (sqliteDb) return;
  if (!sqliteInitPromise) {
    const { default: initSqlJs } = await import("sql.js");
    sqliteInitPromise = initSqlJs({
      locateFile: () => "/sql-wasm.wasm",
    }).then((SQL) => {
      if (!sqliteDb) sqliteDb = new SQL.Database();
    });
  }
  await sqliteInitPromise;
}

function assertDb() {
  if (!sqliteDb) throw new Error("WASM database is not initialized.");
  return sqliteDb;
}

function escapeIdentifier(name: string) {
  return name.replaceAll('"', '""');
}

export async function initWasmDatabase() {
  await ensureInit();
}

export async function createNewWasmDatabase() {
  await ensureInit();
  sqliteDb?.close();
  const { default: initSqlJs } = await import("sql.js");
  const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
  sqliteDb = new SQL.Database();
}

export async function importWasmDbBytes(bytes: Uint8Array) {
  await ensureInit();
  sqliteDb?.close();
  const { default: initSqlJs } = await import("sql.js");
  const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
  sqliteDb = new SQL.Database(bytes);
}

export async function importWasmSql(sql: string) {
  await ensureInit();
  const db = assertDb();
  db.exec(sql);
}

export async function exportWasmDatabase() {
  await ensureInit();
  const db = assertDb();
  return db.export();
}

export async function getWasmSchema(): Promise<{ tables: SchemaTable[] }> {
  await ensureInit();
  const db = assertDb();
  const tableResults = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
  );
  const tableNames = tableResults[0]?.values.map((row) => String(row[0])) ?? [];

  const tables = tableNames.map((tableName) => {
    const pragma = db.exec(
      `PRAGMA table_info("${escapeIdentifier(tableName)}")`,
    )[0];
    const columns =
      pragma?.values.map((row) => ({
        name: String(row[1]),
        type: String(row[2] ?? ""),
        notnull: Number(row[3]) === 1,
        pk: Number(row[5]) === 1,
      })) ?? [];

    return { name: tableName, columns };
  });

  return { tables };
}

export async function runWasmQuery(sql: string): Promise<QueryResult> {
  await ensureInit();
  const db = assertDb();
  const startedAt = performance.now();
  const statementCount = splitSqlStatements(sql).length;

  try {
    const results = db.exec(sql);
    const lastResult = results[results.length - 1];
    const rows =
      lastResult?.values.map((valueRow) => {
        const row: Record<string, unknown> = {};
        valueRow.forEach((value, index) => {
          row[lastResult.columns[index]] = value;
        });
        return row;
      }) ?? [];

    return {
      rows,
      columns: lastResult?.columns ?? [],
      rowCount: rows.length,
      duration_ms: performance.now() - startedAt,
      statementCount,
    };
  } catch (error) {
    return {
      rows: [],
      columns: [],
      rowCount: 0,
      duration_ms: performance.now() - startedAt,
      error: error instanceof Error ? error.message : "Unknown SQLite error",
      statementCount,
    };
  }
}
