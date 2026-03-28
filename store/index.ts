"use client";

import { create } from "zustand";

import type { PlaygroundMode, QueryResult, SchemaTable } from "@/lib/types";

export type QueryHistoryEntry = {
  id: string;
  sql: string;
  timestamp: number;
  rowCount: number;
};

type PlaygroundState = {
  mode: PlaygroundMode;
  connected: boolean;
  connectionName: string;
  filePath: string;
  query: string;
  schema: SchemaTable[];
  result: QueryResult | null;
  history: Record<PlaygroundMode, QueryHistoryEntry[]>;
  wasmPersistenceEnabled: boolean;
  setMode: (mode: PlaygroundMode) => void;
  setConnected: (connected: boolean, connectionName?: string) => void;
  setFilePath: (path: string) => void;
  setQuery: (query: string) => void;
  setSchema: (schema: SchemaTable[]) => void;
  setResult: (result: QueryResult | null) => void;
  setHistory: (mode: PlaygroundMode, items: QueryHistoryEntry[]) => void;
  pushHistory: (mode: PlaygroundMode, item: QueryHistoryEntry) => void;
  clearHistory: (mode: PlaygroundMode) => void;
  setWasmPersistenceEnabled: (enabled: boolean) => void;
};

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  mode: "wasm",
  connected: true,
  connectionName: "In-Memory SQLite",
  filePath: "",
  query: "",
  schema: [],
  result: null,
  history: { wasm: [], file: [] },
  wasmPersistenceEnabled: false,
  setMode: (mode) =>
    set((state) => ({
      mode,
      connected: mode === "wasm" ? true : state.connected,
      connectionName:
        mode === "wasm"
          ? "In-Memory SQLite"
          : state.connectionName || "Disconnected",
      result: null,
      schema: [],
    })),
  setConnected: (connected, connectionName) =>
    set({
      connected,
      connectionName:
        connectionName ?? (connected ? "Connected SQLite" : "Disconnected"),
    }),
  setFilePath: (filePath) => set({ filePath }),
  setQuery: (query) => set({ query }),
  setSchema: (schema) => set({ schema }),
  setResult: (result) => set({ result }),
  setHistory: (mode, items) =>
    set((state) => ({
      history: { ...state.history, [mode]: items.slice(0, 100) },
    })),
  pushHistory: (mode, item) =>
    set((state) => ({
      history: {
        ...state.history,
        [mode]: [item, ...state.history[mode]].slice(0, 100),
      },
    })),
  clearHistory: (mode) =>
    set((state) => ({ history: { ...state.history, [mode]: [] } })),
  setWasmPersistenceEnabled: (enabled) =>
    set({ wasmPersistenceEnabled: enabled }),
}));
