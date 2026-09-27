'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  BROWSE_STATUSES,
  CATEGORIES,
  CONDITIONS,
  LISTING_TYPES,
  LISTING_WITH_IMAGES,
  cleanSearchText,
  formatPrice,
  formatSize,
} from '@/lib/listings'
import ListingCard, { ListingCardSkeleton } from '@/app/components/ListingCard'
import SchoolInput from '@/app/components/SchoolInput'
import { matchSchools, schoolConditions } from '@/lib/schools'
import { CloseIcon, FiltersIcon, PlusIcon, SearchIcon } from '@/app/components/icons'

const DEFAULT_FILTERS = {
  listingType: '',
  category: '',
  school: '',
  size: '',
  condition: '',
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
}

const TYPE_OPTIONS = [
  ['', 'All Items'],
  ['sell', 'For Sale'],
  ['swap', 'For Swap'],
]

const SORTS = {
  newest: { label: 'Newest first', column: 'created_at', ascending: false },
  'price-asc': { label: 'Price: low to high', column: 'price', ascending: true },
  'price-desc': { label: 'Price: high to low', column: 'price', ascending: false },
}

const POPULAR_SCHOOLS = ['BukSU', 'CMU', 'San Isidro', 'STI']

const PRICE_PRESETS = [
  { label: 'Under ₱150', min: '', max: '150' },
  { label: '₱150–₱500', min: '150', max: '500' },
  { label: '₱500–₱1,000', min: '500', max: '1000' },
  { label: '₱1,000+', min: '1000', max: '' },
]

function fetchListings(filters, search) {
  const sort = SORTS[filters.sort] || SORTS.newest
  let query = supabase
    .from('listings')
    .select(LISTING_WITH_IMAGES)
    .in('status', BROWSE_STATUSES)
    .order(sort.column, { ascending: sort.ascending, nullsFirst: false })

  if (filters.listingType) query = query.eq('listing_type', filters.listingType)
  if (filters.category) query = query.eq('category', filters.category)
  // "CMU" and "Central Mindanao University" find each other (see lib/schools.js).
  if (filters.school) query = query.or(schoolConditions(filters.school).join(','))
  // ilike ignores capitals, so the "L" chip also finds listings typed as "l".
  if (filters.size) query = query.ilike('size', filters.size.replace(/[\\%_]/g, '\\$&'))
  if (filters.condition) query = query.eq('condition', filters.condition)
  if (filters.minPrice !== '') query = query.gte('price', Number(filters.minPrice))
  if (filters.maxPrice !== '') query = query.lte('price', Number(filters.maxPrice))
  if (search) {
    // Searching a school's name or acronym also finds listings from that school.
    const conditions = [`title.ilike.%${search}%`, `description.ilike.%${search}%`]
    if (matchSchools(search).length) conditions.push(...schoolConditions(search))
    query = query.or(conditions.join(','))
  }

  return query
}

function priceLabel(min, max) {
  if (min !== '' && max !== '') return `${formatPrice(min)}–${formatPrice(max)}`
  if (min !== '') return `${formatPrice(min)}+`
  return `Up to ${formatPrice(max)}`
}

function FilterChip({ label, onRemove }) {
  return (
    <button
      onClick={onRemove}
      className="group inline-flex min-h-7 shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft/70 px-2.5 py-1 text-xs font-medium text-primary transition-all hover:border-primary/50 hover:bg-primary-soft"
      aria-label={`Remove filter ${label}`}
    >
      <span>{label}</span>
      <span className="flex h-4 w-4 items-center justify-center rounded-full transition-colors group-hover:bg-primary/10">
        <CloseIcon className="h-3 w-3" />
      </span>
    </button>
  )
}

function EmptyState({ active, onClearAll }) {
  const filtered = active.length > 0
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white p-8 text-center shadow-xs sm:p-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-primary">
        <SearchIcon className="h-8 w-8 text-primary/70" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-ink sm:text-2xl">
        {filtered ? 'No listings found' : 'No listings yet'}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        {filtered
          ? 'No items match your active filters. Try adjusting your criteria or clearing some filters.'
          : 'Be the first to list uniforms, books, or essentials for college students across Bukidnon.'}
      </p>

      {filtered ? (
        <div className="mt-6 flex flex-col items-center gap-3">
          {active.length > 0 && (
            <div className="flex max-w-md flex-wrap justify-center gap-2">
              {active.map((f) => (
                <FilterChip key={f.key} label={f.label} onRemove={f.clear} />
              ))}
            </div>
          )}
          <button
            onClick={onClearAll}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary-hover"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <Link
          href="/post"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-accent-hover"
        >
          <PlusIcon className="h-4 w-4" />
          Post Item
        </Link>
      )}
    </div>
  )
}

