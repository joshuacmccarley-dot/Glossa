"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/discover");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-emerald-50 to-white">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <img src="/logo-mark.svg" alt="sinc'd" className="w-10 h-12 object-contain" />
          <span className="font-black text-2xl text-gray-900 tracking-tight">sinc&apos;d</span>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 p-8">
          <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}
            <Button type="submit" className="w-full" loading={loading} size="lg">
              Log in
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/auth/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              Forgot password?
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Join sinc&apos;d free
          </Link>
        </p>
      </div>
    </div>
  );
}
