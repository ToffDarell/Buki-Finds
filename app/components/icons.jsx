// One stroke icon set (24px grid, 1.75 stroke, round caps) so every icon matches.
function Icon({ children, className = 'h-5 w-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {children}
    </svg>
  )
}

export const SearchIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Icon>
)

export const FiltersIcon = (p) => (
  <Icon {...p}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </Icon>
)

export const PlusIcon = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)

export const DownloadIcon = (p) => (
  <Icon {...p}>
    <path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14" />
  </Icon>
)

export const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
)

export const ChevronLeftIcon = (p) => (
  <Icon {...p}>
    <path d="m15 5-7 7 7 7" />
  </Icon>
)

export const ChevronRightIcon = (p) => (
  <Icon {...p}>
    <path d="m9 5 7 7-7 7" />
  </Icon>
)

export const ArrowLeftIcon = (p) => (
  <Icon {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Icon>
)

export const MailIcon = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
    <path d="m4 7 8 6 8-6" />
  </Icon>
)

export const PencilIcon = (p) => (
  <Icon {...p}>
    <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" />
    <path d="m14.5 7.5 2 2" />
  </Icon>
)

export const TrashIcon = (p) => (
  <Icon {...p}>
    <path d="M4.5 7h15M10 11v6M14 11v6M6.5 7l1 12.5h9l1-12.5M9.5 7V4.5h5V7" />
  </Icon>
)

export const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
)

export const UndoIcon = (p) => (
  <Icon {...p}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </Icon>
)

export const CameraIcon = (p) => (
  <Icon {...p}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
    <circle cx="12" cy="13" r="3.5" />
  </Icon>
)

export const EyeIcon = (p) => (
  <Icon {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)

export const EyeOffIcon = (p) => (
  <Icon {...p}>
    <path d="M9.9 5.8A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.6 6.9C4 8.6 2.5 12 2.5 12S6 18.5 12 18.5c1.7 0 3.2-.5 4.5-1.2" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
  </Icon>
)

export const TruckIcon = (p) => (
  <Icon {...p}>
    <path d="M3 6.5h11v9.5H3zM14 9.5h3.5l3 3.2V16H14" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </Icon>
)

export const ImageIcon = (p) => (
  <Icon {...p}>
    <rect x="4" y="4.5" width="16" height="15" rx="2" />
    <circle cx="9" cy="9.5" r="1.5" />
    <path d="m20 15.5-4.5-4.5L6 19.5" />
  </Icon>
)

// Navigation set: the same glyph stands for the same place on the phone tab bar and the desktop navbar.
export const BrowseIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m15.2 8.8-1.9 4.5-4.5 1.9 1.9-4.5z" />
  </Icon>
)

export const ListingsIcon = (p) => (
  <Icon {...p}>
    <path d="M3.5 12.1V5a1.5 1.5 0 0 1 1.5-1.5h7.1a1.5 1.5 0 0 1 1.06.44l7.4 7.4a1.5 1.5 0 0 1 0 2.12l-7.1 7.1a1.5 1.5 0 0 1-2.12 0l-7.4-7.4a1.5 1.5 0 0 1-.44-1.06Z" />
    <circle cx="8.25" cy="8.25" r="1.25" />
  </Icon>
)

export const UserIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="3.75" />
    <path d="M4.75 20a7.25 7.25 0 0 1 14.5 0" />
  </Icon>
)

export const LogOutIcon = (p) => (
  <Icon {...p}>
    <path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14" />
    <path d="M10 12h10M16.5 8.5 20 12l-3.5 3.5" />
  </Icon>
)

// Notifications.
export const BellIcon = (p) => (
  <Icon {...p}>
    <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" />
    <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
  </Icon>
)

// Saved listings. Pass fill="currentColor" for the saved (filled) state.
export const HeartIcon = (p) => (
  <Icon {...p}>
    <path d="M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20Z" />
  </Icon>
)

export const ShareIcon = (p) => (
  <Icon {...p}>
    <path d="M12 15V3.75M8 7.5l4-3.75 4 3.75" />
    <path d="M8.5 10.5H6.75A1.75 1.75 0 0 0 5 12.25v6A1.75 1.75 0 0 0 6.75 20h10.5A1.75 1.75 0 0 0 19 18.25v-6a1.75 1.75 0 0 0-1.75-1.75H15.5" />
  </Icon>
)

export const FlagIcon = (p) => (
  <Icon {...p}>
    <path d="M5.5 21V4.5M5.5 4.5h11l-2.25 4 2.25 4h-11" />
  </Icon>
)

// Copy a ready-made Facebook post.
export const CopyIcon = (p) => (
  <Icon {...p}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="1.75" />
    <path d="M15.5 8.5V6.25a1.75 1.75 0 0 0-1.75-1.75h-7.5A1.75 1.75 0 0 0 4.5 6.25v7.5a1.75 1.75 0 0 0 1.75 1.75H8.5" />
  </Icon>
)

// Meet-up safety tips.
export const ShieldIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3.5 5 6.25v5.25c0 4.4 3 7.75 7 9 4-1.25 7-4.6 7-9V6.25Z" />
    <path d="m9 12 2.25 2.25L15.5 10" />
  </Icon>
)

// Price-drop notification.
export const PriceDownIcon = (p) => (
  <Icon {...p}>
    <path d="M12 4.5v15M6.5 14 12 19.5 17.5 14" />
  </Icon>
)

// "Still available?" notification.
export const ClockIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
)

// Pass fill="currentColor" for a filled star.
export const StarIcon = (p) => (
  <Icon {...p}>
    <path d="m12 3.75 2.5 5.1 5.6.8-4.05 3.95.95 5.6L12 16.55 6.99 19.2l.96-5.6L3.9 9.65l5.6-.8Z" />
  </Icon>
)

export const PinIcon = (p) => (
  <Icon {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.25" />
  </Icon>
)

// Two arrows trading places: marks listings that are for swap.
export const SwapIcon = (p) => (
  <Icon {...p}>
    <path d="M4 8h13M13.5 4.5 17 8l-3.5 3.5" />
    <path d="M20 16H7M10.5 12.5 7 16l3.5 3.5" />
  </Icon>
)

// Brand glyph: filled, not stroked.
export const InstagramIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const MessengerIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.14.26.35.27.57l.05 1.78a.8.8 0 0 0 1.12.71l1.98-.87c.17-.08.36-.09.54-.04.91.25 1.87.38 2.9.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2Zm6 7.46-2.94 4.66a1.5 1.5 0 0 1-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63L8.92 9.88a1.5 1.5 0 0 1 2.17-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.63Z" />
  </svg>
)
