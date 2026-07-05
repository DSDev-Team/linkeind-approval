import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, strokeWidth = 1.75, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...rest,
  };
}

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m20 6-11 11-4-4" /></svg>
);
export const CheckCircleIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
);
export const XIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
export const XCircleIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
);
export const CalendarIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);
export const ImageIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.5-3.5L7 21" /></svg>
);
export const CarouselIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="6" y="4" width="12" height="16" rx="2" /><path d="M3 8v8M21 8v8" /></svg>
);
export const VideoIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m22 8-6 4 6 4V8Z" /></svg>
);
export const DocumentIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></svg>
);
export const TextIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M17 6.1H3M21 12.1H3M15.1 18H3" /></svg>
);
export const LockIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
);
export const LogoutIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></svg>
);
export const PlusIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const ChevronDownIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
);
export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m9 18 6-6-6-6" /></svg>
);
export const EditIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
);
export const RefreshIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.1 2.36L21 8" /><path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.1-2.36L3 16" /><path d="M3 21v-5h5" /></svg>
);
export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
);
export const AlertIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><path d="M12 9v4M12 17h.01" /></svg>
);
export const InboxIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" /></svg>
);
export const HashIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" /></svg>
);
export const UserIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);
export const MoonIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
);
export const SunIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
);
export const SparkleIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3v4M12 17v4M5 12H1M23 12h-4M6.34 6.34 4.93 4.93M19.07 19.07l-1.41-1.41M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /><circle cx="12" cy="12" r="3.2" /></svg>
);
export const SendIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
);
export const UndoIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 7v6h6" /><path d="M3 13a9 9 0 1 0 3-7.7L3 8" /></svg>
);

export function visualTypeIcon(type: string, size = 16) {
  switch (type) {
    case "image": return <ImageIcon size={size} />;
    case "carousel": return <CarouselIcon size={size} />;
    case "video": return <VideoIcon size={size} />;
    case "document": return <DocumentIcon size={size} />;
    default: return <TextIcon size={size} />;
  }
}