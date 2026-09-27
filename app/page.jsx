import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { BROWSE_STATUSES, LISTING_WITH_IMAGES, coverImage } from '@/lib/listings'
import { BUKIDNON_SCHOOLS } from '@/lib/schools'
import { FREE_ACTIVE_LISTINGS, PAYMENT_METHODS, SUBSCRIPTION_PRICE } from '@/lib/subscription'
import LandingRack from '@/app/components/LandingRack'
import {
  BrowseIcon,
  CheckIcon,
  ChevronRightIcon,
  InstagramIcon,
  MailIcon,
  MessengerIcon,
  PlusIcon,
  SearchIcon,
} from '@/app/components/icons'

// The rack shows the newest real listings (refreshed every 5 minutes) and fills the rest of
// its five hooks with labeled samples, so the page never looks empty or pretends.
export const revalidate = 300

const RACK_SIZE = 5
const SAMPLES = [
  { id: 'sample-uniform', sample: true, title: 'PE uniform set, shirt and jogging pants', category: 'Uniforms', price: 350, size: 'M', school: 'Bukidnon State University', listing_type: 'sell' },
  { id: 'sample-book', sample: true, title: 'Calculus 1 textbook, 3rd edition', category: 'Books', listing_type: 'swap', swap_for: 'Physics 1 book', school: 'Central Mindanao University' },
  { id: 'sample-service', sample: true, title: 'Thesis layout and printing help', category: 'Services', price: 150, school: 'STI College Valencia', listing_type: 'sell' },
  { id: 'sample-shoes', sample: true, title: 'Black leather school shoes', category: 'School Shoes', price: 400, size: '8', school: 'San Isidro College', listing_type: 'sell' },
  { id: 'sample-food', sample: true, title: 'Homemade polvoron, 10 pieces', category: 'Food', price: 60, school: 'Mountain View College', listing_type: 'sell' },
]

async function rackListings() {
  const { data } = await supabase
    .from('listings')
    .select(LISTING_WITH_IMAGES)
    .in('status', BROWSE_STATUSES)
    .order('created_at', { ascending: false })
    .limit(12)
  const real = (data ?? []).filter((l) => coverImage(l)).slice(0, RACK_SIZE)
  return [...real, ...SAMPLES].slice(0, RACK_SIZE)
}

const USES = [
  {
    title: 'Clear out what you’ve outgrown',
    body: 'Last year’s uniform, shoes that no longer fit, books from a finished subject. Someone a year behind you needs them.',
    link: ['Browse uniforms', '/browse?category=Uniforms'],
  },
  {
    title: 'Run a small shop',
    body: 'Resell thrifted clothes, sell homemade snacks, take pre-orders. Put up as many items as you want with the ₱20 pass.',
    link: ['Browse food', '/browse?category=Food'],
  },
  {
    title: 'Offer a service',
    body: 'Tutoring, printing, thesis layout, phone repairs, haircuts in the dorm. List it like any item and set your rate.',
    link: ['Browse services', '/browse?category=Services'],
  },
  {
    title: 'Swap instead of paying',
    body: 'Mark a listing For Swap and say what you want in return: a size up, a different book, anything you both agree on.',
    link: ['See swaps', '/browse'],
  },
]

const LINK_EXAMPLES = [
  { pasted: 'facebook.com/share/1LmyGgyssq/', from: 'Facebook app, Copy link', icon: MessengerIcon, button: 'Message Seller on Messenger' },
  { pasted: 'm.me/juan.delacruz?hash=AbaV…', from: 'Messenger, Share profile', icon: MessengerIcon, button: 'Message Seller on Messenger' },
  { pasted: 'instagram.com/juan.delacruz?igsh=…', from: 'Instagram, Copy profile URL', icon: InstagramIcon, button: 'Message on Instagram' },
]

