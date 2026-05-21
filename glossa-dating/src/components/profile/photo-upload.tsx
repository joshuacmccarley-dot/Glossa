"use client";
import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  label?: string;
  className?: string;
}

export function PhotoUpload({ userId, currentUrl, onUploaded, label = "Upload photo", className = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 8 * 1024 * 1024) { setError("Photo must be under 8 MB."); return; }
    setError("");
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("photos")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      setError(upErr.message);
      setPreview(null);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    onUploaded(data.publicUrl);
    setUploading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const displayUrl = preview ?? currentUrl;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        disabled={uploading}
        className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50 transition-colors flex items-center justify-center group"
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayUrl} alt="Profile photo" className="w-full h-full object-cover" />
        ) : (
          <Camera className="w-8 h-8 text-emerald-300 group-hover:text-emerald-500 transition-colors" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
        {displayUrl && !uploading && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleChange}
      />

      <p className="text-xs text-gray-500">{label}</p>

      {error && (
        <div className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
          <X className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
}
