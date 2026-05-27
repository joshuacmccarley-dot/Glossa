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

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setServerError(error.message);
    } else {
      router.push("/discover");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-emerald-50 to-white">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <Image src="/logo-mark.svg" alt="sinc'd" width={40} height={48} className="object-contain" unoptimized />
          <span className="font-black text-2xl text-gray-900 tracking-tight">sinc&apos;d</span>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-5 [font-family:var(--font-playfair)]">Welcome back</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
            {serverError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{serverError}</p>
            )}
            <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
              Log in
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/auth/forgot-password" className="text-sm text-[#003526] hover:text-[#004535] font-medium">
              Forgot password?
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-semibold text-[#003526] hover:text-[#004535]">
            Join sinc&apos;d free
          </Link>
        </p>
      </div>
    </div>
  );
}
