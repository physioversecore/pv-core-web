export interface DesignTokens {
  colors: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryHover: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textLight: string;
    textMuted: string;
    textInverse: string;
    border: string;
    borderLight: string;
    divider: string;
    danger: string;
    success: string;
    warning: string;
    info: string;
  };
  typography: {
    fontDisplay: string;
    fontSans: string;
    fontMono: string;
  };
  radii: {
    base: string;
  };
}

export const DEFAULT_TOKENS: DesignTokens = {
  colors: {
    primary: "#E2962F",
    primaryHover: "#c98124",
    primaryLight: "#fef4e8",
    primaryDark: "#b3711d",
    secondary: "#2F5D50",
    secondaryHover: "#22443a",
    background: "#FBFBF8",
    surface: "#EEF1ED",
    card: "#ffffff",
    text: "#1E2A2E",
    textLight: "#4A5854",
    textMuted: "#9ca3af",
    textInverse: "#ffffff",
    border: "#e5e7eb",
    borderLight: "#f1f5f9",
    divider: "#d1d5db",
    danger: "#C84B4B",
    success: "#16a34a",
    warning: "#f59e0b",
    info: "#0ea5e9",
  },
  typography: {
    fontDisplay: 'var(--font-display-loaded), "Anybody", ui-sans-serif, system-ui, sans-serif',
    fontSans: 'var(--font-sans-loaded), "Archivo Narrow", ui-sans-serif, system-ui, sans-serif',
    fontMono: 'var(--font-mono-loaded), "Space Grotesk", ui-monospace, monospace',
  },
  radii: {
    base: "1rem",
  },
};

export type TokenColorKey = keyof DesignTokens["colors"];
export type TokenFontKey = keyof DesignTokens["typography"];

export const COLOR_LABELS: Record<TokenColorKey, string> = {
  primary: "Primary",
  primaryHover: "Primary Hover",
  primaryLight: "Primary Light",
  primaryDark: "Primary Dark",
  secondary: "Secondary",
  secondaryHover: "Secondary Hover",
  background: "Background",
  surface: "Surface",
  card: "Card",
  text: "Text",
  textLight: "Text Light",
  textMuted: "Text Muted",
  textInverse: "Text Inverse",
  border: "Border",
  borderLight: "Border Light",
  divider: "Divider",
  danger: "Danger",
  success: "Success",
  warning: "Warning",
  info: "Info",
};
