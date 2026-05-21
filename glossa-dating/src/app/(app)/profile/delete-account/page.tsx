"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";
export default function DeleteAccountPage() {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    if (confirm !== "delete my account") return;
    setDeleting(true);
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    if (res.ok) router.push("/");
    else setDeleting(false);
  };
  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-6 h-6 text-red-500" />
        <h1 className="text-xl font-black text-gray-900">Delete account</h1>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
        <p className="text-sm text-red-700 font-semibold mb-1">This is permanent.</p>
        <p className="text-sm text-red-600">All your matches, messages, and profile data will be deleted and cannot be recovered.</p>
      </div>
      <label className="text-sm font-medium text-gray-700 block mb-2">
        Type <strong>delete my account</strong> to confirm
      </label>
      <input
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="delete my account"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:border-red-300 focus:outline-none"
      />
      <button
        onClick={handleDelete}
        disabled={confirm !== "delete my account" || deleting}
        className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl disabled:opacity-40 transition"
      >
        <Trash2 className="w-4 h-4" />
        {deleting ? "Deleting..." : "Permanently delete account"}
      </button>
    </div>
  );
}
