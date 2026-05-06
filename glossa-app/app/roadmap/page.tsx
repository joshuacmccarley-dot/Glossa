import { promises as fs } from "fs";
import path from "path";
import type { Metadata } from "next";
import RoadmapClient from "./RoadmapClient";

export const metadata: Metadata = {
  title: "Roadmap — Glossa",
  description: "Glossa launch checklist and milestone tracker.",
};

async function getInitialState(): Promise<string[]> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "data", "roadmap-state.json"),
      "utf-8"
    );
    return JSON.parse(raw).checked ?? [];
  } catch {
    return [];
  }
}

export default async function RoadmapPage() {
  const initialChecked = await getInitialState();
  return <RoadmapClient initialChecked={initialChecked} />;
}
