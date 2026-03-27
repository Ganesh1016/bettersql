"use client";

import dynamic from "next/dynamic";

const Playground = dynamic(
  () => import("@/components/playground/Playground").then((mod) => mod.Playground),
  { ssr: false },
);

export function PlaygroundShell() {
  return <Playground />;
}

