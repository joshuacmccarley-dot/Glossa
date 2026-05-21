"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      // Create minimal profile stub — onboarding fills the rest
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: data.user.id,
        display_name: displayName,
        birthdate: "2000-01-01", // placeholder, filled in onboarding
        gender: "unspecified",
        onboarding_complete: false,
      });
      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      // Record referral use best-effort
      try {
        const refCode = new URLSearchParams(window.location.search).get("ref");
        if (refCode) {
          const { data: refRow } = await supabase
            .from("referral_codes")
            .select("user_id")
            .eq("code", refCode)
            .maybeSingle();
          if (refRow?.user_id) {
            await supabase.from("referral_uses").insert({
              code: refCode,
              referred_user_id: data.user.id,
              referrer_user_id: refRow.user_id,
            });
          }
        }
      } catch { /* best-effort — do not block registration */ }

      router.push("/onboarding");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-emerald-50 to-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 mb-3">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">sinc&apos;d</h1>
          <p className="text-gray-500 text-sm mt-1">Find your people</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 p-8">
          {/* Progress */}
          <div className="flex gap-1.5 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-emerald-500" : "bg-gray-100"}`} />
            ))}
          </div>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleRegister} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">What do people call you?</h2>
                  <p className="text-sm text-gray-500 mb-4">This will be your display name on sinc&apos;d.</p>
                </div>
                <Input
                  id="name"
                  label="Display name"
                  placeholder="Your first name or nickname"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  minLength={2}
                />
                <Button type="submit" className="w-full" size="lg" disabled={displayName.length < 2}>
                  Continue →
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Create your account</h2>
                  <p className="text-sm text-gray-500 mb-4">Almost there, {displayName}.</p>
                </div>
                <Input
                  id="email"
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  id="password"
                  type="password"
                  label="Password"
                  placeholder="8+ characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                {error && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
                )}
                <p className="text-xs text-gray-400">
                  By signing up you agree to our{" "}
                  <Link href="/terms" className="text-emerald-600">Terms</Link> and{" "}
                  <Link href="/privacy" className="text-emerald-600">Privacy Policy</Link>.
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">
                    ← Back
                  </Button>
                  <Button type="submit" className="flex-1" loading={loading}>
                    Join sinc&apos;d
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
