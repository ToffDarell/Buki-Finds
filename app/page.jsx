'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { BROWSE_STATUSES, CATEGORIES, LISTING_TYPES, LISTING_WITH_IMAGES, cleanSearchText, formatPrice } from '@/lib/listings'
import ListingCard, { ListingCardSkeleton } from '@/app/components/ListingCard'
import SchoolInput from '@/app/components/SchoolInput'
import { CloseIcon, FiltersIcon, PlusIcon, SearchIcon } from '@/app/components/icons'

const fieldClass =
  'w-full rounded-sm border border-line bg-white px-2.5 py-2 text-sm text-ink transition-colors placeholder:text-muted hover:border-muted/60 focus:border-primary focus:outline-none'

const DEFAULT_FILTERS = { listingType: '', category: '', school: '', size: '', minPrice: '', maxPrice: '', sort: 'newest' }

const TYPE_OPTIONS = [['', 'All'], ...Object.entries(LISTING_TYPES)]

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
    // Reserved items stay visible (with a badge) so buyers know they're spoken for.
    .in('status', BROWSE_STATUSES)
    // Swaps have no price, so they go after priced listings when sorting by price.
    .order(sort.column, { ascending: sort.ascending, nullsFirst: false })

  if (filters.listingType) query = query.eq('listing_type', filters.listingType)
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

// One active filter. The whole chip removes it; the x is the visible affordance.
function FilterChip({ label, onRemove }) {
  return (
    <button
      onClick={onRemove}
      className="chip-in group inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full border border-primary/20 bg-primary-soft py-1 pl-3 pr-1.5 text-[13px] font-medium text-primary transition-colors hover:border-primary/50"
      aria-label={`Remove filter ${label}`}
    >
      {label}
      <span className="flex h-5 w-5 items-center justify-center rounded-full transition-colors group-hover:bg-primary/10">
        <CloseIcon className="h-3.5 w-3.5" />
      </span>
    </button>
  )
}

// A blank ID card hanging from its lanyard: the empty state's picture, in the card's own vocabulary.
function BlankIdCard({ searching }) {
  return (
    <svg viewBox="0 0 120 170" className="id-sway h-36 w-auto" aria-hidden="true">
      <path d="M60 0v22" stroke="#00528a" strokeWidth="2" strokeLinecap="round" />
      <rect x="10" y="20" width="100" height="146" rx="8" fill="#fff" stroke="#d6e2ec" strokeWidth="1.5" />
      <path d="M10 28a8 8 0 0 1 8-8h84a8 8 0 0 1 8 8v12H10z" fill="#00528a" />
      <rect x="48" y="24" width="24" height="5" rx="2.5" fill="#fff" />
      <rect x="20" y="48" width="80" height="62" rx="3" fill="#f3f7fa" stroke="#bcd5e8" strokeWidth="1.5" strokeDasharray="4 3" />
      {searching ? (
        <g stroke="#00528a" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <circle cx="57" cy="76" r="9" />
          <path d="m64 83 7 7" />
        </g>
      ) : (
        <path d="M60 70v18M51 79h18" stroke="#00528a" strokeWidth="2.5" strokeLinecap="round" />
      )}
      <rect x="20" y="120" width="34" height="9" rx="2" fill="#e6f0f7" />
      <rect x="20" y="135" width="70" height="5" rx="2" fill="#d6e2ec" />
      <path d="M20 150h80" stroke="#d6e2ec" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  )
}

