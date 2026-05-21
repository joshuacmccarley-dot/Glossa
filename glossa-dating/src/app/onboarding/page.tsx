"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ChevronRight, ChevronLeft, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InterestPicker } from "@/components/profile/interest-picker";
import { MODES, DATING_INTENTIONS } from "@/lib/modes";
import { getUserLocation } from "@/lib/location";
import type { ConnectionMode } from "@/lib/modes";

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fields
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [modes, setModes] = useState<ConnectionMode[]>([]);
  const [intention, setIntention] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const toggleMode = (id: ConnectionMode) =>
    setModes((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);

  const detectLocation = async () => {
    setLocating(true);
    try {
      const pos = await getUserLocation();
      setLat(pos.lat);
      setLng(pos.lng);
      // Reverse geocode with nominatim (free, no key needed)
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&format=json`);
      const data = await res.json();
      const city = data.address?.city || data.address?.town || data.address?.village || "";
      const state = data.address?.state || "";
      if (city) setLocation(`${city}${state ? ", " + state : ""}`);
    } catch { /* location denied, just skip */ }
    finally { setLocating(false); }
  };

  const finish = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { error: err } = await supabase.from("profiles").update({
      birthdate: birthdate || "2000-01-01",
      gender: gender || "Prefer not to say",
      connection_modes: modes,
      relationship_intention: intention || null,
      bio: bio || null,
      interests,
      location: location || null,
      latitude: lat,
      longitude: lng,
      onboarding_complete: true,
    }).eq("user_id", user.id);

    if (err) { setError(err.message); setLoading(false); }
    else router.push("/discover");
  };

  const genders = ["Man", "Woman", "Non-binary", "Genderqueer", "Trans man", "Trans woman", "Prefer not to say"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 to-white flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-2 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-gray-900">sinc&apos;d</span>
          <span className="ml-auto text-xs text-gray-400 italic">&ldquo;Feel connected without questioning&rdquo;</span>
        </div>
        {/* Progress */}
        <div className="flex gap-1.5 mb-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < step ? "bg-emerald-500" : "bg-gray-100"}`} />
          ))}
        </div>
        <p className="text-xs text-gray-400 mb-4">Step {step} of {TOTAL_STEPS}</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 max-w-lg mx-auto w-full pb-28 overflow-y-auto">

        {/* Step 1 — Modes (what brings you here?) */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">What brings you to sinc&apos;d?</h2>
              <p className="text-gray-500 text-sm">Pick everything that applies — you can be here for more than one thing.</p>
            </div>
            <div className="space-y-3">
              {MODES.map((m) => {
                const active = modes.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMode(m.id)}
                    className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      active ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="text-3xl mt-0.5">{m.emoji}</span>
                    <div className="flex-1">
                      <p className={`font-bold text-base ${active ? "text-emerald-700" : "text-gray-900"}`}>{m.label}</p>
                      <p className="text-sm text-gray-500 leading-snug mt-0.5">{m.tagline}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${active ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}>
                      {active && <span className="text-white text-[10px] font-black">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            {modes.includes("dating") && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">For dating — what are you open to?</p>
                <div className="grid grid-cols-1 gap-2">
                  {DATING_INTENTIONS.map((ri) => (
                    <button
                      key={ri.id}
                      type="button"
                      onClick={() => setIntention(ri.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm text-left transition ${
                        intention === ri.id ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span>{ri.emoji}</span> {ri.label}
                      {intention === ri.id && <span className="ml-auto text-emerald-500">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Basic info */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">A little about you</h2>
              <p className="text-gray-500 text-sm">Just the basics — no interrogation.</p>
            </div>
            <Input
              id="birthdate"
              type="date"
              label="Date of birth (must be 18+)"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
            />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">I am a...</label>
              <div className="flex flex-wrap gap-2">
                {genders.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      gender === g ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-200 text-gray-600 hover:border-emerald-300"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Location */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Where are you?</h2>
              <p className="text-gray-500 text-sm">Used to find people and events near you. We never share your exact location.</p>
            </div>
            <button
              type="button"
              onClick={detectLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-semibold py-4 rounded-2xl hover:bg-emerald-100 transition disabled:opacity-60"
            >
              <MapPin className="w-4 h-4" />
              {locating ? "Detecting..." : lat ? "📍 Location detected" : "Use my current location"}
            </button>
            <div className="text-center text-gray-400 text-xs">or type it manually</div>
            <Input
              id="location"
              label="City / area"
              placeholder="e.g. Austin, TX"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        )}

        {/* Step 4 — Interests */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">What are you into?</h2>
              <p className="text-gray-500 text-sm">Pick up to 15. This is the engine behind your matches.</p>
            </div>
            <InterestPicker selected={interests} onChange={setInterests} max={15} />
          </div>
        )}

        {/* Step 5 — Bio */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Say something real</h2>
              <p className="text-gray-500 text-sm">Optional — but people who write something genuine get 5x more connections.</p>
            </div>
            <div>
              <textarea
                rows={5}
                placeholder='e.g. "I make excellent tacos and very questionable decisions. Looking for someone to hike badly with and debate movie endings."'
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={400}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition resize-none text-sm"
              />
              <p className="text-right text-xs text-gray-400 mt-1">{bio.length}/400</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm space-y-1.5">
              <p className="font-semibold text-emerald-800 text-xs uppercase tracking-wide">Try one of these:</p>
              {[
                "The thing I'm most passionate about right now is...",
                "A perfect weekend looks like...",
                "Ask me about my collection of...",
                "I'm probably overthinking...",
              ].map((p) => (
                <button key={p} type="button" onClick={() => setBio(p)} className="block text-left text-emerald-700 hover:text-emerald-900 transition text-sm">
                  &rarr; {p}
                </button>
              ))}
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 safe-area-bottom">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 1 && (
            <Button variant="secondary" onClick={back} size="md" className="flex-1 gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button
              onClick={next}
              size="md"
              className="flex-1 gap-1"
              disabled={step === 1 && modes.length === 0}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={finish} className="flex-1" loading={loading}>
              {interests.length > 0 ? `I'm ready — let's go 🚀` : "Skip for now & get started"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
