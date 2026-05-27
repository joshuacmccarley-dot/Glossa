"use client";

import { useEffect, useState, useCallback } from "react";
import { phases, type Phase } from "@/data/checklist";

const STORAGE_KEY = "glossa_roadmap";

type SyncState = "idle" | "saving" | "saved" | "error";

function ProgressRing({ pct }: { pct: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width="52" height="52" className="rotate-[-90deg]">
      <circle cx="26" cy="26" r={r} fill="none" stroke="#e5e9f7" strokeWidth="4" />
      <circle
        cx="26" cy="26" r={r} fill="none"
        stroke="#F5A623" strokeWidth="4"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

const priorityStyles: Record<string, string> = {
  critical: "bg-orange/10 text-orange border border-orange/20",
  high: "bg-gold/10 text-gold border border-gold/20",
  medium: "bg-royal/10 text-royal border border-royal/20",
};

const phaseAccent: Record<string, string> = {
  navy: "border-navy",
  royal: "border-royal",
  gold: "border-gold",
  orange: "border-orange",
};

const phaseTag: Record<string, string> = {
  navy: "bg-navy text-gold",
  royal: "bg-royal text-white",
  gold: "bg-gold text-navy",
  orange: "bg-orange text-white",
};

export default function RoadmapClient({ initialChecked }: { initialChecked: string[] }) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set(initialChecked));
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    () => new Set(phases.map((p) => p.id))
  );

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.checked?.length) {
          setChecked(new Set(parsed.checked));
        }
        if (parsed.lastSynced) setLastSynced(parsed.lastSynced);
      } catch {
        // ignore malformed storage
      }
    }
  }, []);

  const syncToCloud = useCallback(async (ids: string[]) => {
    setSyncState("saving");
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: ids }),
      });
      const data = await res.json();
      const ts = data.lastUpdated ?? new Date().toISOString();
      setLastSynced(ts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ checked: ids, lastSynced: ts }));
      setSyncState("saved");
      setTimeout(() => setSyncState("idle"), 2500);
    } catch {
      setSyncState("error");
      setTimeout(() => setSyncState("idle"), 3000);
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      const ids = Array.from(next);
      syncToCloud(ids);
      return next;
    });
  }, [syncToCloud]);

  const togglePhase = (id: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalItems = phases.reduce((acc, p) => acc + p.items.length, 0);
  const totalChecked = checked.size;
  const overallPct = Math.round((totalChecked / totalItems) * 100);

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleString(undefined, {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="font-display font-extrabold text-4xl md:text-5xl text-navy mb-2">
              Glossa Roadmap
            </h1>
            <p className="text-navy/60 text-base">
              {totalChecked} of {totalItems} milestones complete
            </p>
          </div>

          {/* Cloud sync indicator */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
            syncState === "saving" ? "bg-gold/10 border-gold/30 text-gold" :
            syncState === "saved"  ? "bg-green-50 border-green-200 text-green-700" :
            syncState === "error"  ? "bg-orange/10 border-orange/30 text-orange" :
            "bg-surface border-surface-dark text-navy/50"
          }`}>
            {syncState === "saving" && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {syncState === "saved" && <span>✓</span>}
            {syncState === "error" && <span>⚠</span>}
            {syncState === "idle" && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
              </svg>
            )}
            <span>
              {syncState === "saving" ? "Saving to cloud…" :
               syncState === "saved"  ? "Saved to cloud" :
               syncState === "error"  ? "Sync failed — retry" :
               lastSynced ? `Synced ${formatDate(lastSynced)}` : "Cloud storage ready"}
            </span>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-6 bg-surface rounded-2xl p-6 border border-surface-dark">
          <div className="flex items-center justify-between mb-3">
            <span className="font-display font-bold text-navy text-lg">Overall Progress</span>
            <span className="font-display font-extrabold text-3xl text-gold">{overallPct}%</span>
          </div>
          <div className="w-full bg-surface-dark rounded-full h-3 overflow-hidden">
            <div
              className="bg-gold h-3 rounded-full transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            {phases.map((p) => {
              const done = p.items.filter((i) => checked.has(i.id)).length;
              const pct = Math.round((done / p.items.length) * 100);
              return (
                <div key={p.id} className="flex items-center gap-1.5 text-xs text-navy/50">
                  <span>{p.icon}</span>
                  <span className="font-semibold">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phase checklists */}
      <div className="flex flex-col gap-6">
        {phases.map((phase: Phase) => {
          const doneCount = phase.items.filter((i) => checked.has(i.id)).length;
          const phasePct = Math.round((doneCount / phase.items.length) * 100);
          const isExpanded = expandedPhases.has(phase.id);

          return (
            <div
              key={phase.id}
              className={`bg-white rounded-2xl border-l-4 border border-surface-dark overflow-hidden ${phaseAccent[phase.color]}`}
            >
              {/* Phase header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-surface/50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <ProgressRing pct={phasePct} />
                    <span className="absolute inset-0 flex items-center justify-center text-xl">
                      {phase.icon}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display font-extrabold text-xl text-navy">{phase.title}</h2>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${phaseTag[phase.color]}`}>
                        {doneCount}/{phase.items.length}
                      </span>
                    </div>
                    <p className="text-navy/50 text-sm mt-0.5">{phase.subtitle}</p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-navy/30 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {/* Phase items */}
              {isExpanded && (
                <div className="border-t border-surface-dark divide-y divide-surface-dark">
                  {phase.items.map((item) => {
                    const isDone = checked.has(item.id);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-start gap-4 px-6 py-4 cursor-pointer transition-colors ${isDone ? "bg-surface/60" : "hover:bg-surface/30"}`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => toggle(item.id)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                            isDone
                              ? "bg-navy border-navy"
                              : "border-navy/20 hover:border-navy/50"
                          }`}>
                            {isDone && (
                              <svg className="w-3 h-3 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            <span className={`text-sm font-semibold leading-snug transition-all ${isDone ? "line-through text-navy/35" : "text-navy"}`}>
                              {item.label}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize flex-shrink-0 ${priorityStyles[item.priority]}`}>
                              {item.priority}
                            </span>
                          </div>
                          <p className={`text-xs mt-1 leading-relaxed ${isDone ? "text-navy/30" : "text-navy/50"}`}>
                            {item.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-navy/30 text-xs mt-10">
        Every check saves instantly to localStorage and syncs to cloud storage.
        Progress persists across sessions and devices.
      </p>
    </div>
  );
}
