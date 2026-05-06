import { promises as fs } from "fs";
import path from "path";

const STATE_FILE = path.join(process.cwd(), "data", "roadmap-state.json");

export async function GET() {
  try {
    const raw = await fs.readFile(STATE_FILE, "utf-8");
    return Response.json(JSON.parse(raw));
  } catch {
    return Response.json({ checked: [], lastUpdated: null });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const state = {
    checked: body.checked as string[],
    lastUpdated: new Date().toISOString(),
  };
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
  return Response.json({ success: true, ...state });
}
