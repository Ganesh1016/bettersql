"use client";

import { Monitor, RefreshCcw, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PlaygroundMode } from "@/lib/types";

type ConnectionPanelProps = {
  mode: PlaygroundMode;
  filePath: string;
  instantPersistenceEnabled: boolean;
  filePersistenceEnabled: boolean;
  onInstantPersistenceChange: (enabled: boolean) => void;
  onFilePersistenceChange: (enabled: boolean) => void;
  onNewWasmDb: () => Promise<void>;
};

export function ConnectionPanel({
  mode,
  filePath,
  instantPersistenceEnabled,
  filePersistenceEnabled,
  onInstantPersistenceChange,
  onFilePersistenceChange,
  onNewWasmDb,
}: ConnectionPanelProps) {
  if (mode === "wasm") {
    return (
      <div className="flex items-center gap-2 border-r border-border pr-2">
        <div className="flex flex-col items-end mr-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Instant Mode</p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onNewWasmDb}>
              <RefreshCcw className="mr-1 h-3 w-3" />
              Clear
            </Button>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-md border border-border/50">
                <Monitor className="h-3 w-3 text-muted-foreground" />
                <Switch
                  checked={instantPersistenceEnabled}
                  onCheckedChange={onInstantPersistenceChange}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Persist in Browser</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border-r border-border pr-2">
      <div className="flex flex-col items-end mr-1">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">File Mode</p>
        <span className="text-[11px] font-medium truncate max-w-[120px]">{filePath || "No file"}</span>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-md border border-border/50">
              <Save className="h-3 w-3 text-muted-foreground" />
              <Switch
                checked={filePersistenceEnabled}
                onCheckedChange={onFilePersistenceChange}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Remember Changes in Browser</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
