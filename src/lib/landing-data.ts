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
  { icon: "🏥", name: "Grande Hospital" },
  { icon: "🏥", name: "Norvic Hospital" },
  { icon: "🏥", name: "Bir Hospital" },
  { icon: "✓", name: "Nepal Medical Council" },
  { icon: "📰", name: "Kathmandu Post" },
  { icon: "📰", name: "Himal Khabar" },
  { icon: "🎖", name: "ISO 9001" },
  { icon: "💳", name: "eSewa · Khalti" },
];

export const impactStats: ImpactStat[] = [
  { value: 12400, suffix: "+", label: "Home visits completed" },
  { value: 180, suffix: "+", label: "Verified therapists" },
  { value: 48, suffix: "★", label: "Average rating × 10", isRating: true },
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
