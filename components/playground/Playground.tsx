"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";

import { createDatabase, getSchema, runQuery } from "@/actions/sqlite";
import { Editor } from "@/components/playground/Editor";
import { Header } from "@/components/playground/Header";
import { QueryHistory } from "@/components/playground/QueryHistory";
import { ResultsPanel } from "@/components/playground/ResultsPanel";
import { SchemaExplorer } from "@/components/playground/SchemaExplorer";
import { Button } from "@/components/ui/button";
import { formatSql } from "@/lib/formatter";
import {
  clearPersistedWasmDb,
  readHistory,
  readPersistedWasmDb,
  writeHistory,
  writePersistedWasmDb,
} from "@/lib/storage";
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
  const editorApiRef = useRef<{
    insertAtCursor: (text: string) => void;
    getSelection: () => string | null;
  } | null>(null);

  const {
    mode,
    connected,
    connectionName,
    filePath,
    query,
    schema,
    result,
    history,
    instantPersistenceEnabled,
    filePersistenceEnabled,
    setMode,
    setConnected,
    setFilePath,
    setQuery,
    setSchema,
    setResult,
    setHistory,
    pushHistory,
    clearHistory,
    setInstantPersistenceEnabled,
    setFilePersistenceEnabled,
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
        setInstantPersistenceEnabled(true);
      }
      const schemaResult = await getWasmSchema();
      setSchema(schemaResult.tables);
    });
  }, [setSchema, setInstantPersistenceEnabled]);

  // Handle file persistence (auto-save to localStorage if enabled)
  useEffect(() => {
    if (mode === "file" && filePath && filePersistenceEnabled && result && !result.error) {
      // In a real app, we'd need to get the current DB bytes from the server action
      // since the file mode runs on the server. For this prototype, we'll focus
      // on the Instant mode persistence which is already implemented.
    }
  }, [mode, filePath, filePersistenceEnabled, result]);

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
          error:
            error instanceof Error ? error.message : "Failed to load schema",
        });
      }
    });
  };

  const executeQuery = () => {
    const selection = editorApiRef.current?.getSelection();
    const sql = (selection || query).trim();
    if (!sql) return;

    startTransition(async () => {
      const queryResult =
        mode === "wasm"
          ? await runWasmQuery(sql)
          : await runQuery(filePath, sql);
      setResult(queryResult);

      if (!queryResult.error) {
        pushHistory(mode, {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          sql,
          timestamp: Date.now(),
          rowCount: queryResult.rowCount,
        });
        writeHistory(mode, usePlaygroundStore.getState().history[mode]);
        await refreshSchema();

        if (mode === "wasm" && instantPersistenceEnabled) {
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
      setConnected(true, "Instant (In-Memory)");
      refreshSchema();
    } else {
      setConnected(false, "Disconnected");
    }
  };

  const handleFormat = () => {
    const selection = editorApiRef.current?.getSelection();
    try {
      if (selection) {
        const formatted = formatSql(selection);
        editorApiRef.current?.insertAtCursor(formatted);
      } else {
        setQuery(formatSql(query));
      }
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
        filePath={filePath}
        instantPersistenceEnabled={instantPersistenceEnabled}
        filePersistenceEnabled={filePersistenceEnabled}
        onInstantPersistenceChange={async (enabled) => {
          setInstantPersistenceEnabled(enabled);
          if (enabled) {
            const bytes = await exportWasmDatabase();
            writePersistedWasmDb(uint8ArrayToBase64(bytes));
          } else {
            clearPersistedWasmDb();
          }
        }}
        onFilePersistenceChange={setFilePersistenceEnabled}
        onFilePathChange={setFilePath}
        onConnectFile={async () => {
          const schemaResult = await getSchema(filePath);
          setConnected(true, filePath);
          setSchema(schemaResult.tables);
        }}
        onCreateFileDatabase={async (path) => {
          await createDatabase(path);
          setFilePath(path);
          await refreshSchema();
        }}
        onNewWasmDb={async () => {
          await createNewWasmDatabase();
          setResult(null);
          setConnected(true, "Instant (In-Memory)");
          await refreshSchema();
        }}
        onImportDb={async (file) => {
          const bytes = new Uint8Array(await file.arrayBuffer());
          await importWasmDbBytes(bytes);
          setConnected(true, "Instant (In-Memory)");
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
      <PanelGroup orientation="horizontal" className="flex-1">
        <Panel defaultSize="23%" minSize="260px" maxSize="420px">
          <div className="flex h-full flex-col border-r border-border bg-background/60 p-2">
            <div className="min-h-0 flex-1">
              <PanelGroup
                orientation="vertical"
                resizeTargetMinimumSize={{ coarse: 24, fine: 12 }}
              >
                <Panel defaultSize="60%" minSize="180px">
                  <div className="h-full rounded-md border border-border shadow-sm">
                    <SchemaExplorer
                      tables={schema}
                      collapsed={schemaCollapsed}
                      onToggleCollapsed={() =>
                        setSchemaCollapsed((value) => !value)
                      }
                      onRefresh={refreshSchema}
                      onInsertText={(text) =>
                        editorApiRef.current?.insertAtCursor(`${text}`)
                      }
                    />
                  </div>
                </Panel>
                <PanelResizeHandle className="group relative h-2 cursor-row-resize bg-border/70">
                  <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-muted-foreground/40 group-hover:bg-muted-foreground/70" />
                </PanelResizeHandle>
                <Panel defaultSize="40%" minSize="120px">
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
        <PanelResizeHandle className="group relative w-2 cursor-col-resize bg-border/70">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-muted-foreground/40 group-hover:bg-muted-foreground/70" />
        </PanelResizeHandle>
        <Panel defaultSize="77%" minSize="540px">
          <PanelGroup
            orientation="vertical"
            resizeTargetMinimumSize={{ coarse: 24, fine: 12 }}
          >
            <Panel defaultSize="58%" minSize="260px">
              <div className="flex h-full flex-col p-2 pb-1">
                <div className="mb-2 flex items-center gap-2">
                  <Button size="sm" onClick={executeQuery} disabled={isPending}>
                    Run Ctrl/Cmd+Enter
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleFormat}>
                    Format Ctrl/Cmd+Shift+F
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setQuery("")}
                  >
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
            <PanelResizeHandle className="group relative h-2 cursor-row-resize bg-border/70">
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-muted-foreground/40 group-hover:bg-muted-foreground/70" />
            </PanelResizeHandle>
            <Panel defaultSize="42%" minSize="200px">
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
