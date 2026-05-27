"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const handleContinue = async () => {
    const valid = await trigger("name");
    if (valid) setStep(2);
  };

  const onSubmit = async (data: RegisterForm) => {
    setServerError("");
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (authError) {
      setServerError(authError.message);
      return;
    }
    if (authData.user) {
      // Create minimal profile stub — onboarding fills the rest
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: authData.user.id,
        display_name: data.name,
        birthdate: "2000-01-01", // placeholder, filled in onboarding
        gender: "unspecified",
        onboarding_complete: false,
      });
      if (profileError) {
        setServerError(profileError.message);
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
              referred_user_id: authData.user.id,
              referrer_user_id: refRow.user_id,
            });
          }
        }
      } catch { /* best-effort — do not block registration */ }

      router.push("/onboarding");
    }
  };

  const displayName = getValues("name");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-emerald-50 to-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <Image src="/logo-mark.svg" alt="sinc'd" width={40} height={48} className="object-contain" unoptimized />
          <span className="font-black text-2xl text-gray-900 tracking-tight">sinc&apos;d</span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 p-8">
          {/* Progress */}
          <div className="flex gap-1.5 mb-6">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-[#C4A44A]" : "bg-gray-100"}`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">What do people call you?</h2>
                  <p className="text-sm text-gray-500 mb-4">This will be your display name on sinc&apos;d.</p>
                </div>
                <div>
                  <Input
                    id="name"
                    label="Display name"
                    placeholder="Your first name or nickname"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>
                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  onClick={handleContinue}
                >
                  Continue →
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 [font-family:var(--font-playfair)]">Create your account</h2>
                  <p className="text-sm text-gray-500 mb-4">Almost there, {displayName}.</p>
                </div>
                <div>
                  <Input
                    id="email"
                    type="email"
                    label="Email"
                    placeholder="you@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    id="password"
                    type="password"
                    label="Password"
                    placeholder="8+ characters, 1 uppercase, 1 number"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    id="confirmPassword"
                    type="password"
                    label="Confirm password"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
                {serverError && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{serverError}</p>
                )}
                <p className="text-xs text-gray-400">
                  By signing up you agree to our{" "}
                  <Link href="/terms" className="text-[#003526]">Terms</Link> and{" "}
                  <Link href="/privacy" className="text-[#003526]">Privacy Policy</Link>.
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">
                    ← Back
                  </Button>
                  <Button type="submit" className="flex-1" loading={isSubmitting}>
                    Join sinc&apos;d
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[#003526] hover:text-[#004535]">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
