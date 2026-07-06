import en from "./en";
import ne from "./ne";

export const translations = { en, ne } as const;
export type Lang = keyof typeof translations;