const STEPS = [
  { title: 'Sign up', body: 'Use your email or Google. Anyone can browse without an account, but you need to log in to contact a seller or post an item.' },
  { title: 'Browse or post', body: 'Filter by university/college, size, category and price. Posting takes a few photos and a price.' },
  { title: 'Message and meet', body: 'Tap Message Seller, agree on a spot at university, hand it over. Mark it as sold when it’s gone.' },
  {
    title: 'Get reviewed',
    body: 'After you mark an item sold, send the buyer your review link. Their star rating shows on your seller profile, so every sale helps the next buyer trust you.',
  },
]

const CREDITS = [
  { name: 'Atheo Jessar R. Caliao', role: 'Front-end developer', email: 'ajtheo176@gmail.com' },
  { name: 'Toff Darell B. Vergara', role: 'Full-stack developer', email: 'topedarell13@gmail.com' },
]

const wrap = 'mx-auto w-full max-w-7xl px-4 sm:px-6'
const btnPrimary =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 text-[15px] font-semibold text-white shadow-card transition-colors hover:bg-primary-hover'
const btnPost =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-accent px-5 text-[15px] font-semibold text-white shadow-card transition-colors hover:bg-accent-hover'

export default async function LandingPage() {
  const rack = await rackListings()
  const schools = BUKIDNON_SCHOOLS.filter((s) => s.town)
  const payments = PAYMENT_METHODS.map((m) => m.label).join(' or ')

  return (
    <main className="flex-1 bg-white text-ink">
      {/* First viewport: the promise, both actions, and the rack of cards that proves it. */}
      <section className="overflow-hidden border-b border-line bg-surface">
        <div className={`${wrap} pb-8 pt-10 sm:pt-14 lg:pb-12`}>
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16">
            <div>
              <h1 className="card-type max-w-[14ch] text-[2.75rem] font-extrabold leading-[0.95] text-ink sm:text-6xl lg:text-7xl">
                Buy, sell and swap with students across Bukidnon.
              </h1>
            </div>
            <div className="lg:pb-2">
              <p className="max-w-[46ch] text-base leading-relaxed text-muted sm:text-lg">
                Uniforms, shoes, books, gadgets, homemade snacks and student services, listed by students near
                your campus. Message the seller on Messenger or Instagram and meet up at university.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <Link href="/browse" className={btnPrimary}>
                  <BrowseIcon className="h-5 w-5" />
                  Browse Listings
                </Link>
                <Link href="/post" className={btnPost}>
                  <PlusIcon className="h-5 w-5" strokeWidth="2.25" />
                  Post Item
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 sm:mt-12">
            <LandingRack listings={rack} />
          </div>

          {/* The old checkmark row, rewritten as ID-card fields: label over value. */}
          <dl className="mt-8 grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-3">
            {[
              ['Browsing', 'Free, no account needed'],
              ['Posting', `${FREE_ACTIVE_LISTINGS} free listings, or unlimited for ₱${SUBSCRIPTION_PRICE}`],
              ['Contacting sellers', 'Log in, then message on Messenger or Instagram'],
            ].map(([label, value]) => (
              <div key={label} className="bg-white px-4 py-3">
                <dt className="text-xs font-medium text-muted">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* What you can do: a ruled list, not a grid of icon cards. */}
      <section className="py-16 sm:py-24">
        <div className={`${wrap} grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16`}>
          <div>
            <h2 className="card-type max-w-[16ch] text-3xl font-extrabold leading-tight sm:text-4xl">
              Not just uniforms and books.
            </h2>
            <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-muted">
              If a student in Bukidnon would pay for it, trade for it, or book it, it can go on BukiMart.
            </p>
          </div>
          <ul className="divide-y divide-dashed divide-line border-y border-line">
            {USES.map((use) => (
              <li key={use.title} className="grid gap-2 py-6 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8">
                <div>
                  <h3 className="text-lg font-bold text-ink">{use.title}</h3>
                  <p className="mt-1.5 max-w-[60ch] text-[15px] leading-relaxed text-muted">{use.body}</p>
                </div>
                <Link
                  href={use.link[1]}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  {use.link[0]}
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Cross-campus: a working school search, not a claim. */}
      <section className="border-y border-line bg-surface py-16 sm:py-24">
        <div className={`${wrap} grid gap-10 lg:grid-cols-2 lg:gap-16`}>
          <div>
            <h2 className="card-type max-w-[18ch] text-3xl font-extrabold leading-tight sm:text-4xl">
              Every school in Bukidnon, one feed.
            </h2>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-muted">
              Students from any college or university in the province can buy and sell here, not just one campus.
              Filter by school and you might find someone selling exactly what you need a few minutes from your
              classroom. Your school not listed? Type it anyway; any school works.
            </p>
          </div>

          <div className="overflow-hidden rounded-[10px] border border-line bg-white shadow-card">
            <div className="bg-primary px-5 pb-3 pt-3.5 text-center">
              <span aria-hidden="true" className="mx-auto block h-1.5 w-12 rounded-full bg-white shadow-[inset_0_1px_1px_rgb(6_36_63/0.35)]" />
              <p className="mt-2 text-sm font-semibold text-white">Find listings at your school</p>
            </div>
            <div className="p-5">
              <form action="/browse" className="flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="landing-school">School</label>
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    id="landing-school"
                    name="school"
                    list="landing-schools"
                    placeholder="e.g. CMU, BukSU, San Isidro College"
                    autoComplete="off"
                    className="h-12 w-full rounded-md border border-line bg-white pl-9 pr-3 text-[15px] text-ink placeholder:text-muted focus:border-primary focus:outline-none"
                  />
                  <datalist id="landing-schools">
                    {BUKIDNON_SCHOOLS.map((s) => (
                      <option key={s.name} value={s.name} />
                    ))}
                  </datalist>
                </div>
                <button type="submit" className={btnPrimary}>Search</button>
              </form>
              <p className="mt-5 text-xs font-medium text-muted">Or jump to a school</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {schools.map((s) => (
                  <li key={s.name}>
                    <Link
                      href={`/browse?school=${encodeURIComponent(s.aliases[0])}`}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 text-[13px] font-medium text-primary transition-colors hover:border-primary/50"
                    >
                      {s.short ?? s.aliases[0]}
                      <span className="text-muted">{s.town}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Messaging: what the seller pastes, and what the buyer taps. */}
      <section className="py-16 sm:py-24">
        <div className={wrap}>
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-16">
            <h2 className="card-type max-w-[18ch] text-3xl font-extrabold leading-tight sm:text-4xl">
              Message sellers where you already chat.
            </h2>
            <p className="max-w-[56ch] text-[15px] leading-relaxed text-muted lg:pt-2">
              There’s no chat inside BukiMart. Sellers paste their Facebook, Messenger or Instagram link when they
              post, whatever the app gave them, even the ones with codes in them. BukiMart finds the account, and
              buyers get a button that opens the conversation directly.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-[10px] border border-line shadow-card">
            <div className="hidden grid-cols-[1.2fr_auto_1fr] gap-6 bg-surface px-5 py-2.5 text-xs font-medium text-muted md:grid">
              <span>The seller pastes</span>
              <span aria-hidden="true" />
              <span>The buyer taps</span>
            </div>
            <ul className="divide-y divide-line bg-white">
              {LINK_EXAMPLES.map(({ pasted, from, icon: Icon, button }) => (
                <li key={pasted} className="grid gap-3 px-5 py-4 md:grid-cols-[1.2fr_auto_1fr] md:items-center md:gap-6">
                  <div className="min-w-0">
                    <p className="truncate rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink">{pasted}</p>
                    <p className="mt-1 text-xs text-muted">{from}</p>
                  </div>
                  <ChevronRightIcon aria-hidden="true" className="hidden h-5 w-5 text-muted md:block" />
                  <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white md:w-auto md:justify-self-start">
                    <Icon className="h-4 w-4" />
                    {button}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-xs text-muted">
            Examples use a made-up account. A plain username like juan.delacruz works too. Without a link, buyers
            see the seller’s email instead.
          </p>
        </div>
      </section>

      {/* How it works, then what it costs. */}
      <section className="border-t border-line bg-surface py-16 sm:py-24">
        <div className={`${wrap} grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16`}>
          <div>
            <h2 className="card-type text-3xl font-extrabold leading-tight sm:text-4xl">How it works</h2>
            <ol className="mt-8 space-y-0">
              {STEPS.map((step, i) => (
                <li key={step.title} className="relative grid grid-cols-[2.5rem_1fr] gap-4 pb-8 last:pb-0">
                  {i < STEPS.length - 1 && (
                    <span aria-hidden="true" className="absolute bottom-0 left-5 top-10 w-0.5 -translate-x-1/2 bg-line" />
                  )}
                  <span className="card-type tabular flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-extrabold text-white">
                    {i + 1}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="text-lg font-bold text-ink">{step.title}</h3>
                    <p className="mt-1 max-w-[52ch] text-[15px] leading-relaxed text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="card-type text-3xl font-extrabold leading-tight sm:text-4xl">Free to start</h2>
            <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-muted">
              Most students never pay. If you sell a lot, a ₱{SUBSCRIPTION_PRICE} pass lifts the limit for a month.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="overflow-hidden rounded-[10px] border border-line bg-white shadow-card">
                <div className="border-b border-line px-4 py-3">
                  <p className="text-sm font-semibold text-ink">Free</p>
                </div>
                <div className="px-4 py-4">
                  <p className="card-type tabular text-3xl font-extrabold leading-none text-primary">₱0</p>
                  <ul className="mt-4 space-y-2 text-sm text-ink">
                    <li className="flex gap-2"><CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{FREE_ACTIVE_LISTINGS} active listings at a time</li>
                    <li className="flex gap-2"><CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Browse and message sellers</li>
                    <li className="flex gap-2"><CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Sell or swap</li>
                  </ul>
                </div>
              </div>
              <div className="overflow-hidden rounded-[10px] border border-accent/40 bg-white shadow-card">
                <div className="bg-accent px-4 py-3">
                  <p className="text-sm font-semibold text-white">Unlimited pass</p>
                </div>
                <div className="px-4 py-4">
                  <p className="card-type tabular text-3xl font-extrabold leading-none text-accent">
                    ₱{SUBSCRIPTION_PRICE}
                    <span className="ml-1 text-base font-semibold text-muted">for 30 days</span>
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-ink">
                    <li className="flex gap-2"><CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />Unlimited active listings</li>
                    <li className="flex gap-2"><CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />Pay once with {payments}</li>
                    <li className="flex gap-2"><CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />No auto-renew</li>
                  </ul>
                  <Link href="/subscribe" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent-hover hover:underline">
                    Get the pass
                    <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Close: the two actions again, then who made it. */}
      <section className="bg-primary text-white">
        <div className={`${wrap} flex flex-col gap-6 py-14 sm:py-16 lg:flex-row lg:items-center lg:justify-between`}>
          <div>
            <span aria-hidden="true" className="block h-1.5 w-12 rounded-full bg-white shadow-[inset_0_1px_1px_rgb(6_36_63/0.35)]" />
            <h2 className="card-type mt-5 max-w-[20ch] text-3xl font-extrabold leading-tight sm:text-4xl">
              Someone near your campus has what you need.
            </h2>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/browse"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-[15px] font-semibold text-primary transition-colors hover:bg-primary-soft"
            >
              <BrowseIcon className="h-5 w-5" />
              Browse Listings
            </Link>
            <Link href="/post" className={btnPost}>
              <PlusIcon className="h-5 w-5" strokeWidth="2.25" />
              Post Item
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className={`${wrap} flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between`}>
          <p className="text-sm font-semibold text-ink">Made by students in Bukidnon</p>
          <ul className="flex flex-col gap-3 sm:flex-row sm:gap-10">
            {CREDITS.map((c) => (
              <li key={c.email} className="text-sm">
                <p className="font-semibold text-ink">
                  {c.name} <span className="font-normal text-muted">· {c.role}</span>
                </p>
                <a href={`mailto:${c.email}`} className="mt-0.5 inline-flex items-center gap-1.5 text-primary hover:underline">
                  <MailIcon className="h-3.5 w-3.5" />
                  {c.email}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
