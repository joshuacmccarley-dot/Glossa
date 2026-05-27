"use client";
import { DiscoverProfile } from "@/types";
import { calculateAge } from "@/lib/utils";
import { getInterestById } from "@/lib/interests";
import { MapPin, Star } from "lucide-react";

interface ProfileCardProps {
  profile: DiscoverProfile;
  onLike: () => void;
  onPass: () => void;
}

export function ProfileCard({ profile, onLike, onPass }: ProfileCardProps) {
  const age = calculateAge(profile.birthdate);
  const photo = profile.photos?.[0] || `https://api.dicebear.com/9.x/personas/svg?seed=${profile.user_id}`;

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-900" style={{ aspectRatio: "3/4" }}>
        {/* Photo */}
        <img
          src={photo}
          alt={profile.display_name}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Compatibility badge */}
        {profile.compatibility_score > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 shadow">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-gray-800">{profile.compatibility_score}% match</span>
          </div>
        )}

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {profile.display_name}, {age}
              </h2>
              {profile.location && (
                <div className="flex items-center gap-1 text-white/80 text-sm mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="text-white/90 text-sm line-clamp-2 mb-3">{profile.bio}</p>
          )}

          {/* Interests */}
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 4).map((id) => {
              const interest = getInterestById(id);
              if (!interest) return null;
              return (
                <span key={id} className="flex items-center gap-1 bg-white/20 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full font-medium">
                  {interest.emoji} {interest.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-6 mt-6">
        <button
          onClick={onPass}
          className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 shadow-lg flex items-center justify-center text-2xl hover:border-gray-300 hover:shadow-xl active:scale-95 transition-all"
          aria-label="Pass"
        >
          ✕
        </button>
        <button
          onClick={onLike}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 shadow-xl shadow-rose-200 flex items-center justify-center text-3xl hover:shadow-2xl active:scale-95 transition-all"
          aria-label="Like"
        >
          ❤️
        </button>
        <button className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 shadow-lg flex items-center justify-center text-xl hover:border-gray-300 hover:shadow-xl active:scale-95 transition-all" aria-label="Super like">
          ⭐
        </button>
      </div>
    </div>
  );
}
