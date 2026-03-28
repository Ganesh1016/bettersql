"use client";

import { useEffect, useMemo, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import type { editor } from "monaco-editor";
import { useTheme } from "next-themes";

type EditorProps = {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onFormat: () => void;
  onHistoryCycle: () => void;
  onReady: (api: {
    insertAtCursor: (text: string) => void;
    getSelection: () => string | null;
  }) => void;
};

export function Editor({
  value,
  onChange,
  onRun,
  onFormat,
  onHistoryCycle,
  onReady,
}: EditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const monacoTheme = useMemo(
    () => (resolvedTheme === "dark" ? "vs-dark" : "vs"),
    [resolvedTheme],
  );

  useEffect(() => {
    const instance = editorRef.current;
    if (!instance) return;
    if (instance.getValue() !== value) {
      instance.setValue(value);
    }
  }, [value]);

  const handleMount = (instance: editor.IStandaloneCodeEditor) => {
    editorRef.current = instance;

    instance.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => onRun(),
    );
    instance.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
      () => onFormat(),
    );

    instance.onKeyDown((event) => {
      if (event.keyCode === monaco.KeyCode.UpArrow) {
        const position = instance.getPosition();
        if (position?.lineNumber === 1) {
          event.preventDefault();
          onHistoryCycle();
        }
      }
    });

    onReady({
      insertAtCursor: (text: string) => {
        const selection = instance.getSelection();
        if (!selection) return;
        instance.executeEdits("schema-insert", [{ range: selection, text }]);
        instance.focus();
      },
      getSelection: () => {
        const selection = instance.getSelection();
        if (!selection || selection.isEmpty()) return null;
        return instance.getModel()?.getValueInRange(selection) ?? null;
      },
    });
  };

  return (
    <MonacoEditor
      height="100%"
      defaultLanguage="sql"
      value={value}
      onChange={(nextValue) => onChange(nextValue ?? "")}
      onMount={handleMount}
      theme={monacoTheme}
      options={{
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
        fontSize: 14,
        fontLigatures: true,
        minimap: { enabled: false },
        lineNumbers: "on",
        wordWrap: "off",
        tabSize: 2,
        automaticLayout: true,
      }}
    />
  );
}
