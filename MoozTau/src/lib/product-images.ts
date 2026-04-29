type ProductImageSource = {
  id?: number | string | null;
  model?: string | null;
  name?: string | null;
  category?: string | null;
  image_url?: string | null;
};

type CategoryTheme = {
  bgFrom: string;
  bgTo: string;
  bodyFill: string;
  bodyStroke: string;
  accent: string;
  label: string;
  shape: "builtin" | "outdoor" | "freezer" | "unit" | "door" | "panel";
};

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  BUILT_IN:     { bgFrom: "#E0F2FE", bgTo: "#F8FAFC", bodyFill: "#F1F5F9", bodyStroke: "#64748B", accent: "#60A5FA", label: "BUILT-IN",  shape: "builtin" },
  OUTDOOR:      { bgFrom: "#BAE6FD", bgTo: "#E0F2FE", bodyFill: "#E2E8F0", bodyStroke: "#334155", accent: "#0EA5E9", label: "OUTDOOR",   shape: "outdoor" },
  FREEZER:      { bgFrom: "#C7D2FE", bgTo: "#E0E7FF", bodyFill: "#E0E7FF", bodyStroke: "#4F46E5", accent: "#6366F1", label: "FREEZER",   shape: "freezer" },
  UNIT:         { bgFrom: "#FEF3C7", bgTo: "#FFFBEB", bodyFill: "#F1F5F9", bodyStroke: "#475569", accent: "#F59E0B", label: "UNIT",      shape: "unit" },
  DOOR:         { bgFrom: "#FCE7F3", bgTo: "#FDF2F8", bodyFill: "#F8FAFC", bodyStroke: "#94A3B8", accent: "#DB2777", label: "DOOR",      shape: "door" },
  WITHOUT_UNIT: { bgFrom: "#DCFCE7", bgTo: "#F0FDF4", bodyFill: "#F1F5F9", bodyStroke: "#64748B", accent: "#16A34A", label: "PANEL",     shape: "panel" },
};

const DEFAULT_THEME: CategoryTheme = {
  bgFrom: "#F1F5F9", bgTo: "#FFFFFF", bodyFill: "#E2E8F0", bodyStroke: "#64748B", accent: "#64748B", label: "PRODUCT", shape: "builtin",
};

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

