import Link from "next/link";
import { Leaf } from "lucide-react";
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-emerald-50 to-white text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
        <Leaf className="w-10 h-10 text-emerald-400" />
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-sm">This page doesn&apos;t exist or was moved. Let&apos;s get you back on track.</p>
      <Link href="/discover" className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold px-8 py-4 rounded-full shadow-lg">
        Back to Discover
      </Link>
    </div>
  );
}
