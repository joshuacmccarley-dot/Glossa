"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function LandingHero() {
  return (
    <section className="pt-24 pb-20 px-4 bg-gradient-to-b from-[#003526] to-[#004535]">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          className="w-40 mx-auto mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image src="/logo.svg" alt="sinc'd" width={160} height={64} className="w-full object-contain" unoptimized />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/10 text-[#C4A44A] text-xs font-bold px-4 py-2 rounded-full mb-8 shadow-sm border border-[#C4A44A]/30"
        >
          Connecting everyone, without the questioning
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight [font-family:var(--font-playfair)]"
        >
          Feel connected<br />
          <span className="text-[#C4A44A]">without questioning</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-xl text-white/70 max-w-xl mx-auto mb-4 leading-relaxed"
        >
          sinc&apos;d isn&apos;t just a dating app. It&apos;s how your community connects — for romance, events, lending a hand, or simply finding your people.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-base text-white/50 mb-10"
        >
          One app. Four ways to connect. One flat price — <strong className="text-white/80">$5/month</strong> for everything.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-4"
        >
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 bg-[#C4A44A] hover:bg-[#D4BA70] text-[#003526] text-lg font-black px-8 py-4 rounded-full shadow-xl transition-all active:scale-[0.98]"
          >
            Get started free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-lg font-semibold px-8 py-4 rounded-full border border-white/20 transition-all"
          >
            Log in
          </Link>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="text-sm text-white/40"
        >
          No credit card to join. No algorithms hiding your matches.
        </motion.p>
      </div>
    </section>
  );
}
