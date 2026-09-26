---
name: Buki-Finds
description: A student marketplace where every listing is issued like a campus ID card, in the logo's blue and green on white.
colors:
  primary: "#00528a"
  primary-hover: "#024273"
  primary-soft: "#e6f0f7"
  on-primary-muted: "#bcd5e8"
  accent: "#0b813e"
  accent-hover: "#096b33"
  accent-soft: "#e7f4ea"
  card-white: "#ffffff"
  surface: "#f3f7fa"
  ink: "#06243f"
  muted: "#4a6076"
  line: "#d6e2ec"
  error-text: "#c10007"
  error-text-strong: "#9f0712"
  error-border: "#ffc9c9"
  error-bg: "#fef2f2"
typography:
  display:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  display-phone:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  empty-headline:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  price-hero:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  price-card:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  price-card-phone:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
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
  label-strong:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.33
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
    typography: "{typography.label-strong}"
    rounded: "{rounded.full}"
    padding: "4px 6px 4px 12px"
    height: "32px"
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

# Design System: Buki-Finds

## Overview

**Creative North Star: "The Campus ID Card"**

Every listing is issued like a vertical lanyard ID: a navy top strip with a slot punch, a framed photo, the price printed as the card's one big number, then small labeled fields over bold values, and a quotable No. The world belongs on a Bukidnon student's phone. It reads as part of campus life, but it carries no university seal, crest, or official marks. This is an unofficial student project, and the ID is a form it borrows, not an emblem it claims.

The palette comes from the official logo (`public/LOGO BUKIFINDS.jpg`), measured from its pixels: Logo Blue #00528A is the ink of identity and navigation (strips, nav, prices, active tabs, links), and Logo Green #0B813E is the accent for creating and trading (Post Item everywhere, form submit, swap marks and badges, the Available status). White is the card stock. Every neutral is tinted toward the logo blue, so greys never go warm or flat. Red appears only when something failed or is about to be destroyed. Density is task-first. The Browse grid runs 2, 3, then 4 columns, and fields do the reading work that captions do in a generic marketplace.

