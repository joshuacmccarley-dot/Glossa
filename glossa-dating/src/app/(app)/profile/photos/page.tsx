"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Star, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PhotoUpload } from "@/components/profile/photo-upload";
import { Button } from "@/components/ui/button";

interface PhotoItem {
  url: string;
  path: string;
  isPrimary: boolean;
}

export default function PhotosPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [primaryUrl, setPrimaryUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, extra_photos")
        .eq("user_id", user.id)
        .single();

      const primary = profile?.avatar_url ?? null;
      setPrimaryUrl(primary);

      const extras: string[] = profile?.extra_photos ?? [];
      const all: PhotoItem[] = [
        ...(primary ? [{ url: primary, path: "", isPrimary: true }] : []),
        ...extras.map((u: string) => ({ url: u, path: "", isPrimary: false })),
      ];
      setPhotos(all);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleUploaded = (url: string) => {
    setPhotos((prev) => {
      if (prev.some((p) => p.url === url)) return prev;
      return [...prev, { url, path: "", isPrimary: false }];
    });
  };

  const setPrimary = (url: string) => {
    setPhotos((prev) => prev.map((p) => ({ ...p, isPrimary: p.url === url })));
    setPrimaryUrl(url);
  };

  const removePhoto = (url: string) => {
    setPhotos((prev) => {
      const next = prev.filter((p) => p.url !== url);
      if (prev.find((p) => p.url === url)?.isPrimary && next.length > 0) {
        next[0].isPrimary = true;
        setPrimaryUrl(next[0].url);
      }
      return next;
    });
  };

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    const primary = photos.find((p) => p.isPrimary)?.url ?? photos[0]?.url ?? null;
    const extras = photos.filter((p) => !p.isPrimary).map((p) => p.url);

    await supabase.from("profiles").update({
      avatar_url: primary,
      extra_photos: extras,
    }).eq("user_id", userId);

    setSaving(false);
    router.push("/profile");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-black text-gray-900 mb-1">Your photos</h1>
      <p className="text-sm text-gray-500 mb-6">Add up to 6 photos. Tap the star to set your primary photo.</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {photos.map((photo) => (
          <div key={photo.url} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <Image src={photo.url} alt="Profile photo" fill className="object-cover" />
            {photo.isPrimary && (
              <div className="absolute top-1.5 left-1.5 bg-[#C4A44A] text-[#003526] text-[10px] font-bold px-2 py-0.5 rounded-full">
                Primary
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 flex justify-between">
              {!photo.isPrimary && (
                <button onClick={() => setPrimary(photo.url)} className="text-yellow-300 hover:text-yellow-200">
                  <Star className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => removePhoto(photo.url)}
                className="text-white/80 hover:text-red-400 ml-auto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {photos.length < 6 && userId && (
          <div className="aspect-square">
            <PhotoUpload
              userId={userId}
              onUploaded={handleUploaded}
              label="Add photo"
              className="w-full h-full"
            />
          </div>
        )}
      </div>

      <Button onClick={save} loading={saving} className="w-full" size="lg">
        Save photos
      </Button>
    </div>
  );
}
