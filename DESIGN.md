---
name: Baligya Bukidnon
description: A student marketplace where every listing is issued like a campus ID card, in navy and white.
colors:
  primary: "#1e3a8a"
  primary-hover: "#172e6e"
  primary-soft: "#e8edf8"
  on-primary-muted: "#c9d3f0"
  card-white: "#ffffff"
  surface: "#f5f7fc"
  ink: "#0f1d45"
  muted: "#4b5a7d"
  line: "#dce2ef"
  error-text: "#c10007"
  error-text-strong: "#9f0712"
  error-border: "#ffc9c9"
  error-bg: "#fef2f2"
typography:
  display:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.015em"
  price-hero:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.015em"
    fontFeature: "tnum"
  price-card:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.015em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.375
  title:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.625
  body-sm:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  field-value:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.375
  label:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
  listing-number:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
rounded:
  sm: "4px"
  md: "6px"
  rail: "8px"
  card: "10px"
  panel: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.card-white}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.card-white}"
  button-secondary:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  button-secondary-hover:
    backgroundColor: "{colors.surface}"
  button-destructive:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.error-text}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  button-destructive-hover:
    backgroundColor: "{colors.error-bg}"
  button-on-strip:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-on-strip-hover:
    backgroundColor: "{colors.primary-soft}"
  input-field:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  input-search:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px 12px 44px"
  filter-chip:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "2px 6px 2px 10px"
  id-strip:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.card-white}"
    padding: "16px 12px 8px"
  id-card:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  photo-frame:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sm}"
  sold-band:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card-white}"
    padding: "4px 0"
  nav-strip:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary-muted}"
    padding: "12px 24px"
---

# Design System: Baligya Bukidnon

## Overview

**Creative North Star: "The Campus ID Card"**

Every listing is issued like a vertical lanyard ID: a navy top strip with a slot punch, a framed photo, the price printed as the card's one big number, then small labeled fields over bold values, and a quotable No. The world belongs on a Bukidnon student's phone. It reads as part of campus life, but it carries no university seal, crest, or official marks. This is an unofficial student project, and the ID is a form it borrows, not an emblem it claims.

The palette is navy and white only. Navy is the ink of action and identity: strips, primary buttons, prices, active tabs. White is the card stock. Every neutral is tinted toward navy, so greys never go warm or flat. Red appears only when something failed or is about to be destroyed. Density is task-first. The Browse grid runs 2, 3, then 4 columns, and fields do the reading work that captions do in a generic marketplace.

The type is one readable face, Geist at normal width. Field labels and body copy are in sentence case. Buttons and nav keep the owner's Title Case wording. Geist Mono appears only on the listing No., where it is the one mechanical, quotable string on the card.

**Key Characteristics:**
- Navy strip plus slot punch on every card-like container (listing cards, item detail panel, login card, filter rail header).
- Price is the single oversized, tabular, navy numeral on each card.
- Small muted labels over bold ink values, divided by dashed or solid navy-tinted rules.
- Quiet elevation with a two-layer navy-tinted shadow, plus a lift on hover.
- Cards swing from their slot punch on hover, focus, and press, and stay still for reduced motion.

## Colors

The palette is navy and white, with navy-tinted neutrals. Red is reserved for errors and destructive actions.

### Primary
- **Lanyard Navy** (primary): the ID strips, the nav header, primary buttons, prices, active category tabs, section headings in forms, selection highlight, focus rings, caret and native control accent.
- **Pressed Navy** (primary-hover): hover state for every navy button. Nothing else uses it.
- **Wash Navy** (primary-soft): the tint behind active-filter chips, status notices, and the hover state of the white Post Item button on the strip.
- **Strip Frost** (on-primary-muted): secondary text on navy (the No. on strips, inactive nav links, the login subline) and the scrollbar thumb.

### Neutral
- **Card Stock** (card-white): card bodies, fields, the header search band.
- **Campus Paper** (surface): the page ground behind grids and forms, empty photo frames, and hover fill for secondary buttons.
- **Navy Ink** (ink): all primary text, and the SOLD band and badge.
- **Faded Ink** (muted): field labels, helper text, counts, placeholders, and struck-through sold prices.
- **Ruled Line** (line): card borders, field borders, photo-frame rings, dashed field dividers, and tab baselines.

### Error (functional only)
- **Error Red** (error-text, error-text-strong, error-border, error-bg): error banners, inline form alerts, the auth error banner, and the Delete Listing button. Never decorative.

### Named Rules
**The Navy and White Rule.** The only hue is navy. No green, no second accent, no gradients. Any new state has to be said with navy, ink, tint, or weight.

**The Red Means Loss Rule.** Red appears only for a failure message or a destructive action. A red element that is neither is a bug.

