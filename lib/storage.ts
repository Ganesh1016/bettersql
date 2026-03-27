import type { QueryHistoryEntry } from "@/store";

const HISTORY_KEY_PREFIX = "sql-playground-history";
const WASM_PERSIST_KEY = "sql-playground-wasm-db";

function isBrowser() {
  return typeof window !== "undefined";
}

export function readHistory(mode: "wasm" | "file"): QueryHistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(`${HISTORY_KEY_PREFIX}:${mode}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueryHistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, 100) : [];
  } catch {
    return [];
  }
}

export function writeHistory(mode: "wasm" | "file", entries: QueryHistoryEntry[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(
    `${HISTORY_KEY_PREFIX}:${mode}`,
    JSON.stringify(entries.slice(0, 100)),
  );
}

export function writePersistedWasmDb(base64: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(WASM_PERSIST_KEY, base64);
}

export function readPersistedWasmDb() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(WASM_PERSIST_KEY);
}

export function clearPersistedWasmDb() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(WASM_PERSIST_KEY);
}

