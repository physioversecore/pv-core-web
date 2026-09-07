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
    primary: "#D77C5F",
    primaryHover: "#c15f43",
    primaryLight: "#f9e6df",
    primaryDark: "#b05222",
    secondary: "#16443B",
    secondaryHover: "#0d2925",
    background: "#F7F5EF",
    surface: "#ECEFE9",
    card: "#ffffff",
    text: "#1B2523",
    textLight: "#4c5a55",
    textMuted: "#68736f",
    textInverse: "#ffffff",
    border: "#e5e2da",
    borderLight: "#f0ede7",
    divider: "#d5d0c5",
    danger: "#C84B4B",
    success: "#16a34a",
    warning: "#f59e0b",
    info: "#0ea5e9",
    voltageLime: "#d77c5f",
    cyanSpark: "#c4d3c2",
    midAbyss: "#16443b",
    carbonInk: "#0d2925",
    pureWhite: "#ffffff",
    ash: "#68736f",
    abyssSoft: "#2a5047",
    abyssMid: "#123b34",
    abyssDeep: "#081411",
    inkSoft: "#edede9",
    inkMuted: "#a8aaa4",
    inkFaint: "#858587",
    inkDim: "#bcbdb7",
  },
  typography: {
    fontDisplay: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    fontSans: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    fontMono: '"Manrope", ui-sans-serif, system-ui, sans-serif',
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
  voltageLime: "Terracotta (Accent / CTA)",
  cyanSpark: "Mineral Sage",
  midAbyss: "Deep Forest (Dark)",
  carbonInk: "Evergreen Ink",
  pureWhite: "Pure White",
  ash: "Stone",
  abyssSoft: "Abyss Soft",
  abyssMid: "Abyss Mid",
  abyssDeep: "Abyss Deep",
  inkSoft: "Ink Soft",
  inkMuted: "Ink Muted",
  inkFaint: "Ink Faint",
  inkDim: "Ink Dim",
};
