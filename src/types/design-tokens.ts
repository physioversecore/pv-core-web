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
    voltageLime: string;
    cyanSpark: string;
    midAbyss: string;
    carbonInk: string;
    pureWhite: string;
    ash: string;
    abyssSoft: string;
    abyssMid: string;
    abyssDeep: string;
    inkSoft: string;
    inkMuted: string;
    inkFaint: string;
    inkDim: string;
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
    voltageLime: "#d3fb52",
    cyanSpark: "#7af3ff",
    midAbyss: "#052326",
    carbonInk: "#14151c",
    pureWhite: "#ffffff",
    ash: "#666666",
    abyssSoft: "#1e3a2b",
    abyssMid: "#112720",
    abyssDeep: "#0a1815",
    inkSoft: "#e7e7ea",
    inkMuted: "#9a9aa3",
    inkFaint: "#85858d",
    inkDim: "#b0b0b7",
  },
  typography: {
    fontDisplay: '"Fraunces", ui-serif, Georgia, serif',
    fontSans: '"Inter", ui-sans-serif, system-ui, sans-serif',
    fontMono: '"IBM Plex Mono", ui-monospace, monospace',
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
  voltageLime: "Voltage Lime (Accent)",
  cyanSpark: "Cyan Spark",
  midAbyss: "Mid Abyss (Dark)",
  carbonInk: "Carbon Ink",
  pureWhite: "Pure White",
  ash: "Ash",
  abyssSoft: "Abyss Soft",
  abyssMid: "Abyss Mid",
  abyssDeep: "Abyss Deep",
  inkSoft: "Ink Soft",
  inkMuted: "Ink Muted",
  inkFaint: "Ink Faint",
  inkDim: "Ink Dim",
};
