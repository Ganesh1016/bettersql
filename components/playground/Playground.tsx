"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";

import { createDatabase, getSchema, runQuery } from "@/actions/sqlite";
import { ConnectionPanel } from "@/components/playground/ConnectionPanel";
import { Editor } from "@/components/playground/Editor";
import { Header } from "@/components/playground/Header";
import { QueryHistory } from "@/components/playground/QueryHistory";
import { ResultsPanel } from "@/components/playground/ResultsPanel";
import { SchemaExplorer } from "@/components/playground/SchemaExplorer";
import { Button } from "@/components/ui/button";
import { Separator as UISeparator } from "@/components/ui/separator";
import { formatSql } from "@/lib/formatter";
import { clearPersistedWasmDb, readHistory, readPersistedWasmDb, writeHistory, writePersistedWasmDb } from "@/lib/storage";
import type { PlaygroundMode } from "@/lib/types";
import {
  createNewWasmDatabase,
  exportWasmDatabase,
  getWasmSchema,
  importWasmDbBytes,
  importWasmSql,
  initWasmDatabase,
  runWasmQuery,
} from "@/lib/wasm-db";
import { usePlaygroundStore } from "@/store";

function uint8ArrayToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function Playground() {
  const [isPending, startTransition] = useTransition();
  const [schemaCollapsed, setSchemaCollapsed] = useState(false);
  const [, setHistoryCursor] = useState(-1);
  const editorApiRef = useRef<{ insertAtCursor: (text: string) => void } | null>(null);

  const {
    mode,
    connected,
    connectionName,
    filePath,
    query,
    schema,
    result,
    history,
    wasmPersistenceEnabled,
    setMode,
    setConnected,
    setFilePath,
    setQuery,
    setSchema,
    setResult,
    setHistory,
    pushHistory,
    clearHistory,
    setWasmPersistenceEnabled,
  } = usePlaygroundStore();

  const activeHistory = useMemo(() => history[mode], [history, mode]);

  useEffect(() => {
    setHistory("wasm", readHistory("wasm"));
    setHistory("file", readHistory("file"));
  }, [setHistory]);

  useEffect(() => {
    startTransition(async () => {
      await initWasmDatabase();
      const persisted = readPersistedWasmDb();
      if (persisted) {
        await importWasmDbBytes(base64ToUint8Array(persisted));
        setWasmPersistenceEnabled(true);
      }
      const schemaResult = await getWasmSchema();
      setSchema(schemaResult.tables);
    });
  }, [setSchema, setWasmPersistenceEnabled]);

  const refreshSchema = async () => {
    startTransition(async () => {
      if (mode === "wasm") {
        const schemaResult = await getWasmSchema();
        setSchema(schemaResult.tables);
        return;
      }

      if (!filePath) {
        setConnected(false, "Disconnected");
        setSchema([]);
        return;
      }

      try {
        const schemaResult = await getSchema(filePath);
        setSchema(schemaResult.tables);
      } catch (error) {
        setConnected(false, "Disconnected");
        setResult({
          rows: [],
          columns: [],
          rowCount: 0,
          duration_ms: 0,
          error: error instanceof Error ? error.message : "Failed to load schema",
        });
      }
    });
  };

  const executeQuery = () => {
    const sql = query.trim();
    if (!sql) return;

    startTransition(async () => {
      const queryResult =
        mode === "wasm" ? await runWasmQuery(query) : await runQuery(filePath, query);
      setResult(queryResult);

      if (!queryResult.error) {
        pushHistory(mode, {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          sql: query,
          timestamp: Date.now(),
          rowCount: queryResult.rowCount,
        });
        writeHistory(mode, usePlaygroundStore.getState().history[mode]);
        await refreshSchema();

        if (mode === "wasm" && wasmPersistenceEnabled) {
          const bytes = await exportWasmDatabase();
          writePersistedWasmDb(uint8ArrayToBase64(bytes));
        }
      }
    });
  };

  const handleModeChange = (nextMode: PlaygroundMode) => {
    setMode(nextMode);
    setHistoryCursor(-1);
    if (nextMode === "wasm") {
      setConnected(true, "In-Memory SQLite");
      refreshSchema();
    } else {
      setConnected(false, "Disconnected");
    }
  };

  const handleFormat = () => {
    try {
      setQuery(formatSql(query));
    } catch {
      // Keep the original SQL when formatting fails.
    }
  };

  const cycleHistory = () => {
    if (activeHistory.length === 0) return;
    setHistoryCursor((cursor) => {
      const next = cursor + 1 >= activeHistory.length ? 0 : cursor + 1;
      setQuery(activeHistory[next].sql);
      return next;
    });
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        connected={connected}
        connectionName={connectionName}
      />
      <PanelGroup orientation="horizontal" className="flex-1">
        <Panel defaultSize={25} minSize={16} maxSize={35}>
          <div className="flex h-full flex-col border-r border-border bg-background/60 p-2">
            <ConnectionPanel
              mode={mode}
              filePath={filePath}
              wasmPersistenceEnabled={wasmPersistenceEnabled}
              onWasmPersistenceChange={async (enabled) => {
                setWasmPersistenceEnabled(enabled);
                if (enabled) {
                  const bytes = await exportWasmDatabase();
                  writePersistedWasmDb(uint8ArrayToBase64(bytes));
                } else {
                  clearPersistedWasmDb();
                }
              }}
              onFilePathChange={setFilePath}
              onConnectFile={async () => {
                const schemaResult = await getSchema(filePath);
                setConnected(true, filePath);
                setSchema(schemaResult.tables);
              }}
              onCreateFileDatabase={async (path) => {
                await createDatabase(path);
                setFilePath(path);
              }}
              onNewWasmDb={async () => {
                await createNewWasmDatabase();
                setResult(null);
                setConnected(true, "In-Memory SQLite");
                await refreshSchema();
              }}
              onImportDb={async (file) => {
                const bytes = new Uint8Array(await file.arrayBuffer());
                await importWasmDbBytes(bytes);
                setConnected(true, "In-Memory SQLite");
                await refreshSchema();
              }}
              onImportSql={async (file) => {
                const sql = await file.text();
                await importWasmSql(sql);
                await refreshSchema();
              }}
              onExportDb={async () => {
                const bytes = await exportWasmDatabase();
                const arrayBuffer = bytes.buffer.slice(
                  bytes.byteOffset,
                  bytes.byteOffset + bytes.byteLength,
                ) as ArrayBuffer;
                const blob = new Blob([arrayBuffer], {
                  type: "application/octet-stream",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "playground.db";
                a.click();
                URL.revokeObjectURL(url);
              }}
            />
            <UISeparator className="my-2" />
            <div className="min-h-0 flex-1">
              <PanelGroup orientation="vertical">
                <Panel defaultSize={60} minSize={25}>
                  <div className="h-full rounded-md border border-border shadow-sm">
                    <SchemaExplorer
                      tables={schema}
                      collapsed={schemaCollapsed}
                      onToggleCollapsed={() => setSchemaCollapsed((value) => !value)}
                      onRefresh={refreshSchema}
                      onInsertText={(text) =>
                        editorApiRef.current?.insertAtCursor(`${text}`)
                      }
                    />
                  </div>
                </Panel>
                <PanelResizeHandle className="h-2 bg-border/60" />
                <Panel defaultSize={40} minSize={20}>
                  <QueryHistory
                    entries={activeHistory}
                    onLoad={(sql) => setQuery(sql)}
                    onClear={() => {
                      clearHistory(mode);
                      writeHistory(mode, []);
                    }}
                  />
                </Panel>
              </PanelGroup>
            </div>
          </div>
        </Panel>
        <PanelResizeHandle className="w-2 bg-border/60" />
        <Panel defaultSize={75} minSize={65}>
          <PanelGroup orientation="vertical">
            <Panel defaultSize={58} minSize={35}>
              <div className="flex h-full flex-col p-2 pb-1">
                <div className="mb-2 flex items-center gap-2">
                  <Button size="sm" onClick={executeQuery} disabled={isPending}>
                    Run Ctrl/Cmd+Enter
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleFormat}>
                    Format Ctrl/Cmd+Shift+F
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setQuery("")}>
                    Clear
                  </Button>
                </div>
                <div className="min-h-0 flex-1 rounded-md border border-border shadow-sm">
                  <Editor
                    value={query}
                    onChange={setQuery}
                    onRun={executeQuery}
                    onFormat={handleFormat}
                    onHistoryCycle={cycleHistory}
                    onReady={(api) => {
                      editorApiRef.current = api;
                    }}
                  />
                </div>
              </div>
            </Panel>
            <PanelResizeHandle className="h-2 bg-border/60" />
            <Panel defaultSize={42} minSize={20}>
              <div className="h-full p-2 pt-1">
                <ResultsPanel result={result} />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}