**The State Is Palette Rule.** Navy means available and actionable. Ink means sold. A sold listing gets a grayscale photo, an ink SOLD band, and a muted struck-through price. Nothing else changes color to signal state.

## Typography

**Body Font:** Geist (with Arial, Helvetica, sans-serif)
**Label/Mono Font:** Geist Mono, used only for the listing No.

**Character:** One sturdy, readable face does every job. Headings and prices get weight and a slight negative tracking (-0.015em). Everything else stays at normal width and normal case.

### Hierarchy
- **Display** (700, 36px desktop and 30px phone, line-height 1): page headings like "Find it in your size.", "My Listings", and empty-state lines (24px).
- **Price hero** (700, 48px, line-height 1, tabular): the price on the item detail panel.
- **Price card** (700, 24px, line-height 1, tabular): the price on each listing card and the mobile contact bar. 20px on My Listings rows.
- **Headline** (600, 20px to 24px, snug): the item title on the detail panel.
- **Title** (700, 18px, navy): form section headings and the wordmark.
- **Body** (400, 15px, relaxed 1.625, max 65ch): descriptions, form inputs, card titles (clamped to 2 lines).
- **Body small** (400, 14px): helper lines, nav, buttons, the "Showing" line.
- **Field value** (600, 14px on cards and 16px on the detail panel): the bold half of a labeled field.
- **Label** (500, 12px, muted, sentence case): the small half of a labeled field and filter labels.
- **Listing No.** (Geist Mono, 12px): "No. 5DCEAB" on strips, rows, and the contact hint.

### Named Rules
**The One Face Rule.** Geist at normal width carries everything. Mono exists for the No. and nothing else.

**The Sentence Case Rule.** Labels, headings, and body copy are in sentence case. Buttons and nav keep the owner's Title Case wording exactly: Post Item, My Listings, Message Seller on Messenger, Mark as Sold, Mark as Available, Delete Listing, Email Seller, Save Changes. The only uppercase in the system is the SOLD stamp.

**The One Big Number Rule.** Each card has exactly one oversized numeral, the price, set tabular in navy. Nothing else on a card competes with it.

## Layout

Content sits in a centered 1280px container (max-w-7xl) with 16px side padding, or 24px from 640px up. Focused pages narrow the container: My Listings uses 896px, and Post and Edit use 1024px. The Browse page stacks a white header band (heading, search, the "Showing" line with removable chips, category tabs) over a Campus Paper ground holding the filter rail and the grid. Phone: a Filters toggle and a sort control sit above the grid, and the rail opens inline. From 1024px up, a 224px sticky left rail appears. The grid runs 2 columns (12px gap), then 3 columns from 640px (16px gap), then 4 columns from 1280px. The item page splits 1.1fr to 0.9fr, with a sticky detail panel. On phones it adds a fixed bottom bar with the price and the contact action. The Post form pairs the fields with a 272px sticky live preview of the ID card. On phones the preview collapses into a disclosure. Spacing follows a 4px base, with 12px, 16px, 24px, and 32px as the recurring steps.

## Elevation & Depth

Depth is quiet and navy-tinted. Cards sit on Campus Paper with a hairline Ruled Line border and a soft two-layer shadow. Hover and focus lift them with a slightly deeper shadow as they swing. The slot punch is the one inset: a white pill with a faint inner shadow, cut into the strip.

### Shadow Vocabulary
- **Card rest** (`0 1px 2px rgb(15 29 69 / 0.06), 0 2px 6px rgb(15 29 69 / 0.04)`): every card, panel, filter rail, and the search field.
- **Card lift** (`0 6px 14px rgb(15 29 69 / 0.1), 0 2px 4px rgb(15 29 69 / 0.06)`): hovered or focused listing cards, and gallery arrow buttons.
- **Slot punch** (`inset 0 1px 1px rgb(15 29 69 / 0.35)`, or 0 1px 2px on large strips): the punch in every ID strip.
- **Bottom bar** (`0 -4px 12px rgb(15 29 69 / 0.06)`): the fixed mobile contact bar.

### Named Rules
**The Navy Shadow Rule.** Shadows are always tinted with ink (15 29 69) and never go above 0.1 alpha per layer. No black shadows, and no hard offset shadows.

## Shapes

Corners are gently rounded and step up with container size. Fields, photo frames, and small badges use 4px. Buttons use 6px. The filter rail uses 8px. Listing cards and empty states use 10px. The large item panel and login card use 12px. Chips, the slot punch, and the photo counter are full pills. Photos always sit inside a 4px frame with a 1px Ruled Line ring, inset 10px from the card edge. Dashed Ruled Line rules separate a card's printed fields from its title. Solid rules separate sections.

## Components

