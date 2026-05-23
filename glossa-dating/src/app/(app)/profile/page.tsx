"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { calculateAge } from "@/lib/utils";
import { getInterestById, RELATIONSHIP_INTENTIONS, WORK_FIELDS } from "@/lib/interests";
import { WANTS, getWantById } from "@/lib/wants";
import { PROMPTS, ProfilePrompt, getPrompt } from "@/lib/prompts";
import { InterestPicker } from "@/components/profile/interest-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LogOut, Edit3, Crown, Camera, Eye, EyeOff, PauseCircle, PlayCircle,
  Images, MessageSquare, SlidersHorizontal, Trash2, Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Dating detail options ─────────────────────────────────────────────────
const HAS_KIDS_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "no", label: "No kids" },
  { value: "yes", label: "Have kids" },
  { value: "step", label: "Have stepkids" },
];
const WANTS_KIDS_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "open", label: "Open to it" },
];
const RELATIONSHIP_STYLE_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "monogamous", label: "Monogamous" },
  { value: "open", label: "Open/ENM" },
  { value: "figuring", label: "Still figuring out" },
];
const DRINKING_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "never", label: "Never" },
  { value: "rarely", label: "Rarely" },
  { value: "socially", label: "Socially" },
  { value: "regularly", label: "Regularly" },
];
const SMOKING_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "never", label: "Never" },
  { value: "socially", label: "Socially" },
  { value: "yes", label: "Yes" },
];

