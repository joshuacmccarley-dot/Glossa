"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ChevronRight, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InterestPicker } from "@/components/profile/interest-picker";
import { RELATIONSHIP_INTENTIONS, WORK_FIELDS } from "@/lib/interests";

const TOTAL_STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step fields
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [workField, setWorkField] = useState("");
  const [intention, setIntention] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const finish = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { error: err } = await supabase
      .from("profiles")
      .update({
        birthdate,
        gender,
        looking_for: lookingFor,
        location,
        occupation,
        work_field: workField,
        relationship_intention: intention,
        bio,
        interests,
        onboarding_complete: true,
      })
      .eq("user_id", user.id);

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      router.push("/discover");
    }
  };

  const genders = ["Man", "Woman", "Non-binary", "Genderqueer", "Transgender", "Prefer not to say"];
  const genderTargets = ["Men", "Women", "Non-binary people", "Everyone"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-gray-900">sinc&apos;d</span>
        </div>
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < step ? "bg-emerald-500" : "bg-gray-200"}`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400">Step {step} of {TOTAL_STEPS}</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 max-w-lg mx-auto w-full pb-24">
        {/* Step 1: Birthday & Gender */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">About you</h2>
              <p className="text-gray-500">Your age and gender help us find your best matches.</p>
            </div>
            <Input
              id="birthdate"
              type="date"
              label="Date of birth"
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
                      gender === g
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-gray-200 text-gray-600 hover:border-emerald-300"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">I&apos;m interested in...</label>
              <div className="flex flex-wrap gap-2">
                {genderTargets.map((g) => {
                  const active = lookingFor.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() =>
                        setLookingFor(active ? lookingFor.filter((x) => x !== g) : [...lookingFor, g])
                      }
                      className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        active
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-gray-200 text-gray-600 hover:border-emerald-300"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location & Work */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Where you&apos;re at</h2>
              <p className="text-gray-500">Help us find people nearby and people you can relate to.</p>
            </div>
            <Input
              id="location"
              label="City or area"
              placeholder="e.g. Austin, TX"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              id="occupation"
              label="Job title / occupation"
              placeholder="e.g. Software engineer, Nurse, Teacher..."
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Field of work</label>
              <div className="flex flex-wrap gap-2">
                {WORK_FIELDS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWorkField(w.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                      workField === w.id
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-gray-200 text-gray-600 hover:border-emerald-300"
                    }`}
                  >
                    <span>{w.emoji}</span> {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Relationship intention */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">What are you looking for?</h2>
              <p className="text-gray-500">Be honest — it helps both of you. You can update this any time.</p>
            </div>
            <div className="space-y-3">
              {RELATIONSHIP_INTENTIONS.map((ri) => (
                <button
                  key={ri.id}
                  type="button"
                  onClick={() => setIntention(ri.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    intention === ri.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300 bg-white"
                  }`}
                >
                  <span className="text-2xl">{ri.emoji}</span>
                  <div>
                    <p className={`font-semibold ${intention === ri.id ? "text-emerald-700" : "text-gray-900"}`}>
                      {ri.label}
                    </p>
                  </div>
                  {intention === ri.id && (
                    <span className="ml-auto text-emerald-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Interests/hobbies */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Your passions</h2>
              <p className="text-gray-500">Pick up to 15 interests. This is how you&apos;ll be matched — be specific.</p>
            </div>
            <InterestPicker selected={interests} onChange={setInterests} max={15} />
          </div>
        )}

        {/* Step 5: Bio */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Say something real</h2>
              <p className="text-gray-500">A short bio that shows who you actually are. Skip the clichés.</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Your bio</label>
              <textarea
                rows={5}
                placeholder="e.g. I make great tacos and worse decisions. Looking for someone to hike with, debate movies, and argue about the best pizza toppings."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={400}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition resize-none"
              />
              <p className="text-right text-xs text-gray-400 mt-1">{bio.length}/400</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm text-emerald-700 space-y-1">
              <p className="font-semibold">Prompts to get you started:</p>
              <ul className="text-emerald-600 space-y-1 list-disc pl-4">
                <li>The thing I&apos;m most passionate about right now is...</li>
                <li>A weekend well spent looks like...</li>
                <li>I&apos;m probably overthinking...</li>
                <li>Ask me about my collection of...</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 6: Photo prompt */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Almost done!</h2>
              <p className="text-gray-500">You can add photos from your profile settings after you&apos;re in. For now, you&apos;re all set.</p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-dashed border-emerald-200 p-8 text-center">
              <div className="text-5xl mb-3">📸</div>
              <p className="font-semibold text-gray-900">Add photos later</p>
              <p className="text-sm text-gray-500 mt-1">Profiles with photos get 10x more matches. Add yours from your profile page.</p>
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}
            <div className="bg-emerald-50 rounded-2xl p-5 space-y-2">
              <p className="font-bold text-emerald-800 text-sm">Your sinc&apos;d profile:</p>
              {intention && <p className="text-sm text-emerald-700">💚 Looking for: {RELATIONSHIP_INTENTIONS.find(r => r.id === intention)?.label}</p>}
              {occupation && <p className="text-sm text-emerald-700">💼 {occupation}</p>}
              <p className="text-sm text-emerald-700">🎯 {interests.length} interests selected</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 safe-area-bottom">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 1 && (
            <Button variant="secondary" onClick={back} className="flex-1 gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button
              onClick={next}
              className="flex-1 gap-1"
              disabled={
                (step === 1 && (!birthdate || !gender || lookingFor.length === 0)) ||
                (step === 3 && !intention) ||
                (step === 4 && interests.length < 3)
              }
            >
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={finish} className="flex-1" loading={loading}>
              Let&apos;s go! 🚀
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
