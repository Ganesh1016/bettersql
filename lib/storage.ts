import type { QueryHistoryEntry } from "@/store";

const HISTORY_KEY_PREFIX = "sql-playground-history";
const INSTANT_PERSIST_KEY = "sql-playground-instant-db";
const FILE_PERSIST_KEY_PREFIX = "sql-playground-file-db";

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
  window.localStorage.setItem(INSTANT_PERSIST_KEY, base64);
}

export function readPersistedWasmDb() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(INSTANT_PERSIST_KEY);
}

export function clearPersistedWasmDb() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(INSTANT_PERSIST_KEY);
}

export function writePersistedFileDb(filePath: string, base64: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(`${FILE_PERSIST_KEY_PREFIX}:${filePath}`, base64);
}

export function readPersistedFileDb(filePath: string) {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(`${FILE_PERSIST_KEY_PREFIX}:${filePath}`);
}

export function clearPersistedFileDb(filePath: string) {
  if (!isBrowser()) return;
  window.localStorage.removeItem(`${FILE_PERSIST_KEY_PREFIX}:${filePath}`);
}
