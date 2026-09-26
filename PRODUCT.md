# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

College students across the whole province of Bukidnon, from any school (universities and colleges in any town or city), as buyers, sellers and swappers. They use it on every device class they own: phones, tablets/iPads, laptops and PCs. Sellers are clearing out pre-loved uniforms, school shoes, books and supplies; some would rather swap an item for something they need; buyers are hunting for a specific item in a specific size for their school. Hand-offs happen in person, usually at or near school.

## Product Purpose

A student marketplace for Bukidnon. It started because a student in a school community Facebook group asked for somewhere to buy and sell "baligya" (uniforms and other stuff) that is easier than scrolling group posts, with filters for size, uniform and price range. The scope is now province-wide. Success: a student finds the right uniform or shoes in their size, from a student at their school or nearby, and messages the seller within a minute.

## Positioning

Built for Bukidnon students. Every listing is from a student in the province, and the filters are the ones students actually need: school (free text, any school), size, category, price range. A general marketplace or a Facebook group feed can't do that.

## Operating Context

- Buyers browse without logging in; posting, editing and managing listings require login (email/password, Google, or Facebook).
- Contact happens off-platform: a "Message Seller on Messenger" link (m.me/<username>) when the seller shares a Facebook username, otherwise the seller's email.
- Items are handed over in person.
- Listings: type (for sale or for swap; swaps have no price and say what the seller wants in return), title, description, price (₱, sale listings only), category, condition, optional size, optional school (free text), up to 5 photos, status available/sold.

## Capabilities and Constraints

- Next.js App Router (JavaScript), Tailwind CSS v4, Supabase (auth, Postgres with RLS, storage bucket `listing-images`).
- Categories: Uniforms, School Shoes, Clothing, Books, School Supplies, Electronics, Food, Services, Other.
- Conditions: New, Like New, Used - Good, Used - Fair.
- School is free text, not a fixed list: there is no complete list of every school in Bukidnon. Suggestions come from schools sellers have already entered, and the Browse school filter does a partial, case-insensitive match.
- No in-app chat, payments, ratings or delivery. Do not imply they exist.

## Brand Commitments

- Name: Buki-Finds, a collaboration with an existing entrepreneurship team that owns the brand. Neutral branding, not tied to any single school. The official logo is `public/LOGO BUKIFINDS.jpg`; the palette is measured from it.
- Unofficial student project: it must not look like, or claim to be, an official site of any school or the government. No seals, crests or official marks.
- Voice: plain, friendly English with a casual student feel.
- Palette from the official logo: logo blue #00528A as the brand color on white, and logo green #0B813E as the accent for creating and trading (Post Item, swaps, available), used sparingly. Neutrals are blue-tinted. Red is used only for errors and destructive actions.
- Type must be easy to read: one plain sans (Geist) at normal width for everything people read, sentence-case labels, no condensed or tiny uppercase lettering. One family everywhere (the owner asked for consistent type); no display face. Buttons and nav use the owner's Title Case wording from their spec ("nav links: Browse, Post Item, My Listings, Login/Logout", "Message Seller on Messenger", "Mark as Sold", "Delete Listing"); related actions follow the same convention (Mark as Available, Email Seller, Save Changes). Sentence case applies to field labels and body copy.

## Evidence on Hand

- No real listings (beyond the owner's test posts), photos, user counts or testimonials exist yet. Do not invent them; any demo content must be clearly labeled as sample content.

## Product Principles

1. Find it in your size, fast: size, school and price filtering come first, not decoration.
2. Student trust over marketplace polish: make it obvious that everything here is from fellow students in Bukidnon.
3. The photo sells the item: listings put the seller's photos first.
4. One tap to the seller: contacting a seller is always one clear action.
5. Works on any device a student has, phone first but never broken on a laptop or tablet.

## Accessibility & Inclusion

Must work on low-end Android phones and slow mobile data: light pages, readable text sizes, large tap targets.
