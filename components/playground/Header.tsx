"use client";

import { Check, Database, FileText, Info } from "lucide-react";

import { ConnectionPanel } from "@/components/playground/ConnectionPanel";
import { SettingsModal } from "@/components/playground/SettingsModal";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PlaygroundMode } from "@/lib/types";

type HeaderProps = {
  mode: PlaygroundMode;
  connected: boolean;
  connectionName: string;
  filePath: string;
  instantPersistenceEnabled: boolean;
  filePersistenceEnabled: boolean;
  onModeChange: (mode: PlaygroundMode) => void;
  onInstantPersistenceChange: (enabled: boolean) => void;
  onFilePersistenceChange: (enabled: boolean) => void;
  onFilePathChange: (filePath: string) => void;
  onConnectFile: () => Promise<void>;
  onCreateFileDatabase: (path: string) => Promise<void>;
  onNewWasmDb: () => Promise<void>;
  onImportDb: (file: File) => Promise<void>;
  onExportDb: () => Promise<void>;
};

export function Header({
  mode,
  connected,
  connectionName,
  filePath,
  instantPersistenceEnabled,
  filePersistenceEnabled,
  onModeChange,
  onInstantPersistenceChange,
  onFilePersistenceChange,
  onFilePathChange,
  onConnectFile,
  onCreateFileDatabase,
  onNewWasmDb,
  onImportDb,
  onExportDb,
}: HeaderProps) {
  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">BetterSQL</h1>
        </div>
        <div className="flex items-center gap-2 border-l border-border pl-4">
          <Badge
            variant={connected ? "default" : "secondary"}
            className="flex h-5 items-center gap-1 px-1.5 text-[10px] font-medium"
          >
            {connected && <Check className="h-2.5 w-2.5" />}
            {connected ? "Connected" : "Disconnected"}
          </Badge>
          <span className="text-xs font-medium text-muted-foreground">
            {connectionName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ConnectionPanel
          mode={mode}
          filePath={filePath}
          instantPersistenceEnabled={instantPersistenceEnabled}
          filePersistenceEnabled={filePersistenceEnabled}
          onInstantPersistenceChange={onInstantPersistenceChange}
          onFilePersistenceChange={onFilePersistenceChange}
          onNewWasmDb={onNewWasmDb}
        />
        <SettingsModal
          mode={mode}
          filePath={filePath}
          instantPersistenceEnabled={instantPersistenceEnabled}
          filePersistenceEnabled={filePersistenceEnabled}
          onModeChange={onModeChange}
          onInstantPersistenceChange={onInstantPersistenceChange}
          onFilePersistenceChange={onFilePersistenceChange}
          onFilePathChange={onFilePathChange}
          onConnectFile={onConnectFile}
          onCreateFileDatabase={onCreateFileDatabase}
          onNewWasmDb={onNewWasmDb}
          onImportDb={onImportDb}
          onExportDb={onExportDb}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <Info className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end" className="max-w-xs">
              <div className="space-y-2">
                <p className="text-xs font-semibold">Mode Guide</p>
                <div className="space-y-1">
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3 w-3 text-primary" />
                    <div>
                      <p className="text-[11px] font-medium">Instant Mode</p>
                      <p className="text-[10px] text-muted-foreground">
                        In-memory only. Great for quick testing and zero-setup queries.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-3 w-3 text-primary" />
                    <div>
                      <p className="text-[11px] font-medium">File Mode</p>
                      <p className="text-[10px] text-muted-foreground">
                        Connects to a real SQLite file on your disk.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
