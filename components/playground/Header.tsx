"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import type { PlaygroundMode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type HeaderProps = {
  mode: PlaygroundMode;
  onModeChange: (mode: PlaygroundMode) => void;
  connected: boolean;
  connectionName: string;
};

export function Header({
  mode,
  onModeChange,
  connected,
  connectionName,
}: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <header className="flex h-12 items-center justify-between border-b border-border px-3">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold">SQL Playground</h1>
        <Tabs
          value={mode}
          onValueChange={(value) => onModeChange(value as PlaygroundMode)}
        >
          <TabsList className="h-8">
            <TabsTrigger value="wasm" className="text-xs">
              WASM
            </TabsTrigger>
            <TabsTrigger value="file" className="text-xs">
              File
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <div className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1">
          <span
            className={connected ? "h-2 w-2 rounded-full bg-green-500" : "h-2 w-2 rounded-full bg-muted-foreground"}
          />
          <span className="text-muted-foreground">{connectionName}</span>
        </div>
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

