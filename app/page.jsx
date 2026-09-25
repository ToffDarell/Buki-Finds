'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { CATEGORIES, LISTING_WITH_IMAGES, cleanSearchText, formatPrice } from '@/lib/listings'
import ListingCard, { ListingCardSkeleton } from '@/app/components/ListingCard'
import SchoolInput from '@/app/components/SchoolInput'
import { CloseIcon, FiltersIcon, SearchIcon } from '@/app/components/icons'

const fieldClass =
  'w-full rounded-sm border border-line bg-white px-2.5 py-2 text-sm text-ink transition-colors placeholder:text-muted hover:border-muted/60 focus:border-primary focus:outline-none'

const DEFAULT_FILTERS = { category: '', school: '', size: '', minPrice: '', maxPrice: '', sort: 'newest' }

const SORTS = {
  newest: { label: 'Newest first', column: 'created_at', ascending: false },
  'price-asc': { label: 'Price: low to high', column: 'price', ascending: true },
  'price-desc': { label: 'Price: high to low', column: 'price', ascending: false },
}

function fetchListings(filters, search) {
  const sort = SORTS[filters.sort]
  let query = supabase
    .from('listings')
    .select(LISTING_WITH_IMAGES)
    .eq('status', 'available')
    .order(sort.column, { ascending: sort.ascending })

  if (filters.category) query = query.eq('category', filters.category)
  // Partial, case-insensitive match: "nurs" finds any school with "Nursing" in its name.
  if (filters.school) query = query.ilike('school', `%${filters.school}%`)
  if (filters.size) query = query.eq('size', filters.size)
  if (filters.minPrice !== '') query = query.gte('price', Number(filters.minPrice))
  if (filters.maxPrice !== '') query = query.lte('price', Number(filters.maxPrice))
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

  return query
}

function FieldBox({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  )
}

function priceLabel(min, max) {
  if (min !== '' && max !== '') return `${formatPrice(min)}–${formatPrice(max)}`
  if (min !== '') return `${formatPrice(min)} and up`
  return `Up to ${formatPrice(max)}`
}

