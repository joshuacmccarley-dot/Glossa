"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { calculateAge } from "@/lib/utils";
import { getInterestById, RELATIONSHIP_INTENTIONS, WORK_FIELDS } from "@/lib/interests";
import { InterestPicker } from "@/components/profile/interest-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Edit3, Crown, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [workField, setWorkField] = useState("");
  const [intention, setIntention] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    loadProfile();
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
    }
    setLoading(false);
  };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ bio, location, occupation, work_field: workField, relationship_intention: intention, interests }).eq("user_id", profile.user_id);
    await loadProfile();
    setSaving(false);
    setEditing(false);
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
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
              <img
                src={profile.photos?.[0] || `https://api.dicebear.com/9.x/personas/svg?seed=${profile.user_id}&backgroundColor=d1fae5`}
                alt={profile.display_name}
                className="w-20 h-20 rounded-2xl border-4 border-white object-cover bg-emerald-100 shadow"
              />
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center shadow">
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
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
          <h1 className="text-2xl font-black text-gray-900">{profile.display_name}, {age}</h1>
          {profile.location && <p className="text-gray-500 text-sm mt-0.5">📍 {profile.location}</p>}
          {profile.occupation && <p className="text-gray-500 text-sm">💼 {profile.occupation}{workLabel ? ` · ${workLabel.emoji} ${workLabel.label}` : ""}</p>}
          {intentionLabel && <p className="text-emerald-600 text-sm font-medium mt-1">{intentionLabel.emoji} {intentionLabel.label}</p>}
          {profile.bio && <p className="text-gray-600 text-sm mt-3 leading-relaxed">{profile.bio}</p>}

          {/* Interests */}
          {profile.interests.length > 0 && (
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
        </div>
      </div>

      {/* Edit form */}
      {editing && (
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
            <label className="text-sm font-medium text-gray-700 block mb-2">Your interests (pick up to 15)</label>
            <InterestPicker selected={interests} onChange={setInterests} max={15} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
            <Button onClick={save} loading={saving} className="flex-1">Save changes</Button>
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
