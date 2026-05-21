"use client";
import { useState } from "react";
import { Shield, X } from "lucide-react";
import { REPORT_REASONS } from "@/lib/moderation";
import type { ReportReason } from "@/lib/moderation";
import { Button } from "./button";

interface ReportModalProps {
  reportedId: string;
  reportedName: string;
  onClose: () => void;
  onBlock?: () => void;
}

export function ReportModal({ reportedId, reportedName, onClose, onBlock }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setLoading(true);
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reported_id: reportedId, reason, details }),
    });
    setDone(true);
    setLoading(false);
  };

  const block = async () => {
    await fetch("/api/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked_id: reportedId }),
    });
    onBlock?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-8 sm:pb-0" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-500" />
            <h3 className="font-bold text-gray-900">Report {reportedName}</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-bold text-gray-900 mb-1">Report submitted</p>
            <p className="text-sm text-gray-500 mb-5">Our safety team will review this within 24 hours. Thank you for keeping sinc&apos;d safe.</p>
            <div className="flex gap-2">
              <Button variant="danger" onClick={block} className="flex-1 text-sm">
                Also block {reportedName}
              </Button>
              <Button variant="secondary" onClick={onClose} className="flex-1 text-sm">Close</Button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">What&apos;s the issue?</p>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setReason(r.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm text-left transition ${
                      reason === r.id ? "border-rose-400 bg-rose-50 text-rose-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {reason === r.id && <span className="text-rose-500">●</span>}
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <textarea
                placeholder="Optional: tell us more (max 500 chars)"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={500}
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-rose-400 focus:outline-none resize-none"
              />
            </div>
            <div className="flex gap-2 pb-2">
              <Button variant="secondary" onClick={block} size="sm" className="flex-1">Block only</Button>
              <Button variant="danger" onClick={submit} size="sm" className="flex-1" loading={loading} disabled={!reason}>
                Submit report
              </Button>
            </div>
            <p className="text-xs text-gray-400 text-center pb-2">
              sinc&apos;d has zero tolerance for hate speech, racism, sexism, or discrimination. Reports are reviewed within 24 hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