export default function BrowsePage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [schoolInput, setSchoolInput] = useState('')
  const [sizes, setSizes] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [result, setResult] = useState({ key: null, listings: [], error: '' })

  const requestKey = JSON.stringify({ filters, search })
  const loading = result.key !== requestKey

  // Debounce the search box so we don't query on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(cleanSearchText(searchInput)), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Same for the free-text school filter.
  useEffect(() => {
    const timer = setTimeout(() => {
      const school = cleanSearchText(schoolInput)
      setFilters((prev) => (prev.school === school ? prev : { ...prev, school }))
    }, 300)
    return () => clearTimeout(timer)
  }, [schoolInput])

  useEffect(() => {
    let cancelled = false
    fetchListings(filters, search).then(({ data, error }) => {
      if (!cancelled) setResult({ key: requestKey, listings: data ?? [], error: error?.message ?? '' })
    })
    return () => {
      cancelled = true
    }
  }, [filters, search, requestKey])

  // Size options come from what sellers actually entered.
  useEffect(() => {
    supabase
      .from('listings')
      .select('size')
      .eq('status', 'available')
      .not('size', 'is', null)
      .then(({ data }) => {
        const unique = [...new Set((data ?? []).map((row) => row.size.trim()).filter(Boolean))]
        setSizes(unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })))
      })
  }, [])

  function update(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  function clearAll() {
    setFilters(DEFAULT_FILTERS)
    setSearchInput('')
    setSchoolInput('')
  }

  // Active filters, restated in the "Showing" line; each one can be removed on its own.
  const active = [
    search && { key: 'search', label: `“${search}”`, clear: () => setSearchInput('') },
    filters.category && { key: 'category', label: filters.category, clear: () => update('category', '') },
    filters.size && { key: 'size', label: `Size ${filters.size}`, clear: () => update('size', '') },
    filters.school && {
      key: 'school',
      label: `School: ${filters.school}`,
      clear: () => {
        setSchoolInput('')
        update('school', '')
      },
    },
    (filters.minPrice !== '' || filters.maxPrice !== '') && {
      key: 'price',
      label: priceLabel(filters.minPrice, filters.maxPrice),
      clear: () => setFilters((prev) => ({ ...prev, minPrice: '', maxPrice: '' })),
    },
  ].filter(Boolean)
  const railFilterCount = ['school', 'size', 'minPrice', 'maxPrice'].filter((k) => filters[k] !== '').length
  const count = result.listings.length

  const filterFields = (
    <>
      <FieldBox label="School">
        <SchoolInput
          value={schoolInput}
          onChange={setSchoolInput}
          placeholder="Any school, e.g. Bukidnon State"
          className={fieldClass}
        />
      </FieldBox>

      <FieldBox label="Size">
        <select value={filters.size} onChange={(e) => update('size', e.target.value)} className={fieldClass}>
          <option value="">Any size</option>
          {sizes.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </FieldBox>

      <FieldBox label="Price (₱)">
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            inputMode="decimal"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => update('minPrice', e.target.value)}
            className={`${fieldClass} tabular`}
            aria-label="Minimum price"
          />
          <span className="text-muted" aria-hidden="true">–</span>
          <input
            type="number"
            min="0"
            inputMode="decimal"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => update('maxPrice', e.target.value)}
            className={`${fieldClass} tabular`}
            aria-label="Maximum price"
          />
        </div>
      </FieldBox>
    </>
  )

  const sortSelect = (
    <select
      value={filters.sort}
      onChange={(e) => update('sort', e.target.value)}
      className="rounded-sm border border-line bg-white py-2 pl-2.5 pr-8 text-sm text-ink transition-colors hover:border-muted/60 focus:border-primary focus:outline-none"
      aria-label="Sort listings"
    >
      {Object.entries(SORTS).map(([value, { label }]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  )

  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-4 pt-6 sm:px-6 sm:pt-8">
          <h1 className="card-type text-3xl font-bold leading-none text-ink sm:text-4xl">Find it in your size.</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Uniforms, school shoes, books and more, from students across Bukidnon.
          </p>

          <div className="relative mt-5 max-w-3xl">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search e.g. nursing uniform, black shoes, calculus book"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-md border border-line bg-white py-3 pl-11 pr-4 text-base text-ink shadow-card placeholder:text-muted focus:border-primary focus:outline-none"
              aria-label="Search listings"
            />
          </div>

          <div className="mt-3 flex min-h-8 flex-wrap items-center gap-x-2 gap-y-1.5 text-sm" aria-live="polite">
            <span className="text-muted">
              {loading ? 'Searching…' : `Showing ${count} ${count === 1 ? 'item' : 'items'}`}
            </span>
            {active.map((f) => (
              <button
                key={f.key}
                onClick={f.clear}
                className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary-soft py-0.5 pl-2.5 pr-1.5 text-sm font-medium text-primary transition-colors hover:border-primary/50"
                aria-label={`Remove filter ${f.label}`}
              >
                {f.label}
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            ))}
            {active.length > 1 && (
              <button onClick={clearAll} className="text-sm font-medium text-primary underline-offset-2 hover:underline">
                Clear all
              </button>
            )}
          </div>
        </div>

        <nav aria-label="Categories" className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="-mx-4 -mb-px flex gap-5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
            {['', ...CATEGORIES].map((c) => {
              const selected = filters.category === c
              return (
                <button
                  key={c || 'all'}
                  onClick={() => update('category', c)}
                  aria-pressed={selected}
                  className={`shrink-0 border-b-[3px] pb-2.5 pt-1 text-sm font-medium transition-colors ${
                    selected ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {c || 'All'}
                </button>
              )
            })}
          </div>
        </nav>
      </section>

      <div className="flex-1 bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8">
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            className="inline-flex items-center gap-2 rounded-sm border border-line bg-white px-3 py-2 text-sm font-medium text-ink"
          >
            <FiltersIcon className="h-4 w-4" />
            Filters{railFilterCount > 0 && ` (${railFilterCount})`}
          </button>
          <div className="ml-auto">{sortSelect}</div>
        </div>

        <aside
          id="filter-panel"
          className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-56 lg:shrink-0`}
          aria-label="Filters"
        >
          <div className="overflow-hidden rounded-[8px] border border-line bg-white shadow-card lg:sticky lg:top-4">
            <div className="flex items-center justify-between bg-primary px-3.5 py-2">
              <span className="text-sm font-semibold text-white">Filters</span>
              {railFilterCount > 0 && (
                <button
                  onClick={() => {
                    setSchoolInput('')
                    setFilters((prev) => ({ ...DEFAULT_FILTERS, category: prev.category, sort: prev.sort }))
                  }}
                  className="text-xs font-medium text-on-primary-muted hover:text-white"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="grid gap-4 p-3.5 sm:grid-cols-3 lg:grid-cols-1">{filterFields}</div>
          </div>
        </aside>

        <section className="min-w-0 flex-1" aria-label="Listings">
          <div className="mb-4 hidden items-center justify-end gap-2 lg:flex">
            <span className="whitespace-nowrap text-sm text-muted">Sort by</span>
            {sortSelect}
          </div>

          {result.error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Couldn’t load listings: {result.error}. Check your connection and refresh.
            </div>
          )}

          {!loading && !result.error && count === 0 && (
            <div className="flex flex-col items-center rounded-[10px] border border-dashed border-line px-6 py-14 text-center">
              <p className="card-type text-2xl font-bold text-ink">Nothing here yet.</p>
              <p className="mt-1 max-w-sm text-sm text-muted">
                {active.length > 0
                  ? 'No listings match these filters. Try another size or school, or widen the price range.'
                  : 'Be the first to sell something to your fellow students.'}
              </p>
              {active.length > 0 ? (
                <button onClick={clearAll} className="mt-4 text-sm font-semibold text-primary hover:underline">
                  Clear all filters
                </button>
              ) : (
                <Link href="/post" className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
                  Post Item
                </Link>
              )}
            </div>
          )}

          <div
            className={`grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 ${loading && count > 0 ? 'opacity-60 transition-opacity' : ''}`}
            aria-busy={loading}
          >
            {loading && count === 0 && !result.error
              ? Array.from({ length: 8 }, (_, i) => <ListingCardSkeleton key={i} />)
              : result.listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        </section>
      </div>
      </div>
    </main>
  )
}
