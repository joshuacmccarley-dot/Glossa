"use client";
import { useEffect } from "react";
import { Zap } from "lucide-react";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-emerald-50 to-white text-center">
      <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6">
        <Zap className="w-10 h-10 text-amber-400" />
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-gray-500 mb-8 max-w-sm">Don&apos;t worry — this happens sometimes. Try refreshing.</p>
      <button onClick={reset} className="bg-[#003526] hover:bg-[#004535] text-white font-bold px-8 py-4 rounded-full shadow-lg">
        Try again
      </button>
    </div>
  );
}
