"use client";

import type { FilterState, Specialty } from "@/types";

const SPECIALTIES: Specialty[] = [
  "emergency",
  "maternity",
  "dental",
  "pediatric",
  "surgical",
  "cardiology",
  "oncology",
  "general",
];

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onSearch: (overrideFilters?: FilterState) => void;
}

export default function FilterPanel({
  filters,
  onChange,
  onSearch,
}: FilterPanelProps) {
  function toggleSpecialty(s: Specialty) {
    const next = filters.specialties.includes(s)
      ? filters.specialties.filter((x) => x !== s)
      : [...filters.specialties, s];
    onChange({ ...filters, specialties: next });
  }

  function reset() {
    onChange({
      query: filters.query,
      specialties: [],
      ownership: null,
      radius: null,
      lat: null,
      lng: null,
    });
  }

  const hasActiveFilters =
    filters.specialties.length > 0 ||
    filters.ownership !== null ||
    filters.radius !== null;

  const labelClass =
    "block text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-2";

  const inputClass =
    "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent placeholder:text-gray-300 dark:placeholder:text-gray-600 text-gray-800 dark:text-white bg-white dark:bg-gray-800";

  return (
    <div className="space-y-6">

      {/* Location */}
      <div>
        <label className={labelClass}>Location</label>
        <input
          type="text"
          placeholder="Lagos, Nigeria"
          className={inputClass}
        />
        <button
          onClick={() => {
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const next = {
                  ...filters,
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  radius: filters.radius ?? 10,
                };
                onChange(next);
                onSearch(next);
              },
              () => alert("Location access denied. Use text search instead."),
            );
          }}
          className="mt-2 flex items-center gap-1.5 text-xs text-brand-700
                     font-medium hover:text-brand-800 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827
                     0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          Use my location
        </button>
      </div>

      {/* Radius */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-700
                            dark:text-gray-200 uppercase tracking-wider">
            Radius
          </label>
          <span className="text-xs font-semibold text-brand-700">
            {filters.radius ?? 10} km
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={50}
          value={filters.radius ?? 10}
          onChange={(e) =>
            onChange({ ...filters, radius: Number(e.target.value) })
          }
          className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full
                     appearance-none cursor-pointer accent-brand-700"
        />
        <div className="flex justify-between text-xs text-gray-400
                        dark:text-gray-500 mt-1">
          <span>1 km</span>
          <span>50 km</span>
        </div>
      </div>

      {/* Specialty */}
      <div>
        <label className={labelClass}>Specialty</label>
        <select
          value={filters.specialties[0] ?? ""}
          onChange={(e) => {
            const val = e.target.value as Specialty;
            onChange({ ...filters, specialties: val ? [val] : [] });
          }}
          className={inputClass}
        >
          <option value="">All Specialties</option>
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Ownership */}
      <div>
        <label className={labelClass}>Ownership</label>
        <select
          value={filters.ownership ?? ""}
          onChange={(e) => {
            const val = e.target.value as FilterState["ownership"];
            onChange({ ...filters, ownership: val || null });
          }}
          className={inputClass}
        >
          <option value="">All (Public & Private)</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      {/* Search button */}
      <button
        onClick={() => onSearch()}
        className="w-full bg-brand-700 text-white font-semibold py-2.5
                   rounded-xl hover:bg-brand-800 transition-colors text-sm"
      >
        Search Hospitals
      </button>

      {/* Emergency mode */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-100
                      dark:border-red-800 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-red-700
                           dark:text-red-400">
            Emergency Mode
          </span>
        </div>
        <p className="text-xs text-red-500 dark:text-red-400 mb-2">
          Find nearest emergency hospital quickly
        </p>
        <button
          onClick={() => {
            const next = {
              ...filters,
              specialties: ["emergency" as Specialty],
            };
            onChange(next);
            onSearch();
          }}
          className="w-full bg-red-600 text-white text-xs font-semibold
                     py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Find Now
        </button>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={reset}
          className="text-xs text-gray-500 dark:text-gray-400
                     hover:text-gray-700 dark:hover:text-gray-200
                     transition-colors underline w-full text-center"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}