The type is one family, Geist, everywhere (owner's request for consistent type). Prices and headings get weight and slightly tight tracking through `.card-type`, not a different face. Field labels and body copy are in sentence case. Buttons and nav keep the owner's Title Case wording. Geist Mono appears only on the listing No., where it is the one mechanical, quotable string on the card.

**Key Characteristics:**
- Navy strip plus slot punch on every card-like container that stands for a listing or an identity (listing cards, item detail panel, login card). Supporting panels like the filter rail stay white.
- Price is the single oversized, tabular, blue numeral on each card; a swap shows the green Swap mark instead.
- Small muted labels over bold ink values, divided by dashed or solid navy-tinted rules.
- Quiet elevation with a two-layer navy-tinted shadow, plus a lift on hover.
- Cards swing from their slot punch on hover, focus, and press, and stay still for reduced motion.

## Colors

The palette is the logo's blue and green on white, with blue-tinted neutrals. Red is reserved for errors and destructive actions.

**Measured from the logo** (canvas pixel sampling, 9x9 patch averages plus percentiles over ~62k blue and ~52k green pixels): blue #00528A (B stem, ring, magnifier rim; median #015182), darker end #024273 to #022F5C, light end #5BCDFB / #099BDC (sky, handle highlight); green median #2C9E43, darker end #0B813E, light end #6CC337 / #84CF31 (hill highlight); the B blends blue #00528A through teal #07856E to green #16935E. The mid green #2C9E43 with white text is only 3.5:1, so the accent uses the logo's darker green end, #0B813E (5.0:1). The light ends are not used as tokens.

### Primary
- **Logo Blue** (primary, #00528A): the ID strips, prices, active tabs, section headings in forms, Message Seller, selection highlight, focus rings, caret and native control accent. White on it: 8.2:1.
- **Pressed Blue** (primary-hover, #024273): hover state for every blue button.
- **Wash Blue** (primary-soft): the tint behind active-filter chips and status notices.
- **Strip Frost** (on-primary-muted): secondary text on blue (the No. on strips, inactive nav links, the login subline) and the scrollbar thumb. 5.4:1 on blue.

### Accent
- **Logo Green** (accent, #0B813E): the top nav strip (owner request; focus rings on it go white), and otherwise creating and trading only. Post Item (phone tab bar, empty state, My Listings; on the green navbar it inverts to white with green text), the Post/Save form submit, the Swap mark on cards and the swap price on the item page, the For Swap badge, the plus icon in the profile menu. White on it and it on white: 5.0:1.
- **Pressed Green** (accent-hover, #096B33): hover for green buttons, and the text colour on Wash Green (5.9:1).
- **Wash Green** (accent-soft): behind the Available stamp and the "Looking for in return" box.

### Neutral
- **Card Stock** (card-white): card bodies, fields, the header search band.
- **Campus Paper** (surface): the page ground behind grids and forms, empty photo frames, and hover fill for secondary buttons.
- **Navy Ink** (ink): all primary text, and the SOLD band and badge.
- **Faded Ink** (muted): field labels, helper text, counts, placeholders, and struck-through sold prices.
- **Ruled Line** (line): card borders, field borders, photo-frame rings, dashed field dividers, and tab baselines.

### Error (functional only)
- **Error Red** (error-text, error-text-strong, error-border, error-bg): error banners, inline form alerts, the auth error banner, and the Delete Listing button. Never decorative.

### Named Rules
**The Two Colours Rule.** Blue says who and where (listing identity, prices, contact, active filters and tabs); the top bar is the one green surface, at the owner's request. Green says make or trade (post, swap, available). Nothing else gets a hue, there are no gradients even though the logo has them, and green never carries prices, navigation or filters.

**The Red Means Loss Rule.** Red appears only for a failure message or a destructive action. A red element that is neither is a bug.

**The State Is Palette Rule.** Navy means available and actionable. Ink means sold. A sold listing gets a grayscale photo, an ink SOLD band, and a muted struck-through price. Nothing else changes color to signal state.

## Typography

**Body Font:** Geist (with Arial, Helvetica, sans-serif)
**Label/Mono Font:** Geist Mono, used only for the listing No.

**Character:** one family everywhere. `.card-type` only tightens tracking (-0.02em) for prices and headings, which also carry the weight. Everything stays Geist at normal width and normal case.

### Hierarchy
- **Display** (Geist 800, 44px desktop and 32px phone, line-height 0.95): page headings like "Find it in your size." and "My Listings".
- **Empty headline** (Geist 800, 28px desktop and 24px phone): the one line of an empty state.
- **Price hero** (Geist 700, 48px, line-height 1, tabular): the price on the item detail panel.
- **Price card** (Geist 800, 28px from 640px, 24px on phones, 22px under 380px, line-height 1, tabular): the price on each listing card. Sized so ₱12,500 fits a two-column 320px phone. 20px on My Listings rows, 24px in the mobile contact bar.
- **Headline** (Geist 600, 20px to 24px, snug): the item title on the detail panel.
- **Title** (Geist 700, 18px, navy): form section headings and the wordmark.
- **Body** (400, 15px, relaxed 1.625, max 65ch): descriptions, form inputs, card titles (clamped to 2 lines).
- **Body small** (400, 14px): helper lines, nav, buttons, the result count.
- **Label strong** (500, 13px): filter chips and the category on a card strip.
- **Field value** (600, 14px on cards and 16px on the detail panel): the bold half of a labeled field.
- **Label** (500, 12px, muted, sentence case): the small half of a labeled field and filter labels.
- **Listing No.** (Geist Mono, 12px): "No. 5DCEAB" on strips, rows, and the contact hint.

### Named Rules
**The One Family Rule.** Geist carries everything. Geist Mono, the same family's mono cut, exists for the listing No. and nothing else. No other face.

**The Sentence Case Rule.** Labels, headings, and body copy are in sentence case. Buttons and nav keep the owner's Title Case wording exactly: Post Item, My Listings, Message Seller on Messenger, Mark as Sold, Mark as Available, Delete Listing, Email Seller, Save Changes. The only uppercase in the system is the SOLD stamp.

**The One Big Number Rule.** Each card has exactly one oversized numeral, the price, set tabular in navy. Nothing else on a card competes with it.

## Layout

Content sits in a centered 1280px container (max-w-7xl) with 16px side padding, or 24px from 640px up. Focused pages narrow the container: My Listings uses 896px, and Post and Edit use 1024px. The Browse page stacks a white header band (heading, search with the All / For Sale / For Swap toggle, category tabs) over a Campus Paper ground holding the filter rail, a results bar and the grid. **Phones (below 768px), by owner request, follow a Carousell-style feed:** the heading and tagline are hidden (the h1 stays for screen readers), and a white bar sticks to the top of the screen for the whole page: the search field, then one condensed row that scrolls sideways (Filters, a divider, All / For Sale / For Swap pills, sort) with a right-edge fade. Tapping Filters there opens the rail inline above the grid and scrolls it into view below the stuck bar. The results bar under the category tabs then holds only the count and the chips.
**From 768px up** the banner returns, the bar stops sticking, and the type toggle sits beside the search. The results bar holds the Filters toggle (768–1023px only), the bold count, and sort, with chips beneath; chips scroll sideways below 768px and wrap above. From 1024px up, a 240px sticky left rail appears. The grid runs 2 columns with a 12px gap on phones, 3 columns from 768px (16px column and 24px row gaps), then 4 from 1024px. The item page splits 1.1fr to 0.9fr, with a sticky detail panel. On phones it adds a fixed bottom bar with the price and the contact action. The Post form pairs the fields with a 272px sticky live preview of the ID card. On phones the preview collapses into a disclosure. Spacing follows a 4px base, with 12px, 16px, 24px, and 32px as the recurring steps.

## Elevation & Depth

Depth is quiet and navy-tinted. Cards sit on Campus Paper with a hairline Ruled Line border and a soft two-layer shadow. Hover and focus lift them with a slightly deeper shadow as they swing. The slot punch is the one inset: a white pill with a faint inner shadow, cut into the strip.

### Shadow Vocabulary
- **Card rest** (`0 1px 2px rgb(6 36 63 / 0.06), 0 2px 6px rgb(6 36 63 / 0.04)`): every card, panel, filter rail, and the search field.
- **Card lift** (`0 6px 14px rgb(6 36 63 / 0.1), 0 2px 4px rgb(6 36 63 / 0.06)`): hovered or focused listing cards, and gallery arrow buttons.
- **Slot punch** (`inset 0 1px 1px rgb(6 36 63 / 0.35)`, or 0 1px 2px on large strips): the punch in every ID strip.
- **Bottom bar** (`0 -4px 12px rgb(6 36 63 / 0.06)`): the phone tab bar and the item page's fixed contact bar.

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
- **Style:** Wash Navy fill, navy text at 13px medium, a 20%-navy border, full pill, 32px tall for touch, and a trailing 14px close icon inside a 20px circle.
- **State:** each active filter is its own removable chip in the results bar; the whole chip removes it. Hover strengthens the border to 50% navy and tints the close circle. New chips scale in over 220ms. "Clear all" follows when two or more are active.

### Filter rail
- A white panel (10px corners, card-rest shadow) with a white header: "Filters" in 14px semibold ink, a navy count pill when rail filters are active, and a navy "Reset" text link that clears only the rail's own fields (school, size, price). It deliberately has no navy strip: supporting UI stays quiet so navy concentrates on cards, prices and actions.
- On phones the Filters toggle turns Wash Navy while open and the panel drops in (320ms, 6px, ease-out-expo).

### Loading
- Eight blank ID cards: a real navy strip (85%) with its white punch, an empty photo frame with a faint camera, and Ruled Line bars that pulse. The cards sway ±0.8deg on their lanyards (2.8s, sine, staggered 350ms), inside the reduced-motion guard. The count reads "Finding listings…". A refetch over existing results dims the grid to 60% instead.

### Empty states
- Two situations, two messages, one picture: a blank ID card hanging from a navy cord (authored SVG, same vocabulary as the listing card), swaying like the skeletons.
- **No listings yet:** a plus in the photo frame, "No listings yet." in the empty headline, one line of encouragement, and a large primary Post Item button.
- **No matches:** a magnifier in the photo frame, "No matches for that.", then the active filters as removable chips so one tap widens the search, and a secondary "Clear all filters" when two or more are active.

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
- **Top strip:** a full-bleed Logo Green (#0B813E) strip, by owner request. The wordmark is the official round logo in a 36px white circle plus "Buki-Finds" in 18px Geist bold. On phones (below 768px) the strip holds only the wordmark; navigation lives in the bottom tab bar. From 768px up: Browse and My Listings as 16px icon + 14px medium label in full white (faded white fails contrast on green), active marked by a 2px white underline bar and hover by a 50% one; then flush right the Post Item button in white with green text (a green button would vanish on the green bar) and the profile button (a person icon in a 15%-white circle plus the first name), or "Log in" with the person icon when signed out.
- **Phone tab bar (below 768px):** fixed to the bottom, white, Ruled Line top border, the bottom-bar shadow, padded for the iPhone home indicator (`env(safe-area-inset-bottom)`, with `viewport-fit=cover`). Four equal tabs: Browse, My Listings, Post Item, Profile, each a 24px icon over a 12px label, at least 56px tall; idle is muted medium, active is blue semibold with a 3px blue bar on the top edge and `aria-current="page"` (two cues, not colour alone). No chat tab: students contact sellers on Messenger. **Post Item** matches the desktop button exactly in wording, plus icon, green fill and 6px corners, shrunk to a 36x28 chip that sits level in the bar (not raised), so it reads as the same action on every device. While the session loads, Profile is a same-size inert placeholder, never a wrong link. An in-flow spacer keeps the last content row clear of it. The bar is not rendered on the item detail page, whose own price + Message Seller bar is the only bottom bar there.
- **Profile menu:** one set of contents, two presenters. Header is an ID strip (navy, slot punch, the name in 16px Geist semibold, the email in Strip Frost), then 48px rows with muted 20px icons (the Post Item plus in green): My Listings, Post Item, and after a rule, Log out (ink, not red: signing out is not destructive). Phones: a bottom sheet (16px top corners) over a 40% ink backdrop that slides up (280ms, ease-out-expo) and adds a full-width Close button; focus moves in and is kept in, Escape or a backdrop tap closes it, and focus returns to the Profile tab. Desktop: a 256px dropdown under the profile button (12px corners, card-lift shadow) that closes on outside click or Escape.
- **Icon rule:** the same glyph means the same place everywhere: compass = Browse, tag = My Listings, plus = Post Item, person = Profile / Log in, door-arrow = Log out.
- **Tabs:** category and status tabs are 14px medium in muted text, with a 3px bottom border in navy when selected.

### Phone feed card (below 768px)
By owner request, phones get a compact card instead of the ID card: a white card with 8px corners and a Ruled Line border (no shadow, no navy strip), a full-bleed square photo, then the price in Geist extra bold at 18px (or the green Swap mark), a one-line truncated 14px title, and one 12px muted line at the bottom: "Size M · school" (school falls back to condition). No No., no labeled fields, no "Wants" line; those live on the item page. The sold band and grayscale photo still apply. The skeleton follows the same shape.

### Listing ID Card (signature, 768px and up)
A vertical card. The navy strip (14px top padding, deliberately slim) holds a centered white slot punch (36px by 6px), the category in 13px medium Strip Frost, and "No. XXXXXX" in mono Strip Frost. The strip is the lanyard band, not a headline, so the price stays the loudest thing on the card. On phones the No. moves below the fields. Below the strip come a square photo frame, the blue price in Geist extra bold, a 2-line 15px title, and a dashed rule over labeled fields (Size, School, or Condition as a fallback). A swap listing shows a drawn Swap mark (two trading arrows plus "Swap", in the price style, in Logo Green) instead of a price, then a "Wants …" line under the title. Sold cards get a grayscale photo and a centered ink band at 85% opacity reading SOLD (14px bold, tracked 0.2em), and the price goes muted and struck through. The same card renders as a non-link live preview on the Post and Edit form, and as a pulsing skeleton with an 80% navy strip.

### ID Strip Header (signature)
The strip plus slot punch is reused as the header of the item detail panel (larger punch, 56px by 8px) and the login card. The filter rail uses a slim navy header without a punch.

### Lanyard Swing (signature motion)
On hover, focus-visible, and active, listing cards rotate -1.25deg around their top center and drop 2px. Even-numbered cards rotate +1.25deg. The rotation runs over 500ms and the shadow and border change over 300ms (the border warms to 25% navy), all on ease-out-expo `cubic-bezier(0.16, 1, 0.3, 1)`. While the card swings, its photo leans in to 104% inside the frame over 700ms. Loading skeletons and the empty-state card sway on the same lanyard idea. All of it sits inside a prefers-reduced-motion: no-preference guard, so reduced-motion users get static cards.

### Icons
There is one stroke set: a 24px grid with a 1.75 stroke and round caps and joins, drawn in currentColor at 16px to 20px, and 24px in the phone tab bar. The Messenger glyph is the one filled brand mark.

## Do's and Don'ts

### Do:
- **Do** give every card-like container a navy strip with a centered white slot punch and a No. where a listing is involved.
- **Do** print item facts as fields: a 12px muted sentence-case label over a bold ink value.
- **Do** set every price in Geist (`.card-type`), extra bold, tabular, blue, as the largest numeral on its card.
- **Do** tint every neutral and shadow toward navy ink (15 29 69).
- **Do** keep the owner's Title Case button wording exactly (Post Item, My Listings, Message Seller on Messenger, Mark as Sold, Mark as Available, Delete Listing, Email Seller, Save Changes).
- **Do** guard every motion with prefers-reduced-motion.

### Don't:
- **Don't** use green for anything but making or trading (see The Two Colours Rule), and don't add a third hue or the logo's gradients.
- **Don't** use red for anything but errors and destructive actions.
- **Don't** use gradients, glass or blur, or colored side borders on cards.
- **Don't** show any school's or government seal, crest, or official mark. This is an unofficial student project.
- **Don't** use uppercase or letter-spaced labels. The SOLD stamp is the only uppercase text.
- **Don't** use Geist Mono for anything but the listing No., and don't add a second typeface.
- **Don't** put words that look like a price in the price slot; a swap gets the drawn Swap mark.
- **Don't** fall back to the rounded-photo-card marketplace look from 768px up, where the ID card carries the brand. Phones are the owner's deliberate exception (see Phone feed card).