### Buttons
Buttons are solid and plain, with navy doing the talking.
- **Shape:** gently rounded (6px).
- **Primary:** Lanyard Navy fill, white 14px to 15px semibold text, padding 10px by 16px. Full width with 12px vertical padding for the main contact action and form submit. Hover fills with Pressed Navy. Disabled drops to 60% opacity.
- **Secondary:** Card Stock fill, Ruled Line border, ink text. Hover fills with Campus Paper.
- **Destructive:** Card Stock fill, Error Red border and text. Hover fills with the error background.
- **On strip:** a white button with navy text on the navy header (Post Item). Hover fills with Wash Navy.
- **Icons:** 16px icons lead the label with a 6px gap.

### Chips
- **Style:** Wash Navy fill, navy text at 13px medium, a 20%-navy border, full pill, and a trailing 14px close icon.
- **State:** each active filter is its own removable chip in the "Showing" line. Hover strengthens the border to 50% navy.

### Cards / Containers
- **Corner Style:** 10px for listing cards, 12px for the detail and login panels.
- **Background:** Card Stock on a Campus Paper ground.
- **Shadow Strategy:** card rest, lifting to card lift on hover and focus (see Elevation & Depth).
- **Border:** 1px Ruled Line.
- **Internal Padding:** 10px around the photo frame and 12px around the text on listing cards. 20px on the detail panel. 20px to 28px on form cards.

### Inputs / Fields
- **Style:** Card Stock fill, 1px Ruled Line border, 4px corners, 15px ink text, muted placeholder. The Browse search is larger (6px corners, 44px icon inset, card-rest shadow).
- **Hover / Focus:** the border shifts to 60% muted on hover and to Lanyard Navy on focus. The global focus-visible ring is a 2px navy outline with 2px offset.
- **Labels:** sentence case. Filters use 12px muted labels, and forms use 14px semibold ink labels with an "optional" note in muted.
- **Error:** an inline alert box with the error background, error border, and strong error text.

### Navigation
- **Style:** a full-bleed navy strip. The wordmark is a white lanyard-ID glyph plus "Baligya Bukidnon" in 18px bold. Links are 14px medium in Strip Frost and turn white on hover. The active link is white with a 2px white underline bar. The white Post Item button sits flush right. On phones, the links wrap to a second row under a 10% white rule.
- **Tabs:** category and status tabs are 14px medium in muted text, with a 3px bottom border in navy when selected.

### Listing ID Card (signature)
A vertical card. The navy strip (16px top padding) holds a centered white slot punch (36px by 6px), the category in 13px semibold white, and "No. XXXXXX" in mono Strip Frost. On phones the No. moves below the fields. Below the strip come a square photo frame, the navy price, a 2-line 15px title, and a dashed rule over labeled fields (Size, School, or Condition as a fallback). Sold cards get a grayscale photo and a centered ink band at 85% opacity reading SOLD (14px bold, tracked 0.2em), and the price goes muted and struck through. The same card renders as a non-link live preview on the Post and Edit form, and as a pulsing skeleton with an 80% navy strip.

### ID Strip Header (signature)
The strip plus slot punch is reused as the header of the item detail panel (larger punch, 56px by 8px) and the login card. The filter rail uses a slim navy header without a punch.

### Lanyard Swing (signature motion)
On hover, focus-visible, and active, listing cards rotate -1.25deg around their top center and drop 2px. Even-numbered cards rotate +1.25deg. The rotation runs over 500ms and the shadow change over 300ms, both on ease-out-expo `cubic-bezier(0.16, 1, 0.3, 1)`. The swing sits entirely inside a prefers-reduced-motion: no-preference guard, so reduced-motion users get a static card.

### Icons
There is one stroke set: a 24px grid with a 1.75 stroke and round caps and joins, drawn in currentColor at 16px to 20px. The Messenger glyph is the one filled brand mark.

## Do's and Don'ts

### Do:
- **Do** give every card-like container a navy strip with a centered white slot punch and a No. where a listing is involved.
- **Do** print item facts as fields: a 12px muted sentence-case label over a bold ink value.
- **Do** set every price in Geist bold, tabular, navy, as the largest numeral on its card.
- **Do** tint every neutral and shadow toward navy ink (15 29 69).
- **Do** keep the owner's Title Case button wording exactly (Post Item, My Listings, Message Seller on Messenger, Mark as Sold, Mark as Available, Delete Listing, Email Seller, Save Changes).
- **Do** guard every motion with prefers-reduced-motion.

### Don't:
- **Don't** introduce green or any second accent color. The palette is navy and white only.
- **Don't** use red for anything but errors and destructive actions.
- **Don't** use gradients, glass or blur, or colored side borders on cards.
- **Don't** show any school's or government seal, crest, or official mark. This is an unofficial student project.
- **Don't** use uppercase or letter-spaced labels. The SOLD stamp is the only uppercase text.
- **Don't** use Geist Mono for anything but the listing No.
- **Don't** fall back to the rounded-photo-card marketplace look where price, size, and school are a caption under the image.
