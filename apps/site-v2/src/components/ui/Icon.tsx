import type { SVGProps } from "react";

const PATHS: Record<string, React.ReactNode> = {
  home: <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9.5z"/>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></>,
  gear: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.5-2.3 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.5 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-1a7 7 0 002 1.2L10 21h4l.5-2.6a7 7 0 002-1.2l2.3 1 2-3.5-2-1.5c.1-.4.1-.8.1-1.2z"/></>,
  bell: <path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6zM10 19a2 2 0 004 0"/>,
  chevLeft: <path d="M15 19l-7-7 7-7"/>,
  chevRight: <path d="M9 5l7 7-7 7"/>,
  chevDown: <path d="M6 9l6 6 6-6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  people: <><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15 20c0-2.2 1.8-4 4-4"/></>,
  check: <path d="M5 12l5 5L20 7"/>,
  checkCircle: <><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></>,
  x: <path d="M6 6l12 12M18 6L6 18"/>,
  xCircle: <><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></>,
  tag: <><path d="M20 12l-8 8-9-9V3h8l9 9z"/><circle cx="7.5" cy="7.5" r="1.2"/></>,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z"/></>,
  logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></>,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>,
  phone: <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1 1 .3 1.8.6 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.8.5 2.7.6a2 2 0 011.7 2z"/>,
  building: <><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/></>,
  edit: <path d="M4 20h4l10-10-4-4L4 16v4zM13 5l4 4"/>,
  trash: <><path d="M4 6h16M9 6V4h6v2M6 6l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13"/></>,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9a1 1 0 001 1h12a1 1 0 001-1v-9M12 8V4m-5 4s-1-4 2-4 3 4 3 4m0 0s1-4 4-4-1 4-1 4M12 8v14"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  ticket: <path d="M4 8a2 2 0 002-2h12a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H6a2 2 0 00-2-2v-2a2 2 0 000-4V8z"/>,
  star: <path d="M12 3l2.9 6 6.6 1-4.8 4.7 1.1 6.6L12 18l-5.8 3.3 1.1-6.6L2.5 10l6.6-1L12 3z"/>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>,
  cookie: <><circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1" fill="currentColor"/><circle cx="13" cy="14" r="1" fill="currentColor"/><circle cx="15" cy="8" r="1" fill="currentColor"/></>,
  wallet: <><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M17 15h2"/></>,
  arrowUp: <path d="M12 19V5M5 12l7-7 7 7"/>,
  arrowDown: <path d="M12 5v14M19 12l-7 7-7-7"/>,
  receipt: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6M9 16h4"/>,
  pin: <><path d="M12 21s-7-6-7-12a7 7 0 0114 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 115 0c0 1.5-2.5 2-2.5 4M12 17h.01"/></>,
  wifi: <><path d="M2 8.5c3.1-3 6.2-4.5 10-4.5s6.9 1.5 10 4.5"/><path d="M6 12.5c1.8-1.8 3.8-2.7 6-2.7s4.2.9 6 2.7"/><path d="M10 16.5c.6-.6 1.2-.9 2-.9s1.4.3 2 .9"/><circle cx="12" cy="20" r="1" fill="currentColor"/></>,
  coffee: <><path d="M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z"/><path d="M6 2v3M10 2v3M14 2v3"/></>,
};

export type IconName = keyof typeof PATHS;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  sw?: number;
}

export function Icon({
  name,
  size = 20,
  sw = 1.7,
  fill = "none",
  stroke = "currentColor",
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {PATHS[name] ?? null}
    </svg>
  );
}