export default function BrowsePage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [schoolInput, setSchoolInput] = useState('')
  const [sizes, setSizes] = useState([])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [result, setResult] = useState({ key: null, listings: [], error: '' })

  const requestKey = JSON.stringify({ filters, search })
  const loading = result.key !== requestKey

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(cleanSearchText(searchInput)), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Debounce school free-text input
  useEffect(() => {
    const timer = setTimeout(() => {
      const school = cleanSearchText(schoolInput)
      setFilters((prev) => (prev.school === school ? prev : { ...prev, school }))
    }, 300)
    return () => clearTimeout(timer)
  }, [schoolInput])

  // Fetch listings
  useEffect(() => {
    let cancelled = false
    fetchListings(filters, search).then(({ data, error }) => {
      if (!cancelled) {
        setResult({ key: requestKey, listings: data ?? [], error: error?.message ?? '' })
      }
    })
    return () => {
      cancelled = true
    }
  }, [filters, search, requestKey])

  // Fetch available sizes from existing listings
  useEffect(() => {
    supabase
      .from('listings')
      .select('size')
      .eq('status', 'available')
      .not('size', 'is', null)
      .then(({ data }) => {
        const unique = [...new Set((data ?? []).map((row) => formatSize(row.size)).filter(Boolean))]
        setSizes(unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })))
      })
  }, [])

  function update(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  function setListingType(listingType) {
    setFilters((prev) => ({
      ...prev,
      listingType,
      ...(listingType === 'swap' && { minPrice: '', maxPrice: '' }),
    }))
  }

  function clearAll() {
    setFilters(DEFAULT_FILTERS)
    setSearchInput('')
    setSchoolInput('')
  }

  function selectPopularSchool(name) {
    if (filters.school.toLowerCase() === name.toLowerCase()) {
      setSchoolInput('')
      update('school', '')
    } else {
      setSchoolInput(name)
      update('school', name)
    }
  }

  function togglePricePreset(preset) {
    if (filters.minPrice === preset.min && filters.maxPrice === preset.max) {
      setFilters((prev) => ({ ...prev, minPrice: '', maxPrice: '' }))
    } else {
      setFilters((prev) => ({ ...prev, minPrice: preset.min, maxPrice: preset.max }))
    }
  }

  function toggleSize(s) {
    update('size', filters.size === s ? '' : s)
  }

  function toggleCondition(c) {
    update('condition', filters.condition === c ? '' : c)
  }

  // Active filter pills
  const active = [
    search && { key: 'search', label: `“${search}”`, clear: () => setSearchInput('') },
    filters.listingType && {
      key: 'type',
      label: LISTING_TYPES[filters.listingType] || filters.listingType,
      clear: () => update('listingType', ''),
    },
    filters.category && { key: 'category', label: filters.category, clear: () => update('category', '') },
    filters.school && {
      key: 'school',
      label: `School: ${filters.school}`,
      clear: () => {
        setSchoolInput('')
        update('school', '')
      },
    },
    filters.size && { key: 'size', label: `Size ${filters.size}`, clear: () => update('size', '') },
    filters.condition && { key: 'condition', label: filters.condition, clear: () => update('condition', '') },
    (filters.minPrice !== '' || filters.maxPrice !== '') && {
      key: 'price',
      label: priceLabel(filters.minPrice, filters.maxPrice),
      clear: () => setFilters((prev) => ({ ...prev, minPrice: '', maxPrice: '' })),
    },
  ].filter(Boolean)

  const activeFilterCount = [
    'school',
    'size',
    'condition',
    'minPrice',
    'maxPrice',
  ].filter((k) => filters[k] !== '').length

  function resetSidebarFilters() {
    setSchoolInput('')
    setFilters((prev) => ({
      ...prev,
      school: '',
      size: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
    }))
  }

  const count = result.listings.length

  // Filter components reusable in sidebar and mobile drawer
  const filterControls = (
    <div className="flex flex-col gap-6">
      {/* School Filter */}
      <div>
        <div className="flex items-center justify-between pb-2">
          <label htmlFor="school-filter" className="text-sm font-semibold text-ink">
            School / University
          </label>
          {filters.school && (
            <button
              onClick={() => {
                setSchoolInput('')
                update('school', '')
              }}
              className="text-xs font-medium text-primary hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <SchoolInput
          id="school-filter"
          value={schoolInput}
          onChange={setSchoolInput}
          placeholder="e.g. BukSU, CMU, STI..."
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink transition-colors placeholder:text-muted focus:border-primary focus:bg-white focus:outline-none"
        />

        {/* Quick popular school tags */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {POPULAR_SCHOOLS.map((schoolName) => {
            const isSelected = filters.school.toLowerCase() === schoolName.toLowerCase()
            return (
              <button
                key={schoolName}
                type="button"
                onClick={() => selectPopularSchool(schoolName)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'border border-primary/40 bg-primary-soft text-primary'
                    : 'border border-line bg-white text-muted hover:border-primary/40 hover:text-ink'
                }`}
              >
                {schoolName}
              </button>
            )
          })}
        </div>
      </div>

      {/* Price Range Filter (Only when not Swap) */}
      {filters.listingType !== 'swap' && (
        <div className="border-t border-line/60 pt-5">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-semibold text-ink">Price Range (₱)</span>
            {(filters.minPrice !== '' || filters.maxPrice !== '') && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, minPrice: '', maxPrice: '' }))}
                className="text-xs font-medium text-primary hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
                ₱
              </span>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => update('minPrice', e.target.value)}
                className="w-full rounded-xl border border-line bg-surface py-2 pl-7 pr-2.5 text-sm tabular text-ink transition-colors placeholder:text-muted focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>
            <span className="text-muted">–</span>
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
                ₱
              </span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => update('maxPrice', e.target.value)}
                className="w-full rounded-xl border border-line bg-surface py-2 pl-7 pr-2.5 text-sm tabular text-ink transition-colors placeholder:text-muted focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Price Presets */}
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            {PRICE_PRESETS.map((preset) => {
              const isSelected = filters.minPrice === preset.min && filters.maxPrice === preset.max
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => togglePricePreset(preset)}
                  className={`rounded-lg py-1 px-2 text-center text-xs font-medium transition-colors ${
                    isSelected
                      ? 'border border-primary/40 bg-primary-soft text-primary'
                      : 'border border-line bg-white text-muted hover:border-primary/40 hover:text-ink'
                  }`}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Size Filter */}
      {sizes.length > 0 && (
        <div className="border-t border-line/60 pt-5">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-semibold text-ink">Size</span>
            {filters.size && (
              <button onClick={() => update('size', '')} className="text-xs font-medium text-primary hover:underline">
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => {
              const isSelected = filters.size === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'border border-primary/40 bg-primary-soft text-primary'
                      : 'border border-line bg-white text-muted hover:border-primary/40 hover:text-ink'
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Condition Filter */}
      <div className="border-t border-line/60 pt-5">
        <div className="flex items-center justify-between pb-2">
          <span className="text-sm font-semibold text-ink">Condition</span>
          {filters.condition && (
            <button onClick={() => update('condition', '')} className="text-xs font-medium text-primary hover:underline">
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CONDITIONS.map((c) => {
            const isSelected = filters.condition === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCondition(c)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'border border-primary/40 bg-primary-soft text-primary'
                    : 'border border-line bg-white text-muted hover:border-primary/40 hover:text-ink'
                }`}
              >
                {c}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero & Search Header */}
      <section className="border-b border-line bg-white pb-6 pt-5 sm:pb-8 sm:pt-7">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* No eyebrow label and no second Post button: the heading speaks for itself, and
              Post Item already lives in the navbar (desktop) and the tab bar (phones). */}
          {/* "Student-to-student marketplace" opens the description instead of sitting in a label
              above the heading. */}
          <div>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl">
              Good finds. <span className="text-accent">Greater impact.</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              A student-to-student marketplace for Bukidnon. Buy affordable pre-loved school essentials, sell what you no
              longer need, or swap with fellow students.
            </p>
          </div>

          {/* Search bar & Type toggle */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Search uniforms, school shoes, books, calculators…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface py-2.5 pl-11 pr-10 text-sm text-ink transition-colors placeholder:text-muted focus:border-primary focus:bg-white focus:outline-none sm:py-3 sm:text-base"
                aria-label="Search listings"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:bg-line/40 hover:text-ink"
                  aria-label="Clear search"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Listing Type Switcher (All / Sale / Swap) */}
            <div
              role="group"
              aria-label="Listing type"
              className="flex shrink-0 rounded-xl border border-line bg-surface p-1"
            >
              {TYPE_OPTIONS.map(([value, label]) => {
                const selected = filters.listingType === value
                return (
                  <button
                    key={value || 'all'}
                    onClick={() => setListingType(value)}
                    aria-pressed={selected}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                      selected
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Category Navigation Bar */}
      <section className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            {['', ...CATEGORIES].map((category) => {
              const selected = filters.category === category
              return (
                <button
                  key={category || 'all'}
                  onClick={() => update('category', category)}
                  aria-pressed={selected}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all sm:text-sm ${
                    selected
                      ? 'bg-primary text-white shadow-xs'
                      : 'border border-line bg-white text-muted hover:border-primary/40 hover:text-ink'
                  }`}
                >
                  {category || 'All Categories'}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="flex-1 bg-surface py-5 sm:py-7">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Subheader Toolbar: Filters toggle, Active count, Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <div className="flex items-center gap-2.5">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors lg:hidden ${
                  activeFilterCount > 0
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-line bg-white text-ink hover:border-muted/60'
                }`}
              >
                <FiltersIcon className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Desktop: only offered while the panel is hidden; the open panel has its own Hide link. */}
              <button
                onClick={() => setShowDesktopFilters(true)}
                className={`hidden items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-muted/60 ${
                  showDesktopFilters ? '' : 'lg:inline-flex'
                }`}
              >
                <FiltersIcon className="h-4 w-4" />
                Show Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Result Count Indicator */}
              <p className="text-xs text-muted sm:text-sm" aria-live="polite">
                {loading ? (
'Finding listings…'
                ) : (
                  <>
                    <span className="tabular font-bold text-ink">{count}</span> {count === 1 ? 'item' : 'items'} available
                  </>
                )}
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-medium text-muted sm:inline">Sort:</span>
              <select
                value={filters.sort}
                onChange={(e) => update('sort', e.target.value)}
                className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-muted/60 focus:border-primary focus:outline-none sm:text-sm"
                aria-label="Sort listings"
              >
                {Object.entries(SORTS).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {active.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-5">
              <span className="text-xs font-medium text-muted">Active:</span>
              {active.map((f) => (
                <FilterChip key={f.key} label={f.label} onRemove={f.clear} />
              ))}
              {active.length > 1 && (
                <button
                  onClick={clearAll}
                  className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Grid Layout with Sidebar */}
          <div className="flex items-start gap-6 lg:gap-8">
            {/* Desktop Sticky Sidebar */}
            {showDesktopFilters && (
              <aside className="hidden w-64 shrink-0 lg:sticky lg:top-20 lg:block" aria-label="Filters">
                <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-line pb-3.5">
                    <span className="flex items-center gap-2 text-sm font-bold text-ink">
                      <FiltersIcon className="h-4 w-4 text-primary" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                          {activeFilterCount}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-3">
                      {activeFilterCount > 0 && (
                        <button onClick={resetSidebarFilters} className="text-xs font-semibold text-primary hover:underline">
                          Reset
                        </button>
                      )}
                      <button onClick={() => setShowDesktopFilters(false)} className="text-xs font-medium text-muted hover:text-ink hover:underline">
                        Hide
                      </button>
                    </span>
                  </div>

                  <div className="pt-4">{filterControls}</div>
                </div>
              </aside>
            )}

            {/* Listings Grid Section */}
            <section className="min-w-0 flex-1" aria-label="Listings Grid">
              {result.error && (
                <div
                  role="alert"
                  className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                  Unable to load listings ({result.error}). Please check your connection and try again.
                </div>
              )}

              {!loading && !result.error && count === 0 && (
                <EmptyState active={active} onClearAll={clearAll} />
              )}

              <div
                className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 ${
                  showDesktopFilters ? 'xl:grid-cols-3' : 'xl:grid-cols-4'
                } ${loading && count > 0 ? 'opacity-60 transition-opacity' : ''}`}
                aria-busy={loading}
              >
                {loading && count === 0 && !result.error
                  ? Array.from({ length: 8 }, (_, i) => <ListingCardSkeleton key={i} index={i} />)
                  : result.listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer / Slide-over Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-2">
                <FiltersIcon className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold text-ink">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-ink"
                aria-label="Close filters"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">{filterControls}</div>

            <div className="flex items-center gap-3 border-t border-line bg-surface p-4">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetSidebarFilters}
                  className="rounded-xl border border-line bg-white px-4 py-3 text-xs font-semibold text-ink hover:bg-surface"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white shadow-xs hover:bg-primary-hover"
              >
                Show {count} {count === 1 ? 'result' : 'results'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
