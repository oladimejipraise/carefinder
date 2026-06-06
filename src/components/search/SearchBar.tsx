'use client'

import { useRef } from 'react'

interface SearchBarProps {
  defaultValue?: string
  onSearch: (query: string) => void
  onChange?: (query: string) => void
  placeholder?: string
}

export default function SearchBar({
  defaultValue = '',
  onSearch,
  onChange,
  placeholder = 'Search by name, city, or LGA...',
}: SearchBarProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const valueRef = useRef(defaultValue)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    valueRef.current = value

    onChange?.(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSearch(value), 300)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      onSearch(e.currentTarget.value)
    }
  }

  return (
    <div role="search" className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center
                      pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="search"
        defaultValue={defaultValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search hospitals"
        className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2
                   text-sm focus:outline-none focus:ring-2
                   focus:ring-brand-700 focus:border-transparent
                   placeholder:text-gray-300"
      />
    </div>
  )
}