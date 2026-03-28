"use client";

import { useRef, useState } from "react";
import { Download, FileUp, RefreshCcw, Settings, Upload } from "lucide-react";

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
  wasmPersistenceEnabled: boolean;
  onModeChange: (mode: PlaygroundMode) => void;
  onWasmPersistenceChange: (enabled: boolean) => void;
  onFilePathChange: (filePath: string) => void;
  onConnectFile: () => Promise<void>;
  onCreateFileDatabase: (path: string) => Promise<void>;
  onNewWasmDb: () => Promise<void>;
  onImportDb: (file: File) => Promise<void>;
  onImportSql: (file: File) => Promise<void>;
  onExportDb: () => Promise<void>;
};

export function SettingsModal({
  mode,
  filePath,
  wasmPersistenceEnabled,
  onModeChange,
  onWasmPersistenceChange,
  onFilePathChange,
  onConnectFile,
  onCreateFileDatabase,
  onNewWasmDb,
  onImportDb,
  onImportSql,
  onExportDb,
}: SettingsModalProps) {
  const dbPickerRef = useRef<HTMLInputElement | null>(null);
  const sqlPickerRef = useRef<HTMLInputElement | null>(null);
  const hintPickerRef = useRef<HTMLInputElement | null>(null);
  const filePickerRef = useRef<HTMLInputElement | null>(null);
  const [newDbPath, setNewDbPath] = useState("");
  const [pickedFileHint, setPickedFileHint] = useState("");
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
                  WASM
                </TabsTrigger>
                <TabsTrigger value="file" className="flex-1">
                  File
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              {mode === "wasm"
                ? "In-memory SQLite database"
                : "SQLite database file on disk"}
            </p>
          </div>

          <Separator />

          {/* WASM Configuration */}
          {mode === "wasm" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">WASM Database</Label>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onNewWasmDb}
                  className="w-full justify-start"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  New Database
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
                  onClick={() => sqlPickerRef.current?.click()}
                  className="w-full justify-start"
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Import .sql
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

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="persist-toggle"
                    className="text-sm font-medium"
                  >
                    Persist to Storage
                  </Label>
                  <Switch
                    id="persist-toggle"
                    checked={wasmPersistenceEnabled}
                    onCheckedChange={onWasmPersistenceChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Save database to browser localStorage. Limited by browser quotas.
                </p>
              </div>
            </div>
          )}

          {/* File Configuration */}
          {mode === "file" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Database File</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Database file path"
                  value={filePath}
                  onChange={(e) => onFilePathChange(e.target.value)}
                  className="text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onConnectFile}
                    className="flex-1"
                  >
                    Connect
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => filePickerRef.current?.click()}
                    className="flex-1"
                  >
                    Browse
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="new-db-path" className="text-sm font-medium">
                  Create New Database
                </Label>
                <Input
                  id="new-db-path"
                  placeholder="/path/to/database.db"
                  value={newDbPath}
                  onChange={(e) => setNewDbPath(e.target.value)}
                  className="text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (newDbPath) {
                      onCreateFileDatabase(newDbPath).then(() => {
                        setNewDbPath("");
                      });
                    }
                  }}
                  className="w-full"
                >
                  Create Database
                </Button>
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
          ref={sqlPickerRef}
          type="file"
          accept=".sql"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) onImportSql(file);
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
              setPickedFileHint(file.name);
            }
          }}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
}
