"use client";
import { useState } from "react";
import Link from "next/link";
import { Zap, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
    setLoading(false);
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
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-[#003526]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-[#003526]" />
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-gray-500 text-sm mb-6">
                We sent a password reset link to <strong>{email}</strong>. Check your spam folder if you don&apos;t see it.
              </p>
              <Link href="/auth/login" className="text-sm font-semibold text-[#003526] hover:text-[#004535]">
                ← Back to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-black text-gray-900 mb-1">Reset your password</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your email and we&apos;ll send a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="email"
                  type="email"
                  label="Email address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
                <Button type="submit" className="w-full" loading={loading} size="lg">
                  Send reset link
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link href="/auth/login" className="text-sm text-gray-400 hover:text-gray-600">
                  ← Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
