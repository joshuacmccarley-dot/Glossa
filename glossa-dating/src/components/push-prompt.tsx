"use client";
import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

const STORAGE_KEY = "sincd_push_dismissed";
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function PushPrompt() {
  const [show, setShow] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !VAPID_PUBLIC ||
      localStorage.getItem(STORAGE_KEY)
    ) return;

    // Only show after a short delay — don't interrupt first load
    const t = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const enable = async () => {
    setSubscribing(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { dismiss(); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });

      const json = sub.toJSON();
      const keys = json.keys as { p256dh: string; auth: string };

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        }),
      });

      dismiss();
    } catch {
      dismiss();
    }
    setSubscribing(false);
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200 border border-gray-100 p-4 flex gap-3 items-start">
        <div className="w-10 h-10 bg-[#003526] rounded-xl flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">Never miss a match</p>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">
            Get notified instantly when you connect with someone — before the 12-hour window closes.
          </p>
          <div className="flex gap-2">
            <button
              onClick={enable}
              disabled={subscribing}
              className="flex-1 bg-[#003526] hover:bg-[#004535] text-white text-xs font-bold py-2 rounded-full disabled:opacity-60"
            >
              {subscribing ? "Enabling..." : "Enable alerts"}
            </button>
            <button onClick={dismiss} className="px-3 py-2 text-xs text-gray-400 hover:text-gray-600">
              Not now
            </button>
          </div>
        </div>
        <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 flex-shrink-0 -mt-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
