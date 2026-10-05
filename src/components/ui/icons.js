"use client";

/*
  Velora icon set — lightweight, dependency-free stroke icons in the
  Hugeicons visual style (24×24, 1.8 stroke, round caps). No emojis.

  Every icon takes { size, className, strokeWidth, ...rest } and inherits
  color via `currentColor`, so `text-brand`, `text-muted`, etc. all work.

  PREFER THE REAL PACKAGE? Run `npm i hugeicons-react` and replace imports,
  e.g.  import { Wallet01Icon as Wallet } from "hugeicons-react";
  The names below map 1:1 to common Hugeicons concepts.
*/

function Svg({ size = 22, strokeWidth = 1.8, className = "", children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const GridIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </Svg>
);

export const SendIcon = (p) => (
  <Svg {...p}>
    <path d="M10.5 13.5 21 3" />
    <path d="M21 3 14.5 21a.6.6 0 0 1-1.1.05L10.5 13.5 3.4 10.6a.6.6 0 0 1 .05-1.1L21 3Z" />
  </Svg>
);

export const ReceiptIcon = (p) => (
  <Svg {...p}>
    <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z" />
    <path d="M9 7h6M9 11h6M9 15h4" />
  </Svg>
);

export const CardIcon = (p) => (
  <Svg {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="M2.5 9.5h19M6 15h4" />
  </Svg>
);

export const SettingsIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
  </Svg>
);

export const LogoutIcon = (p) => (
  <Svg {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 17l-5-5 5-5M4 12h11" />
  </Svg>
);

export const UsersIcon = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 6.1M18 20a6 6 0 0 0-3-5.2" />
  </Svg>
);

export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </Svg>
);

export const PlusIcon = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const ChevronDownIcon = (p) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const ChevronRightIcon = (p) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);

export const ArrowLeftIcon = (p) => (
  <Svg {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

export const ArrowRightIcon = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </Svg>
);

export const ArrowUpRightIcon = (p) => (
  <Svg {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Svg>
);

export const ArrowDownLeftIcon = (p) => (
  <Svg {...p}>
    <path d="M17 7 7 17M16 17H7V8" />
  </Svg>
);

export const CheckIcon = (p) => (
  <Svg {...p}>
    <path d="m5 12 5 5L20 7" />
  </Svg>
);

export const CheckCircleIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 2.5 2.5L16 9" />
  </Svg>
);

export const CloseIcon = (p) => (
  <Svg {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

export const SunIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
);

export const MoonIcon = (p) => (
  <Svg {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </Svg>
);

export const GlobeIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
  </Svg>
);

export const ShieldIcon = (p) => (
  <Svg {...p}>
    <path d="M12 2.5 20 6v6c0 5-3.4 8-8 9.5C7.4 20 4 17 4 12V6l8-3.5Z" />
    <path d="m8.5 12 2.4 2.4L15.5 10" />
  </Svg>
);

export const LockIcon = (p) => (
  <Svg {...p}>
    <rect x="4.5" y="10" width="15" height="11" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15.5" r="1.3" />
  </Svg>
);

export const MailIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </Svg>
);

export const EyeIcon = (p) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const EyeOffIcon = (p) => (
  <Svg {...p}>
    <path d="M10.6 6.1A8.6 8.6 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-3 3.6M6.2 7.9A16 16 0 0 0 2.5 12S6 18 12 18a8.7 8.7 0 0 0 3.3-.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
  </Svg>
);

export const BitcoinIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 7.5v9M11 7.5v-1.5M11 18v-1.5M9.5 12h4a2 2 0 1 0 0-4h-4M9.5 12h4.3a2.2 2.2 0 1 1 0 4.4H9.5" />
  </Svg>
);

export const BankIcon = (p) => (
  <Svg {...p}>
    <path d="M3 9.5 12 4l9 5.5M4.5 9.5h15M5.5 9.5V18M9.5 9.5V18M14.5 9.5V18M18.5 9.5V18M3.5 18h17M3 21h18" />
  </Svg>
);

export const WalletIcon = (p) => (
  <Svg {...p}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H17a1 1 0 0 1 1 1v1.5" />
    <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
    <path d="M16 13.2h2.5" />
  </Svg>
);

export const BellIcon = (p) => (
  <Svg {...p}>
    <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6.2.3.5 0 1.3-.7 1.3H4.7c-.7 0-1-.8-.7-1.3C4.5 14.5 6 13 6 9Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Svg>
);

export const MenuIcon = (p) => (
  <Svg {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Svg>
);

export const CopyIcon = (p) => (
  <Svg {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2.5" />
    <path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" />
  </Svg>
);

export const SparklesIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3l1.8 4.9L18.7 9l-4.9 1.8L12 15l-1.8-4.2L5.3 9l4.9-1.1L12 3Z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
  </Svg>
);

export const TrendingUpIcon = (p) => (
  <Svg {...p}>
    <path d="M3 17l6-6 4 4 7-7" />
    <path d="M17 8h4v4" />
  </Svg>
);

export const BoltIcon = (p) => (
  <Svg {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </Svg>
);

export const DollarIcon = (p) => (
  <Svg {...p}>
    <path d="M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.9 7 7s2.2 3 5 3 5 1 5 3-2.2 3.5-5 3.5-5-1.1-5-3" />
  </Svg>
);

export const RepeatIcon = (p) => (
  <Svg {...p}>
    <path d="M4 9a5 5 0 0 1 5-5h8l-2.5-2.5M20 15a5 5 0 0 1-5 5H7l2.5 2.5" />
  </Svg>
);

export const PhoneIcon = (p) => (
  <Svg {...p}>
    <path d="M6.5 3h3l1.5 4-2 1.3a12 12 0 0 0 5 5l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" />
  </Svg>
);

export const DownloadIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3v12M8 11l4 4 4-4M5 21h14" />
  </Svg>
);

export const ChartIcon = (p) => (
  <Svg {...p}>
    <path d="M4 20V4M4 20h16" />
    <path d="M8 16v-4M12 16V8M16 16v-6" />
  </Svg>
);

export const UserIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Svg>
);

export const AtIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M15.5 12v1.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.3 6.7" />
  </Svg>
);

export const HashIcon = (p) => (
  <Svg {...p}>
    <path d="M5 9h14M5 15h14M9 4l-1 16M16 4l-1 16" />
  </Svg>
);

// Channel → icon map used by the Send Money tabs.
export const CHANNEL_ICONS = {
  local: BankIcon,
  wire: GlobeIcon,
  paypal: WalletIcon,
  bitcoin: BitcoinIcon,
  skrill: BoltIcon,
  cashapp: DollarIcon,
  zelle: SendIcon,
  revolut: RepeatIcon,
  venmo: AtIcon,
};
