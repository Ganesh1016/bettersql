"use client";

import { useRef, useState } from "react";
import { Download, RefreshCcw, Settings, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PlaygroundMode } from "@/lib/types";

type SettingsModalProps = {
  mode: PlaygroundMode;
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

export function SettingsModal({
  mode,
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
}: SettingsModalProps) {
  const dbPickerRef = useRef<HTMLInputElement | null>(null);
  const filePickerRef = useRef<HTMLInputElement | null>(null);
  const [newDbPath, setNewDbPath] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure database connection and settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Database Mode Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Database Mode</Label>
            <Tabs value={mode} onValueChange={(value) => onModeChange(value as PlaygroundMode)}>
              <TabsList className="w-full">
                <TabsTrigger value="wasm" className="flex-1">
                  Instant
                </TabsTrigger>
                <TabsTrigger value="file" className="flex-1">
                  File
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              {mode === "wasm"
                ? "In-memory SQLite database (zero installation)"
                : "SQLite database file on your local disk"}
            </p>
          </div>

          <Separator />

          {/* Instant Configuration */}
          {mode === "wasm" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Instant Database</Label>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onNewWasmDb}
                  className="w-full justify-start text-destructive hover:text-destructive"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Clear Database
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => dbPickerRef.current?.click()}
                  className="w-full justify-start"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import .db
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onExportDb}
                  className="w-full justify-start"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export .db
                </Button>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="persist-instant-toggle"
                    className="text-sm font-medium"
                  >
                    Persist in Browser
                  </Label>
                  <Switch
                    id="persist-instant-toggle"
                    checked={instantPersistenceEnabled}
                    onCheckedChange={onInstantPersistenceChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Save state to browser storage between sessions.
                </p>
              </div>
            </div>
          )}

          {/* File Configuration */}
          {mode === "file" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Database File</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Database file path"
                    value={filePath}
                    onChange={(e) => onFilePathChange(e.target.value)}
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => filePickerRef.current?.click()}
                  >
                    Browse
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={onConnectFile}
                  disabled={!filePath}
                >
                  Connect
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="persist-file-toggle"
                    className="text-sm font-medium"
                  >
                    Remember Changes in Browser
                  </Label>
                  <Switch
                    id="persist-file-toggle"
                    checked={filePersistenceEnabled}
                    onCheckedChange={onFilePersistenceChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  If enabled, your changes will be cached in the browser for this file.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="new-db-path" className="text-sm font-medium text-muted-foreground">
                  Create New Database
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="new-db-path"
                    placeholder="/path/to/database.db"
                    value={newDbPath}
                    onChange={(e) => setNewDbPath(e.target.value)}
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (newDbPath) {
                        onCreateFileDatabase(newDbPath).then(() => {
                          setNewDbPath("");
                        });
                      }
                    }}
                  >
                    Create
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={dbPickerRef}
          type="file"
          accept=".db,.sqlite,.sqlite3"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) onImportDb(file);
          }}
          className="hidden"
        />
        <input
          ref={filePickerRef}
          type="file"
          accept=".db,.sqlite,.sqlite3"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) {
              onFilePathChange(file.name);
            }
          }}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
}
