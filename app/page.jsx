'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  BrowseIcon,
  CheckIcon,
  ChevronRightIcon,
  HeartIcon,
  MailIcon,
  PlusIcon,
  SwapIcon,
  UserIcon,
} from '@/app/components/icons'

export default function LandingPage() {
  const schools = [
    { name: 'Bukidnon State University', short: 'BukSU' },
    { name: 'Central Mindanao University', short: 'CMU' },
    { name: 'San Isidro College', short: 'SIC' },
    { name: 'STI College Malaybalay', short: 'STI' },
    { name: 'Mountain View College', short: 'MVC' },
    { name: 'Philippine College Foundation', short: 'PCF' },
  ]

  const features = [
    {
      title: 'Start Your Student Business',
      desc: 'Turn your unused textbooks, uniforms, gadgets, and creative crafts into extra allowance. Zero listing fees, 100% student-focused.',
      badge: 'Student Entrepreneurship',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-accent">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: 'Campus-to-Campus Trading',
      desc: 'Easily filter by your university or city. Arrange safe, quick handoffs and meetups right outside your lecture hall or campus gates.',
      badge: 'Safe & Local',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-primary">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      title: 'Cashless Item Swapping',
      desc: 'Need a different uniform size or textbook edition? Put your items up "For Swap" and trade directly with fellow students without spending cash.',
      badge: 'Sustainable Campus',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-highlight">
          <path d="M4 8h13M13.5 4.5 17 8l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 16H7M10.5 12.5 7 16l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: 'Campus ID Card Experience',
      desc: 'Every listing is formatted cleanly like a vertical campus lanyard ID, keeping vital details like price, size, school, and condition front and center.',
      badge: 'Student Identity',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-primary">
          <rect x="3" y="4" width="18" height="16" rx="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="3" />
          <path d="M7 17h10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]

  return (
    <main className="flex-1 bg-surface text-ink">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-white via-white to-surface py-12 md:py-20">
        {/* Subtle decorative grid/glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.08),transparent_50%)]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            
            {/* Left Column: Hero Text */}
            <div className="text-center lg:col-span-7 lg:text-left">
              {/* Campus pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary sm:text-sm">
                <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span>The Student Marketplace of Bukidnon</span>
              </div>

              {/* Main Headline */}
              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-5xl sm:leading-tight lg:text-5xl">
                Buy, Sell &amp; Grow Your <br className="hidden sm:inline" />
                <span className="text-primary">Campus Business</span> in Bukidnon
              </h1>

              {/* Subtitle */}
              <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg lg:max-w-xl">
                <strong>BUKI</strong> connects students across <strong>BukSU, CMU, STI, San Isidro</strong>, and neighboring colleges. Trade uniforms, books, gadgets, and dorm supplies, or launch your own student side-hustle with zero platform fees.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/browse"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <BrowseIcon className="h-5 w-5" />
                  Start Browsing
                </Link>

                <Link
                  href="/post"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-accent-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <PlusIcon className="h-5 w-5" />
                  Post an Item
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-muted sm:text-sm lg:justify-start">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent font-bold">✓</span>
                  <span>100% Free for Students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary font-bold">✓</span>
                  <span>Campus ID Card Listings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-highlight/20 text-highlight font-bold">✓</span>
                  <span>Direct Messenger Chat</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card Mockup */}
            <div className="flex justify-center lg:col-span-5">
              <div className="relative w-full max-w-sm">
                
                {/* Glow accent behind card */}
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-70 blur-xl" />

                {/* Floating "Campus ID Card" Mockup */}
                <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-2xl transition-transform hover:-translate-y-1">
                  
                  {/* Signature Navy ID Strip Header */}
                  <div className="relative bg-primary px-5 py-3.5 text-white">
                    {/* Centered Lanyard Slot Punch */}
                    <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-white/30" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-wider text-on-primary-muted uppercase">
                        Uniform &bull; College
                      </span>
                      <span className="font-mono text-xs font-medium text-on-primary-muted">
                        No. BUK-2026
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Centered Logo Preview */}
                    <div className="relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-line bg-surface p-4">
                      <Image
                        src="/1.png"
                        alt="BUKI Official Logo"
                        width={200}
                        height={200}
                        priority
                        className="h-36 w-36 object-contain drop-shadow-sm transition-transform hover:scale-105"
                      />
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                        Available
                      </span>
                    </div>

                    {/* Price & Title */}
                    <div className="flex items-baseline justify-between">
                      <span className="card-type text-2xl font-extrabold text-primary tabular">
                        ₱250
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent">
                        <SwapIcon className="h-3.5 w-3.5" /> For Swap Available
                      </span>
                    </div>

                    <h2 className="mt-1.5 text-base font-bold text-ink">
                      BukSU College Polo Uniform (Size M)
                    </h2>

                    {/* Details row */}
                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-dashed border-line pt-3 text-center">
                      <div className="rounded-lg bg-surface py-1.5">
                        <span className="block text-[10px] uppercase font-semibold text-muted">School</span>
                        <span className="text-xs font-bold text-ink">BukSU</span>
                      </div>
                      <div className="rounded-lg bg-surface py-1.5">
                        <span className="block text-[10px] uppercase font-semibold text-muted">Size</span>
                        <span className="text-xs font-bold text-ink">Medium</span>
                      </div>
                      <div className="rounded-lg bg-surface py-1.5">
                        <span className="block text-[10px] uppercase font-semibold text-muted">Condition</span>
                        <span className="text-xs font-bold text-ink">Like New</span>
                      </div>
                    </div>

                    {/* Mock action button */}
                    <Link
                      href="/browse"
                      className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover"
                    >
                      Message Seller &bull; View Item
                    </Link>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CAMPUSES COVERED STRIP */}
      <section className="border-b border-line bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-muted">
            Supporting Students &amp; Campuses Across Bukidnon
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {schools.map((s) => (
              <Link
                key={s.short}
                href={`/browse?school=${encodeURIComponent(s.short)}`}
                className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-xs font-bold text-ink shadow-xs transition-all hover:border-primary/50 hover:bg-primary-soft hover:text-primary sm:text-sm"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-extrabold text-primary">
                  {s.short[0]}
                </span>
                <span>{s.name}</span>
                <span className="text-[11px] font-medium text-muted">({s.short})</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. STUDENT ENTREPRENEURSHIP & BUSINESS HUB */}
      <section className="py-14 sm:py-20 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
              Empowering Student Sellers
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-ink sm:text-4xl">
              Turn Campus Needs into Your Own Business
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              BUKI isn’t just a classifieds board—it’s an open launchpad for Bukidnon students to earn, trade, and provide affordable essentials for each other.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative flex flex-col justify-between rounded-2xl border border-line bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface border border-line shadow-2xs group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                    {f.badge}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-ink">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Business Pitch Banner */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary to-primary-hover p-6 text-white sm:p-8">
            <div className="grid items-center gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
                  Zero Commission &bull; Instant Student Peer-to-Peer
                </span>
                <h3 className="mt-3 text-xl font-extrabold sm:text-2xl">
                  Have textbooks, dorm supplies, or crafts to sell?
                </h3>
                <p className="mt-2 text-xs text-on-primary-muted sm:text-sm leading-relaxed max-w-xl">
                  Post in under 2 minutes. Your fellow classmates and dorm mates are already looking for what you have. Set your price, meet at the campus library or canteen, and get paid directly.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:col-span-4 lg:justify-end">
                <Link
                  href="/post"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary shadow-sm transition-colors hover:bg-primary-soft"
                >
                  <PlusIcon className="h-4 w-4" />
                  Create Your Listing
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. ABOUT THE SYSTEM & HOW IT WORKS */}
      <section className="border-t border-line bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid items-center gap-12 lg:grid-cols-12">
            
            {/* Left: About Details */}
            <div className="lg:col-span-6">
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                About the Platform
              </span>
              <h2 className="mt-3 text-2xl font-extrabold text-ink sm:text-4xl">
                A Unified Marketplace Built for Bukidnon Students
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                BUKI was conceived to solve a daily struggle on every Bukidnon campus: finding affordable course materials, fitting uniforms, reliable graphing calculators, and second-hand gear without high department store prices or risky stranger transactions.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent font-bold text-xs mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink">Verified Student Identity Motif</h4>
                    <p className="text-xs text-muted leading-relaxed">
                      Every listing follows a structured campus lanyard ID card presentation, ensuring clear prices, item conditions, sizes, and school tags.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent font-bold text-xs mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink">Direct Messenger Integration</h4>
                    <p className="text-xs text-muted leading-relaxed">
                      Seamless one-click deep-linking to the seller’s Facebook Messenger for both mobile and desktop users.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent font-bold text-xs mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink">Local &amp; Sustainable</h4>
                    <p className="text-xs text-muted leading-relaxed">
                      Encouraging circular economy on campus: pass down your books and uniforms to freshmen each semester.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Steps */}
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 lg:col-span-6 shadow-sm">
              <h3 className="text-lg font-bold text-ink">How to Trade in 3 Simple Steps</h3>
              
              <div className="mt-6 space-y-6">
                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-extrabold text-white shadow-xs">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-ink">Snap &amp; List Your Item</h4>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      Take photos of your uniform, textbook, or item. Select your school, condition, and set your price (or mark it For Swap).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-base font-extrabold text-white shadow-xs">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-ink">Connect With Campus Buyers</h4>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      Interested students tap &quot;Message Seller on Messenger&quot; to coordinate meetup times and locations right at your school.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-base font-extrabold text-white shadow-xs">
                    3
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-ink">Hand Over &amp; Mark as Sold</h4>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      Complete the exchange safely on campus. Mark the item as sold or trade another item right away.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. MEET THE DEVELOPERS & CONTACT SECTION */}
      <section className="border-t border-line bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              The Creators
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-ink sm:text-4xl">
              Meet the Developers
            </h2>
            <p className="mt-3 text-sm text-muted">
              Built with dedication for the student community of Bukidnon. Have feedback, questions, or ideas? Reach out to us directly!
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            
            {/* Developer 1: Atheo Jessar R. Caliao */}
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all hover:shadow-md hover:border-primary/40">
              {/* ID-style top strip */}
              <div className="bg-primary px-5 py-3 text-white flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider uppercase text-on-primary-muted">
                  Development Team
                </span>
                <span className="font-mono text-xs text-on-primary-muted">ID: DEV-01</span>
              </div>
              <div className="p-6">
                <div>
                  <h3 className="text-lg font-bold text-ink">
                    Atheo Jessar R. Caliao
                  </h3>
                  <span className="mt-1 inline-block rounded-md bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent">
                    FrontEnd Developer
                  </span>
                </div>

                <div className="mt-5 space-y-2.5 border-t border-line pt-4 text-xs sm:text-sm">
                  <a
                    href="mailto:ajtheo176@gmail.com"
                    className="flex items-center gap-2.5 text-muted transition-colors hover:text-primary"
                  >
                    <MailIcon className="h-4 w-4 text-primary" />
                    <span>ajtheo176@gmail.com</span>
                  </a>
                  <a
                    href="tel:09924908157"
                    className="flex items-center gap-2.5 text-muted transition-colors hover:text-primary"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-primary">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>09924908157</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Developer 2: Toff Darell B. Vergara */}
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all hover:shadow-md hover:border-primary/40">
              {/* ID-style top strip */}
              <div className="bg-primary px-5 py-3 text-white flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider uppercase text-on-primary-muted">
                  Development Team
                </span>
                <span className="font-mono text-xs text-on-primary-muted">ID: DEV-02</span>
              </div>
              <div className="p-6">
                <div>
                  <h3 className="text-lg font-bold text-ink">
                    Toff Darell B. Vergara
                  </h3>
                  <span className="mt-1 inline-block rounded-md bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">
                    FullStack Developer
                  </span>
                </div>

                <div className="mt-5 space-y-2.5 border-t border-line pt-4 text-xs sm:text-sm">
                  <a
                    href="mailto:topedarell13@gmail.com"
                    className="flex items-center gap-2.5 text-muted transition-colors hover:text-primary"
                  >
                    <MailIcon className="h-4 w-4 text-primary" />
                    <span>topedarell13@gmail.com</span>
                  </a>
                  <a
                    href="tel:09977907786"
                    className="flex items-center gap-2.5 text-muted transition-colors hover:text-primary"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-primary">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>09977907786</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="relative overflow-hidden bg-primary py-12 text-white sm:py-16">
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-4 flex justify-center">
            <Image
              src="/BUKI.png"
              alt="BUKI"
              width={160}
              height={80}
              className="h-12 w-auto object-contain"
            />
          </div>
          <h2 className="text-2xl font-extrabold sm:text-4xl">
            Start Buying, Selling &amp; Swapping Today
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-on-primary-muted sm:text-base">
            Join students from across Bukidnon campuses. Find great deals and earn money by listing your items right now.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/browse"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-primary shadow-lg transition-all hover:bg-primary-soft hover:shadow-xl"
            >
              <BrowseIcon className="h-5 w-5" />
              Explore All Listings
            </Link>
            <Link
              href="/post"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-accent-hover hover:shadow-xl"
            >
              <PlusIcon className="h-5 w-5" />
              Post an Item Now
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-line bg-white py-8 text-xs text-muted">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-ink">BUKI</span>
            <span>&bull;</span>
            <span>The Student Marketplace &bull; Bukidnon, Philippines</span>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/browse" className="hover:text-primary transition-colors">Browse</Link>
            <Link href="/post" className="hover:text-primary transition-colors">Post Item</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Account</Link>
            <a href="mailto:ajtheo176@gmail.com" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
