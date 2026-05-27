"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
      primary: "bg-[#C4A44A] hover:bg-[#D4BA70] text-[#003526] focus:ring-[#C4A44A] shadow-lg hover:shadow-xl font-bold",
      secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 focus:ring-[#C4A44A] shadow",
      outline: "border-2 border-[#C4A44A] text-[#003526] hover:bg-[#FDF6E3] focus:ring-[#C4A44A]",
      ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-300",
      danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    };
    const sizes = {
      sm: "text-sm px-4 py-2 gap-1.5",
      md: "text-base px-6 py-3 gap-2",
      lg: "text-lg px-8 py-4 gap-2",
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