function hslAccent(hash: number): string {
  const hue = hash % 360;
  const sat = 55 + (hash % 20);
  const light = 50 + ((hash >> 3) % 12);
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

function shapeSvg(theme: CategoryTheme, hash: number): string {
  const a = theme.accent;
  const b = theme.bodyFill;
  const s = theme.bodyStroke;
  const tint = hslAccent(hash);
  switch (theme.shape) {
    case "builtin": {
      const wide = (hash & 1) === 0;
      const innerW = wide ? 520 : 380;
      const innerX = (800 - innerW) / 2;
      return `
        <rect x="${innerX - 20}" y="100" width="${innerW + 40}" height="360" rx="22" fill="${b}" stroke="${s}" stroke-width="8"/>
        <rect x="${innerX}" y="130" width="${innerW / 2 - 10}" height="300" rx="14" fill="#DBEAFE" stroke="${a}" stroke-width="5"/>
        <rect x="${innerX + innerW / 2 + 10}" y="130" width="${innerW / 2 - 10}" height="300" rx="14" fill="#DBEAFE" stroke="${a}" stroke-width="5"/>
        <circle cx="${innerX + innerW / 2 - 18}" cy="280" r="10" fill="#0F172A"/>
        <circle cx="${innerX + innerW / 2 + 18}" cy="280" r="10" fill="#0F172A"/>
        <rect x="${innerX + 30}" y="450" width="${innerW - 60}" height="12" rx="6" fill="${tint}"/>
      `;
    }
    case "outdoor": {
      return `
        <rect y="430" width="800" height="170" fill="#BBF7D0"/>
        <rect x="140" y="140" width="520" height="300" rx="18" fill="${b}" stroke="${s}" stroke-width="10"/>
        <rect x="180" y="185" width="190" height="200" rx="12" fill="#F8FAFC" stroke="${a}" stroke-width="6"/>
        <rect x="410" y="180" width="210" height="210" rx="12" fill="#DBEAFE" stroke="${a}" stroke-width="6"/>
        <path d="M115 140H680L625 95H170L115 140Z" fill="#334155"/>
        <rect x="520" y="105" width="70" height="22" rx="11" fill="${tint}"/>
        <circle cx="250" cy="470" r="18" fill="#475569"/>
        <circle cx="540" cy="470" r="18" fill="#475569"/>
      `;
    }
    case "freezer": {
      return `
        <rect x="215" y="100" width="370" height="370" rx="20" fill="${b}" stroke="${s}" stroke-width="8"/>
        <rect x="245" y="135" width="310" height="300" rx="14" fill="#C7D2FE" stroke="${a}" stroke-width="5"/>
        <g stroke="${s}" stroke-width="3" stroke-linecap="round">
          <path d="M400 190V370"/><path d="M310 280H490"/>
          <path d="M340 220L460 340"/><path d="M460 220L340 340"/>
        </g>
        <circle cx="400" cy="280" r="14" fill="${tint}"/>
      `;
    }
    case "unit": {
      const fins = 5 + (hash % 4);
      let finLines = "";
      for (let i = 0; i < fins; i++) {
        const x = 240 + i * ((320) / fins);
        finLines += `<line x1="${x}" y1="180" x2="${x}" y2="380" stroke="${s}" stroke-width="4"/>`;
      }
      return `
        <rect x="200" y="150" width="400" height="260" rx="16" fill="${b}" stroke="${s}" stroke-width="8"/>
        <rect x="230" y="170" width="340" height="220" rx="10" fill="#F8FAFC"/>
        ${finLines}
        <circle cx="400" cy="420" r="40" fill="${b}" stroke="${s}" stroke-width="6"/>
        <circle cx="400" cy="420" r="18" fill="${tint}"/>
      `;
    }
    case "door": {
      const handleSide = (hash & 2) === 0 ? "right" : "left";
      const hx = handleSide === "right" ? 540 : 275;
      return `
        <rect x="260" y="80" width="280" height="440" rx="14" fill="${b}" stroke="${s}" stroke-width="8"/>
        <rect x="285" y="105" width="230" height="390" rx="8" fill="#F8FAFC" stroke="${a}" stroke-width="4"/>
        <rect x="${hx - 8}" y="290" width="18" height="50" rx="9" fill="${tint}"/>
        <rect x="305" y="420" width="190" height="10" rx="5" fill="${s}"/>
      `;
    }
    case "panel": {
      const stripes = 6 + (hash % 4);
      let bars = "";
      for (let i = 0; i < stripes; i++) {
        const y = 180 + i * (220 / stripes);
        bars += `<rect x="160" y="${y}" width="480" height="${220 / stripes - 4}" fill="${i % 2 === 0 ? "#F8FAFC" : tint}" opacity="${i % 2 === 0 ? 1 : 0.35}"/>`;
      }
      return `
        <rect x="140" y="160" width="520" height="260" rx="12" fill="${b}" stroke="${s}" stroke-width="8"/>
        ${bars}
        <rect x="140" y="160" width="520" height="260" rx="12" fill="none" stroke="${s}" stroke-width="8"/>
      `;
    }
  }
}

function buildSvg(product: ProductImageSource): string {
  const theme = CATEGORY_THEMES[product.category ?? ""] ?? DEFAULT_THEME;
  const seedKey = String(product.id ?? product.model ?? product.name ?? "default");
  const hash = hashString(seedKey);
  const labelText = (product.model ?? product.name ?? theme.label).slice(0, 28);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none">
    <defs>
      <linearGradient id="bg-${hash}" x1="0" y1="0" x2="800" y2="600" gradientUnits="userSpaceOnUse">
        <stop stop-color="${theme.bgFrom}"/><stop offset="1" stop-color="${theme.bgTo}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#bg-${hash})"/>
    ${shapeSvg(theme, hash)}
    <text x="60" y="548" fill="#0F172A" font-size="28" font-family="Arial, sans-serif" font-weight="700">${escapeXml(labelText)}</text>
    <text x="60" y="578" fill="#64748B" font-size="18" font-family="Arial, sans-serif" font-weight="500">${escapeXml(theme.label)}</text>
  </svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => (
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === '"' ? "&quot;" : "&apos;"
  ));
}

export function getProductImageUrl(product: ProductImageSource): string {
  if (product.image_url) return product.image_url;
  const svg = buildSvg(product);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