// Two different situations, two different messages: nothing posted yet, or filters that match nothing.
function EmptyState({ active, onClearAll }) {
  const filtered = active.length > 0
  return (
    <div className="rise-in flex flex-col items-center rounded-[12px] border border-line bg-white px-6 pb-12 pt-8 text-center shadow-card">
      <BlankIdCard searching={filtered} />
      <h2 className="card-type mt-5 text-2xl font-extrabold leading-tight text-ink sm:text-[1.75rem]">
        {filtered ? 'No matches for that.' : 'No listings yet.'}
      </h2>
      {filtered ? (
        <>
          <p className="mt-2 max-w-sm text-sm text-muted">Nothing fits every filter you picked. Remove one to see more:</p>
          <div className="mt-4 flex max-w-md flex-wrap justify-center gap-2">
            {active.map((f) => (
              <FilterChip key={f.key} label={f.label} onRemove={f.clear} />
            ))}
          </div>
          {active.length > 1 && (
            <button
              onClick={onClearAll}
              className="mt-5 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface"
            >
              Clear all filters
            </button>
          )}
        </>
      ) : (
        <>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Be the first to sell or swap something with college students across Bukidnon. It takes about a minute.
          </p>
          <Link
            href="/post"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-[15px] font-semibold text-white shadow-card transition-colors hover:bg-accent-hover"
          >
            <PlusIcon className="h-4 w-4" />
            Post Item
          </Link>
        </>
      )}
    </div>
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

  // Swaps have no price, so picking "For Swap" drops any price range.
  function setListingType(listingType) {
    setFilters((prev) => ({ ...prev, listingType, ...(listingType === 'swap' && { minPrice: '', maxPrice: '' }) }))
  }

  function clearAll() {
    setFilters(DEFAULT_FILTERS)
    setSearchInput('')
    setSchoolInput('')
  }

  // Active filters, restated as chips above the grid; each one can be removed on its own.
  const active = [
    search && { key: 'search', label: `“${search}”`, clear: () => setSearchInput('') },
    filters.listingType && { key: 'type', label: LISTING_TYPES[filters.listingType], clear: () => update('listingType', '') },
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

  // Resets only what the rail owns; search, type, category and sort stay.
  function resetRail() {
    setSchoolInput('')
    setFilters((prev) => ({ ...prev, school: '', size: '', minPrice: '', maxPrice: '' }))
  }
  const count = result.listings.length

  const filterFields = (
    <>
      <FieldBox label="School">
        <SchoolInput
          value={schoolInput}
          onChange={setSchoolInput}
          placeholder="Any school or university"
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

      {filters.listingType !== 'swap' && (
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
      )}
    </>
  )

  // Opening the panel from the stuck top bar may happen far down the feed, so bring the panel into view.
  function toggleFilters() {
    const opening = !showFilters
    setShowFilters(opening)
    if (opening) {
      requestAnimationFrame(() => document.getElementById('filter-panel')?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
    }
  }

  const filtersButton = (
    <button
      onClick={toggleFilters}
      aria-expanded={showFilters}
      aria-controls="filter-panel"
      className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors md:rounded-md md:px-3 ${
        showFilters ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-white text-ink hover:border-muted/60'
      }`}
    >
      <FiltersIcon className="h-4 w-4" />
      Filters
      {railFilterCount > 0 && (
        <span className="tabular flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white">
          {railFilterCount}
        </span>
      )}
    </button>
  )

  const sortSelect = (
    <select
      value={filters.sort}
      onChange={(e) => update('sort', e.target.value)}
      className="rounded-md border border-line bg-white py-2 pl-2.5 pr-7 text-sm text-ink transition-colors hover:border-muted/60 focus:border-primary focus:outline-none"
      aria-label="Sort listings"
    >
      {Object.entries(SORTS).map(([value, { label }]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  )

  return (
    <main className="flex flex-1 flex-col">
      {/* Phones hide the banner (the heading stays for screen readers) so the feed starts sooner. */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:pt-9">
          <h1 className="card-type sr-only text-[2.75rem] font-extrabold leading-[0.95] text-ink md:not-sr-only md:block">
            Find it in your size.
          </h1>
          <p className="mt-2.5 hidden max-w-xl text-[15px] text-muted md:block">
            Uniforms, school shoes, books and more. Buy, sell or swap with college students across Bukidnon.
          </p>
        </div>
      </div>

      {/* Phones: search plus one condensed row stay stuck to the top of the screen while the feed scrolls.
          It has to be a direct child of <main> so it sticks for the whole page, not just the header. */}
      <div className="sticky top-0 z-20 border-b border-line bg-white md:static md:border-b-0">
        <div className="mx-auto max-w-7xl px-4 pb-2.5 pt-3 sm:px-6 md:pb-0 md:pt-5">
          <div className="flex max-w-4xl gap-2.5">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Search uniforms, shoes, books…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-md border border-line bg-surface py-2.5 pl-11 pr-4 text-base text-ink transition-colors placeholder:text-muted hover:border-muted/60 focus:border-primary focus:bg-white focus:outline-none md:bg-white md:py-3 md:shadow-card"
                aria-label="Search listings"
              />
            </div>

            <div role="group" aria-label="Listing type" className="hidden rounded-md border border-line bg-surface p-1 md:flex">
              {TYPE_OPTIONS.map(([value, label]) => {
                const selected = filters.listingType === value
                return (
                  <button
                    key={value || 'all'}
                    onClick={() => setListingType(value)}
                    aria-pressed={selected}
                    className={`whitespace-nowrap rounded-sm px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                      selected ? 'bg-primary text-white shadow-card' : 'text-muted hover:bg-white hover:text-ink'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="-mx-4 mt-2.5 flex items-center gap-2 overflow-x-auto pl-4 pr-10 [mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),transparent)] [scrollbar-width:none] sm:-mx-6 sm:pl-6 md:hidden">
            {filtersButton}
            <span className="h-5 w-px shrink-0 bg-line" aria-hidden="true" />
            <div role="group" aria-label="Listing type" className="flex shrink-0 gap-1.5">
              {TYPE_OPTIONS.map(([value, label]) => {
                const selected = filters.listingType === value
                return (
                  <button
                    key={value || 'all'}
                    onClick={() => setListingType(value)}
                    aria-pressed={selected}
                    className={`min-h-9 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium transition-colors ${
                      selected ? 'border-primary bg-primary text-white' : 'border-line bg-white text-ink'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <div className="shrink-0">{sortSelect}</div>
          </div>
        </div>
      </div>

      <section className="border-b border-line bg-white">
        <nav aria-label="Categories" className="mx-auto max-w-7xl px-4 pt-1 sm:px-6 md:pt-5">
          {/* Below desktop width the tabs fade out at the right edge so it's clear the row scrolls. */}
          <div className="-mx-4 -mb-px flex gap-5 overflow-x-auto pl-4 pr-10 [mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),transparent)] [scrollbar-width:none] sm:-mx-6 sm:pl-6 lg:mx-0 lg:px-0 lg:[mask-image:none]">
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
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-start lg:gap-8">
          {/* Phones: results bar, then the (toggled) filter panel, then the grid. Desktop: rail on the left. */}
          <aside
            id="filter-panel"
            className={`${showFilters ? 'panel-drop block' : 'hidden'} order-2 scroll-mt-32 md:scroll-mt-4 lg:sticky lg:top-4 lg:order-none lg:block lg:w-60 lg:shrink-0`}
            aria-label="Filters"
          >
            <div className="rounded-[10px] border border-line bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                  Filters
                  {railFilterCount > 0 && (
                    <span className="tabular flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white">
                      {railFilterCount}
                    </span>
                  )}
                </span>
                {railFilterCount > 0 && (
                  <button onClick={resetRail} className="text-sm font-medium text-primary underline-offset-2 hover:underline">
                    Reset
                  </button>
                )}
              </div>
              <div className="grid gap-4 p-4 sm:grid-cols-3 lg:grid-cols-1">{filterFields}</div>
            </div>
          </aside>

          <section className="contents lg:block lg:min-w-0 lg:flex-1" aria-label="Listings">
            <div className="order-1">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Phones have Filters and sort in the stuck top bar; tablets get them here; desktop has the rail. */}
                <div className="hidden md:block lg:hidden">{filtersButton}</div>
                <p className="text-sm text-muted" aria-live="polite">
                  {loading ? (
                    'Finding listings…'
                  ) : (
                    <>
                      <span className="tabular font-semibold text-ink">{count}</span> {count === 1 ? 'item' : 'items'}
                    </>
                  )}
                </p>
                <div className="ml-auto hidden items-center gap-2 md:flex">
                  <span className="hidden whitespace-nowrap text-sm text-muted lg:inline">Sort by</span>
                  {sortSelect}
                </div>
              </div>

              {active.length > 0 && (
                <div className="-mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
                  {active.map((f) => (
                    <FilterChip key={f.key} label={f.label} onRemove={f.clear} />
                  ))}
                  {active.length > 1 && (
                    <button onClick={clearAll} className="shrink-0 px-1 text-sm font-medium text-primary underline-offset-2 hover:underline">
                      Clear all
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="order-3 lg:mt-5">
              {result.error && (
                <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  Couldn’t load listings: {result.error}. Check your connection and refresh.
                </div>
              )}

              {!loading && !result.error && count === 0 && <EmptyState active={active} onClearAll={clearAll} />}

              <div
                className={`grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-x-4 md:gap-y-6 lg:grid-cols-4 ${loading && count > 0 ? 'opacity-60 transition-opacity duration-300' : ''}`}
                aria-busy={loading}
              >
                {loading && count === 0 && !result.error
                  ? Array.from({ length: 8 }, (_, i) => <ListingCardSkeleton key={i} index={i} />)
                  : result.listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
