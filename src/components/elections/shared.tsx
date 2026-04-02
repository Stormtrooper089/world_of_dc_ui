import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin, Search, X } from "lucide-react";

// ─── Searchable station dropdown ──────────────────────────────────────────────
interface StationPickerProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  disabled?: boolean;
}

export const StationPicker: React.FC<StationPickerProps> = ({
  value,
  onChange,
  options,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  const handleSelect = (station: string) => {
    setQuery(station);
    onChange(station);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setOpen(true);
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-center rounded-xl border bg-gray-50 transition-colors ${
          open
            ? "border-blue-500 bg-white ring-2 ring-blue-200"
            : "border-gray-200"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <Search className="ml-3 h-4 w-4 shrink-0 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          placeholder={disabled ? "Loading stations…" : "Select polling station"}
          className="min-w-0 flex-1 bg-transparent py-3 pl-2 pr-1 text-sm text-gray-900 focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleClear(); }}
            className="mr-1 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown
            className={`mr-3 h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </div>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">
              {options.length === 0 ? "Loading options…" : "No stations match your search."}
            </div>
          ) : (
            filtered.map((station) => (
              <button
                key={station}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(station); }}
                onTouchEnd={() => handleSelect(station)}
                className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors active:bg-blue-50 ${
                  station === value
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {station}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── Vehicle detail cell ──────────────────────────────────────────────────────
export const VehicleCell: React.FC<{
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}> = ({ label, value, fullWidth }) => (
  <div className={`bg-white px-3 py-2.5 ${fullWidth ? "col-span-2" : ""}`}>
    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
    <p className="mt-0.5 text-sm font-medium text-gray-900 break-words">{value}</p>
  </div>
);

// ─── Loading skeleton ─────────────────────────────────────────────────────────
export const SkeletonCards: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className={`animate-pulse rounded-2xl bg-gray-${i === 0 ? "200" : "100"} ${
          i === 0 ? "h-20" : i === 1 ? "h-32" : "h-48"
        }`}
      />
    ))}
  </div>
);
