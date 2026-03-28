"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SettingsModal } from "@/components/playground/SettingsModal";
import type { PlaygroundMode } from "@/lib/types";

type HeaderProps = {
  mode: PlaygroundMode;
  onModeChange: (mode: PlaygroundMode) => void;
  connected: boolean;
  connectionName: string;
  filePath: string;
  wasmPersistenceEnabled: boolean;
  onWasmPersistenceChange: (enabled: boolean) => void;
  onFilePathChange: (filePath: string) => void;
  onConnectFile: () => Promise<void>;
  onCreateFileDatabase: (path: string) => Promise<void>;
  onNewWasmDb: () => Promise<void>;
  onImportDb: (file: File) => Promise<void>;
  onImportSql: (file: File) => Promise<void>;
  onExportDb: () => Promise<void>;
};

export function Header({
  mode,
  onModeChange,
  connected,
  connectionName,
  filePath,
  wasmPersistenceEnabled,
  onWasmPersistenceChange,
  onFilePathChange,
  onConnectFile,
  onCreateFileDatabase,
  onNewWasmDb,
  onImportDb,
  onImportSql,
  onExportDb,
}: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <header className="flex h-12 items-center justify-between border-b border-border px-3">
      <h1 className="text-sm font-semibold">SQL Playground</h1>
      <div className="flex items-center gap-3 text-xs">
        <div className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1">
          <span
            className={connected ? "h-2 w-2 rounded-full bg-green-500" : "h-2 w-2 rounded-full bg-muted-foreground"}
          />
          <span className="text-muted-foreground">{connectionName}</span>
        </div>
        <SettingsModal
          mode={mode}
          filePath={filePath}
          wasmPersistenceEnabled={wasmPersistenceEnabled}
          onModeChange={onModeChange}
          onWasmPersistenceChange={onWasmPersistenceChange}
          onFilePathChange={onFilePathChange}
          onConnectFile={onConnectFile}
          onCreateFileDatabase={onCreateFileDatabase}
          onNewWasmDb={onNewWasmDb}
          onImportDb={onImportDb}
          onImportSql={onImportSql}
          onExportDb={onExportDb}
        />
        <TooltipProvider delayDuration={120}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {resolvedTheme === "dark" ? "Switch to light" : "Switch to dark"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}