// ─── Shared detail select ──────────────────────────────────────────────────
function DetailSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "wants" | "privacy" | "prompts" | "details">("profile");

  // Edit form state
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [workField, setWorkField] = useState("");
  const [intention, setIntention] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [wants, setWants] = useState<string[]>([]);

  // Privacy state
  const [showAge, setShowAge] = useState(true);
  const [hideDistance, setHideDistance] = useState(false);
  const [profilePaused, setProfilePaused] = useState(false);

  // Prompts state
  const [profilePrompts, setProfilePrompts] = useState<ProfilePrompt[]>([]);

  // Dating details state
  const [hasKids, setHasKids] = useState("");
  const [wantsKids, setWantsKids] = useState("");
  const [relationshipStyle, setRelationshipStyle] = useState("");
  const [drinking, setDrinking] = useState("");
  const [smoking, setSmoking] = useState("");

  useEffect(() => {
    loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
    setProfile(data);
    if (data) {
      setBio(data.bio || "");
      setLocation(data.location || "");
      setOccupation(data.occupation || "");
      setWorkField(data.work_field || "");
      setIntention(data.relationship_intention || "");
      setInterests(data.interests || []);
      setWants(data.wants || []);
      setShowAge(data.show_age !== false);
      setHideDistance(data.hide_distance === true);
      setProfilePaused(data.profile_paused === true);
      setProfilePrompts(Array.isArray(data.profile_prompts) ? data.profile_prompts : []);
      setHasKids(data.has_kids || "");
      setWantsKids(data.wants_kids || "");
      setRelationshipStyle(data.relationship_style || "");
      setDrinking(data.drinking || "");
      setSmoking(data.smoking || "");
    }
    setLoading(false);
  };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      bio,
      location,
      occupation,
      work_field: workField,
      relationship_intention: intention,
      interests,
      wants,
      show_age: showAge,
      hide_distance: hideDistance,
      profile_paused: profilePaused,
      profile_prompts: profilePrompts,
    }).eq("user_id", profile.user_id);
    await loadProfile();
    setSaving(false);
    setEditing(false);
  };

  const savePrivacy = async () => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      show_age: showAge,
      hide_distance: hideDistance,
      profile_paused: profilePaused,
    }).eq("user_id", profile.user_id);
    setSaving(false);
  };

  const savePrompts = async () => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      profile_prompts: profilePrompts,
    }).eq("user_id", profile.user_id);
    setSaving(false);
  };

  const saveDetails = async () => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      has_kids: hasKids || null,
      wants_kids: wantsKids || null,
      relationship_style: relationshipStyle || null,
      drinking: drinking || null,
      smoking: smoking || null,
    }).eq("user_id", profile.user_id);
    setSaving(false);
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const toggleWant = (id: string) => {
    setWants((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : prev.length < 10 ? [...prev, id] : prev
    );
  };

  // ─── Prompt helpers ────────────────────────────────────────────────────────
  const addPromptSlot = () => {
    if (profilePrompts.length >= 3) return;
    // Pick the first prompt not already used
    const usedIds = new Set(profilePrompts.map((p) => p.id));
    const first = PROMPTS.find((p) => !usedIds.has(p.id));
    if (!first) return;
    setProfilePrompts((prev) => [...prev, { id: first.id, answer: "" }]);
  };

  const removePromptSlot = (idx: number) => {
    setProfilePrompts((prev) => prev.filter((_, i) => i !== idx));
  };

  const updatePromptId = (idx: number, newId: string) => {
    setProfilePrompts((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, id: newId } : p))
    );
  };

  const updatePromptAnswer = (idx: number, answer: string) => {
    setProfilePrompts((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, answer } : p))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const age = calculateAge(profile.birthdate);
  const intentionLabel = RELATIONSHIP_INTENTIONS.find((r) => r.id === profile.relationship_intention);
  const workLabel = WORK_FIELDS.find((w) => w.id === profile.work_field);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-8">
      {/* Premium banner */}
      <Link href="/referral" className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-4 shadow-sm hover:border-emerald-200 transition-colors">
        <span className="text-xl">🎁</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">Refer a friend — get 30 days free</p>
          <p className="text-xs text-gray-400">Both of you get Premium at no cost</p>
        </div>
        <span className="text-gray-400 text-sm">→</span>
      </Link>

      {!profile.is_premium && (
        <Link href="/pricing" className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-4 text-white mb-5 shadow-lg shadow-emerald-100">
          <Crown className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm">Unlock sinc&apos;d Premium</p>
            <p className="text-white/80 text-xs">Unlimited likes, match recovery, see who liked you — $5/mo</p>
          </div>
          <span className="text-white/80 text-sm">→</span>
        </Link>
      )}

      {profile.is_premium && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-5">
          <Crown className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">sinc&apos;d Premium active</span>
        </div>
      )}

      {/* Profile header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <div className="relative h-40 bg-gradient-to-br from-emerald-400 to-teal-400">
          <div className="absolute -bottom-10 left-6">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.avatar_url || `https://api.dicebear.com/9.x/personas/svg?seed=${profile.id}&backgroundColor=d1fae5`}
                alt={profile.display_name}
                className="w-20 h-20 rounded-2xl border-4 border-white object-cover bg-emerald-100 shadow"
              />
              <Link
                href="/profile/photos"
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center shadow"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </Link>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 shadow"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="pt-12 px-6 pb-6">
          <h1 className="text-2xl font-black text-gray-900">
            {profile.display_name}{showAge && age ? `, ${age}` : ""}
          </h1>
          {profile.location && <p className="text-gray-500 text-sm mt-0.5">📍 {profile.location}</p>}
          {profile.occupation && <p className="text-gray-500 text-sm">💼 {profile.occupation}{workLabel ? ` · ${workLabel.emoji} ${workLabel.label}` : ""}</p>}
          {intentionLabel && <p className="text-emerald-600 text-sm font-medium mt-1">{intentionLabel.emoji} {intentionLabel.label}</p>}
          {profile.bio && <p className="text-gray-600 text-sm mt-3 leading-relaxed">{profile.bio}</p>}

          {profile.interests && profile.interests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.interests.map((id) => {
                const interest = getInterestById(id);
                if (!interest) return null;
                return (
                  <span key={id} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs px-3 py-1.5 rounded-full font-medium">
                    {interest.emoji} {interest.label}
                  </span>
                );
              })}
            </div>
          )}

          {profile.wants && profile.wants.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.wants.map((id) => {
                const want = getWantById(id);
                if (!want) return null;
                return (
                  <span key={id} className="text-xs bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-full font-medium">
                    {want.emoji} {want.label}
                  </span>
                );
              })}
            </div>
          )}

          <Link
            href="/profile/photos"
            className="mt-4 flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <Images className="w-4 h-4" />
            Manage photos
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {([
          { id: "profile", label: "Profile" },
          { id: "wants", label: "What I want" },
          { id: "prompts", label: "Prompts", icon: MessageSquare },
          { id: "details", label: "Details", icon: SlidersHorizontal },
          { id: "privacy", label: "Privacy" },
        ] as const).map((t) => {
          const Icon = "icon" in t ? t.icon : null;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1 py-2 px-3 rounded-full text-sm font-semibold transition-colors ${
                activeTab === t.id ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Profile edit tab */}
      {activeTab === "profile" && editing && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-4 space-y-5">
          <h2 className="font-bold text-gray-900">Edit profile</h2>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={400}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition resize-none text-sm"
              placeholder="Tell people who you actually are..."
            />
          </div>
          <Input id="location" label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
          <Input id="occupation" label="Occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="Job title" />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Work field</label>
            <div className="flex flex-wrap gap-2">
              {WORK_FIELDS.map((wf) => (
                <button
                  key={wf.id}
                  type="button"
                  onClick={() => setWorkField(workField === wf.id ? "" : wf.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${workField === wf.id ? "bg-emerald-500 text-white border-emerald-500" : "border-gray-200 text-gray-600"}`}
                >
                  {wf.emoji} {wf.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Relationship intention</label>
            <div className="grid grid-cols-1 gap-2">
              {RELATIONSHIP_INTENTIONS.map((ri) => (
                <button
                  key={ri.id}
                  type="button"
                  onClick={() => setIntention(ri.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm text-left transition ${intention === ri.id ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600"}`}
                >
                  <span>{ri.emoji}</span> {ri.label}
                  {intention === ri.id && <span className="ml-auto text-emerald-500">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Your interests (up to 15)</label>
            <InterestPicker selected={interests} onChange={setInterests} max={15} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
            <Button onClick={save} loading={saving} className="flex-1">Save changes</Button>
          </div>
        </div>
      )}

      {activeTab === "profile" && !editing && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-4 text-center text-sm text-gray-400">
          Tap <strong>Edit</strong> in the header to update your profile.
        </div>
      )}

      {/* "What I want" tab */}
      {activeTab === "wants" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-1">What I&apos;m here for</h2>
          <p className="text-xs text-gray-400 mb-4">Pick up to 10 tags. The app uses these to surface the most relevant people to you.</p>
          <div className="space-y-5">
            {(["dating", "events", "help", "community"] as const).map((mode) => {
              const modeWants = WANTS.filter((w) => w.mode === mode);
              const modeLabels: Record<string, string> = { dating: "💍 Dating", events: "🎉 Events", help: "🤝 Lend a Hand", community: "🏘️ Community" };
              return (
                <div key={mode}>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{modeLabels[mode]}</h3>
                  <div className="flex flex-wrap gap-2">
                    {modeWants.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => toggleWant(w.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition ${
                          wants.includes(w.id)
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "border-gray-200 text-gray-600 hover:border-emerald-300"
                        }`}
                      >
                        {w.emoji} {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-xs text-gray-400">{wants.length}/10 selected</span>
            <Button onClick={save} loading={saving} size="sm">Save</Button>
          </div>
        </div>
      )}

      {/* Prompts tab */}
      {activeTab === "prompts" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-1">Conversation prompts</h2>
          <p className="text-xs text-gray-400 mb-5">Pick up to 3 prompts and write an answer. Others will see these on your profile.</p>

          <div className="space-y-5">
            {profilePrompts.map((pp, idx) => {
              const usedIds = new Set(profilePrompts.map((p) => p.id));
              const availablePrompts = PROMPTS.filter((p) => p.id === pp.id || !usedIds.has(p.id));
              const currentPrompt = getPrompt(pp.id);
              const charCount = pp.answer.length;

              return (
                <div key={idx} className="rounded-2xl border border-gray-200 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <select
                      value={pp.id}
                      onChange={(e) => updatePromptId(idx, e.target.value)}
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition text-sm"
                    >
                      {currentPrompt && !availablePrompts.find((p) => p.id === pp.id) && (
                        <option value={pp.id}>{currentPrompt.question}</option>
                      )}
                      {availablePrompts.map((p) => (
                        <option key={p.id} value={p.id}>{p.question}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removePromptSlot(idx)}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <textarea
                      rows={3}
                      value={pp.answer}
                      onChange={(e) => updatePromptAnswer(idx, e.target.value.slice(0, 150))}
                      maxLength={150}
                      placeholder="Your answer..."
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition resize-none text-sm"
                    />
                    <p className={`text-right text-xs mt-1 ${charCount >= 140 ? "text-amber-500" : "text-gray-400"}`}>
                      {charCount}/150
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {profilePrompts.length < 3 && (
            <button
              onClick={addPromptSlot}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition"
            >
              <Plus className="w-4 h-4" />
              Add prompt
            </button>
          )}

          <div className="mt-5 flex justify-end">
            <Button onClick={savePrompts} loading={saving} size="sm">Save prompts</Button>
          </div>
        </div>
      )}

      {/* Details tab */}
      {activeTab === "details" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-4 space-y-5">
          <div>
            <h2 className="font-bold text-gray-900 mb-1">Dating details</h2>
            <p className="text-xs text-gray-400 mb-2">These appear on your profile to help people know if you&apos;re compatible. All optional.</p>
          </div>

          <DetailSelect
            label="Kids"
            value={hasKids}
            onChange={setHasKids}
            options={HAS_KIDS_OPTIONS}
          />
          <DetailSelect
            label="Want kids"
            value={wantsKids}
            onChange={setWantsKids}
            options={WANTS_KIDS_OPTIONS}
          />
          <DetailSelect
            label="Relationship style"
            value={relationshipStyle}
            onChange={setRelationshipStyle}
            options={RELATIONSHIP_STYLE_OPTIONS}
          />
          <DetailSelect
            label="Drinking"
            value={drinking}
            onChange={setDrinking}
            options={DRINKING_OPTIONS}
          />
          <DetailSelect
            label="Smoking"
            value={smoking}
            onChange={setSmoking}
            options={SMOKING_OPTIONS}
          />

          <Button onClick={saveDetails} loading={saving} className="w-full mt-2">Save details</Button>
        </div>
      )}

      {/* Privacy tab */}
      {activeTab === "privacy" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-4 space-y-4">
          <h2 className="font-bold text-gray-900 mb-2">Privacy controls</h2>

          <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50">
            <div className="flex items-start gap-3">
              {showAge ? <Eye className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> : <EyeOff className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />}
              <div>
                <p className="font-semibold text-gray-900 text-sm">Show age</p>
                <p className="text-xs text-gray-400">Your age appears on your profile card</p>
              </div>
            </div>
            <button
              onClick={() => setShowAge((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${showAge ? "bg-emerald-500" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showAge ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50">
            <div className="flex items-start gap-3">
              <EyeOff className={`w-5 h-5 mt-0.5 flex-shrink-0 ${hideDistance ? "text-emerald-500" : "text-gray-400"}`} />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Hide distance</p>
                <p className="text-xs text-gray-400">Others won&apos;t see how far away you are</p>
              </div>
            </div>
            <button
              onClick={() => setHideDistance((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${hideDistance ? "bg-emerald-500" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${hideDistance ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <div className="flex items-start gap-3">
              {profilePaused ? <PauseCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" /> : <PlayCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />}
              <div>
                <p className="font-semibold text-gray-900 text-sm">Pause profile</p>
                <p className="text-xs text-gray-400">Hide your profile from Discover while you take a break</p>
              </div>
            </div>
            <button
              onClick={() => setProfilePaused((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${profilePaused ? "bg-amber-400" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${profilePaused ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <Button onClick={savePrivacy} loading={saving} className="w-full mt-2">Save privacy settings</Button>

          <div className="pt-2 border-t border-gray-100 space-y-2">
            <Link href="/privacy" className="block text-sm text-gray-400 hover:text-gray-600">Privacy policy →</Link>
          </div>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3 text-red-500 font-medium text-sm hover:bg-red-50 rounded-2xl transition"
      >
        <LogOut className="w-4 h-4" />
        Log out
      </button>
    </div>
  );
}
