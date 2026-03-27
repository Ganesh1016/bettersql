"use client";

import { useRef, useState } from "react";
import { Download, FileUp, RefreshCcw, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { PlaygroundMode } from "@/lib/types";

type ConnectionPanelProps = {
  mode: PlaygroundMode;
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

export function ConnectionPanel({
  mode,
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
}: ConnectionPanelProps) {
  const dbPickerRef = useRef<HTMLInputElement | null>(null);
  const sqlPickerRef = useRef<HTMLInputElement | null>(null);
  const hintPickerRef = useRef<HTMLInputElement | null>(null);
  const [newDbPath, setNewDbPath] = useState("");
  const [pickedFileHint, setPickedFileHint] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  if (mode === "wasm") {
    return (
      <div className="rounded-md border border-border p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">WASM Connection</p>
          <Button size="sm" variant="outline" onClick={onNewWasmDb}>
            <RefreshCcw className="mr-1 h-3 w-3" />
            New Database
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => dbPickerRef.current?.click()}
          >
            <Upload className="mr-1 h-3 w-3" />
            Import .db
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => sqlPickerRef.current?.click()}
          >
            <FileUp className="mr-1 h-3 w-3" />
            Import .sql
          </Button>
          <Button size="sm" variant="outline" onClick={onExportDb}>
            <Download className="mr-1 h-3 w-3" />
            Export .db
          </Button>
        </div>
        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <Label htmlFor="persist-toggle" className="text-xs text-muted-foreground">
            Persist WASM DB to localStorage
          </Label>
          <Switch
            id="persist-toggle"
            checked={wasmPersistenceEnabled}
            onCheckedChange={onWasmPersistenceChange}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          localStorage persistence is optional and size-limited by browser quotas.
        </p>
        <input
          ref={dbPickerRef}
          type="file"
          accept=".db,.sqlite,.sqlite3"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (file) await onImportDb(file);
            event.target.value = "";
          }}
        />
        <input
          ref={sqlPickerRef}
          type="file"
          accept=".sql,text/sql"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (file) await onImportSql(file);
            event.target.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border p-3 shadow-sm">
      <p className="mb-2 text-xs font-medium text-muted-foreground">File Connection</p>
      <Label className="mb-1 block text-xs" htmlFor="db-path">
        Absolute SQLite file path
      </Label>
      <div className="flex gap-2">
        <Input
          id="db-path"
          value={filePath}
          onChange={(event) => onFilePathChange(event.target.value)}
          placeholder="/Users/you/databases/mydb.db"
          className="h-8 text-xs"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => hintPickerRef.current?.click()}
        >
          Browse
        </Button>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Browsers hide full paths for security; type the full absolute path manually.
      </p>
      {pickedFileHint ? (
        <p className="mt-1 text-[11px] text-muted-foreground">
          Picked file name: <span className="font-mono">{pickedFileHint}</span>
        </p>
      ) : null}
      <div className="mt-2 flex gap-2">
        <Button size="sm" onClick={onConnectFile}>
          Connect
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              Create new .db
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create SQLite Database</DialogTitle>
              <DialogDescription>
                Enter an absolute file path where a new SQLite file should be created.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="new-db-path">Absolute path</Label>
              <Input
                id="new-db-path"
                value={newDbPath}
                onChange={(event) => setNewDbPath(event.target.value)}
                placeholder="/Users/you/databases/new.db"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  await onCreateFileDatabase(newDbPath);
                  setDialogOpen(false);
                  setNewDbPath("");
                }}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <input
        ref={hintPickerRef}
        type="file"
        accept=".db,.sqlite,.sqlite3"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) setPickedFileHint(file.name);
          event.target.value = "";
        }}
      />
    </div>
  );
}
