"use client";
import { INTEREST_CATEGORIES } from "@/lib/interests";
import { cn } from "@/lib/utils";

interface InterestPickerProps {
  selected: string[];
  onChange: (interests: string[]) => void;
  max?: number;
}

export function InterestPicker({ selected, onChange, max = 15 }: InterestPickerProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((i) => i !== id));
    } else if (selected.length < max) {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-6">
      {INTEREST_CATEGORIES.map((cat) => (
        <div key={cat.id}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {cat.emoji} {cat.label}
          </h3>
          <div className="flex flex-wrap gap-2">
            {cat.interests.map((interest) => {
              const active = selected.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggle(interest.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-all duration-150",
                    active
                      ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200"
                      : "bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:text-rose-500"
                  )}
                >
                  <span>{interest.emoji}</span>
                  <span>{interest.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-center text-xs text-gray-400">
        {selected.length}/{max} selected
      </p>
    </div>
  );
}
