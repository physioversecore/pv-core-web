export interface Partner {
  icon: string;
  name: string;
}

export interface ImpactStat {
  value: number;
  suffix: string;
  label: string;
  isRating?: boolean;
}

export interface ServiceItem {
  iconName: string;
  title: string;
  desc: string;
  live?: boolean;
}

export const partners: Partner[] = [
  { icon: "\u{1F3E5}", name: "Grande Hospital" },
  { icon: "\u{1F3E5}", name: "Norvic Hospital" },
  { icon: "\u{1F3E5}", name: "Bir Hospital" },
  { icon: "\u2713", name: "Nepal Medical Council" },
  { icon: "\u{1F4F0}", name: "Kathmandu Post" },
  { icon: "\u{1F4F0}", name: "Himal Khabar" },
  { icon: "\u{1F396}", name: "ISO 9001" },
  { icon: "\u{1F4B3}", name: "eSewa \u00B7 Khalti" },
];

export const impactStats: ImpactStat[] = [
  { value: 12400, suffix: "+", label: "Home visits completed" },
  { value: 180, suffix: "+", label: "Verified therapists" },
  { value: 48, suffix: "\u2605", label: "Average rating \u00D7 10", isRating: true },
  { value: 6, suffix: "", label: "Cities served" },
];

export const rehabServices: ServiceItem[] = [
  { iconName: "Activity", title: "Sports Injury Rehab", desc: "ACL, rotator cuff, sprain recovery." },
  { iconName: "HeartPulse", title: "Post-Surgery Rehab", desc: "Knee, hip, and joint replacement." },
  { iconName: "Brain", title: "Neuro Rehab", desc: "Stroke, Parkinson's, spinal cord." },
  { iconName: "Baby", title: "Pediatric & Elderly", desc: "Developmental delays, geriatric care." },
];

export const otherServices: ServiceItem[] = [
  { iconName: "Stethoscope", title: "Home-visit Booking", desc: "Therapists who come to you.", live: true },
  { iconName: "ShoppingBag", title: "Equipment Rental", desc: "Wheelchairs, crutches, TENS." },
  { iconName: "Pill", title: "Medicines", desc: "Recovery medications delivered." },
  { iconName: "Apple", title: "Recovery Nutrition", desc: "Supplements & meal plans." },
];
