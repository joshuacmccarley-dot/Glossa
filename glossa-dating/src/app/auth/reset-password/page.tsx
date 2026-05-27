"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase embeds the token in the URL hash on redirect
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      router.push("/discover");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-emerald-50 to-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#003526] rounded-2xl flex items-center justify-center shadow-lg shadow-[#003526]/20 mb-3">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">sinc&apos;d</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 p-8">
          {!ready ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Verifying reset link...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-black text-gray-900 mb-1">Set new password</h2>
              <p className="text-gray-500 text-sm mb-6">Choose something strong — at least 8 characters.</p>
              <form onSubmit={handleReset} className="space-y-4">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    label="New password"
                    placeholder="8+ characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Input
                  id="confirm"
                  type={showPw ? "text" : "password"}
                  label="Confirm password"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  error={confirm && confirm !== password ? "Passwords don't match" : undefined}
                />
                {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
                <Button type="submit" className="w-full" loading={loading} size="lg">
                  Update password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
