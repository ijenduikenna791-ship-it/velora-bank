"use client";

/*
  Velora payment-method icons — clean, recognizable colored monogram tiles
  in each method's brand colours. These are simple original monograms (a
  letter/symbol on a coloured rounded tile), NOT reproductions of the
  official brand logos. Each accepts { size, className }.
*/

function Tile({ bg, size = 22, radius = 6, className = "", children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx={radius} fill={bg} />
      {children}
    </svg>
  );
}

function Glyph({ ch, color = "#fff", size = 13, weight = 800 }) {
  return (
    <text
      x="12"
      y="12.7"
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
      fontWeight={weight}
      fontSize={size}
      fill={color}
    >
      {ch}
    </text>
  );
}

export const PayPalIcon = (p) => (
  <Tile bg="#0070E0" {...p}>
    <Glyph ch="P" />
  </Tile>
);

export const BitcoinBrandIcon = (p) => (
  <Tile bg="#F7931A" radius={999} {...p}>
    <Glyph ch="₿" />
  </Tile>
);

export const SkrillIcon = (p) => (
  <Tile bg="#7B2E8E" {...p}>
    <Glyph ch="S" />
  </Tile>
);

export const CashAppIcon = (p) => (
  <Tile bg="#00C244" radius={999} {...p}>
    <Glyph ch="$" />
  </Tile>
);

export const ZelleIcon = (p) => (
  <Tile bg="#6D1ED4" {...p}>
    <Glyph ch="Z" />
  </Tile>
);

export const RevolutIcon = (p) => (
  <Tile bg="#13151A" {...p}>
    <Glyph ch="R" />
  </Tile>
);

export const VenmoIcon = (p) => (
  <Tile bg="#008CFF" {...p}>
    <Glyph ch="V" />
  </Tile>
);

export const LocalBankBrandIcon = (p) => (
  <Tile bg="#64748B" {...p}>
    <g stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M6 10.5 12 6.5l6 4M7 10.5h10M8 10.8V16M11 10.8V16M13 10.8V16M16 10.8V16M6.5 16h11M6 18h12" />
    </g>
  </Tile>
);

export const WireBrandIcon = (p) => (
  <Tile bg="#475569" {...p}>
    <g stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <circle cx="12" cy="12" r="6" />
      <path d="M6 12h12M12 6c2 2 2 10 0 12M12 6c-2 2-2 10 0 12" />
    </g>
  </Tile>
);

// channel id → branded icon
export const BRAND_CHANNEL_ICONS = {
  local: LocalBankBrandIcon,
  wire: WireBrandIcon,
  paypal: PayPalIcon,
  bitcoin: BitcoinBrandIcon,
  skrill: SkrillIcon,
  cashapp: CashAppIcon,
  zelle: ZelleIcon,
  revolut: RevolutIcon,
  venmo: VenmoIcon,
};
