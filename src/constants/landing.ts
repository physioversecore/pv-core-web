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

export interface ClinicData {
  id: string;
  name: string;
  area: string;
  city: string;
  address: string;
  services: string[];
  phone: string;
  hours: string;
}

export const clinics: ClinicData[] = [
  {
    id: "chhetrapati-clinic",
    name: "Chhetrapati Clinic",
    area: "Chhetrapati",
    city: "Kathmandu",
    address: "Chhetrapati, Kathmandu (near Indra Chowk)",
    services: ["Orthopedic physio", "Post-surgery rehab", "Manual therapy"],
    phone: "+977 01-4261234",
    hours: "Sun–Fri: 8:00 AM – 6:00 PM",
  },
  {
    id: "hamro-physio-clinic",
    name: "Hamro Physio Clinic",
    area: "Maharajgunj",
    city: "Kathmandu",
    address: "Maharajgunj, Kathmandu (near TUTH)",
    services: ["Neuro rehab", "Pediatric physiotherapy", "Geriatric care"],
    phone: "+977 01-4720567",
    hours: "Sun–Fri: 9:00 AM – 7:00 PM",
  },
  {
    id: "move-mobility-clinic",
    name: "Move Mobility Healthy Life",
    area: "Kaladhara",
    city: "Kathmandu",
    address: "Kaladhara, Kathmandu",
    services: ["Sports injury rehab", "Strength & conditioning", "Chronic pain management"],
    phone: "+977 01-4419988",
    hours: "Sun–Fri: 7:00 AM – 8:00 PM",
  },
  {
    id: "patan-physiotherapy-centre",
    name: "Patan Physiotherapy Centre",
    area: "Lagankhel",
    city: "Lalitpur",
    address: "Lagankhel, Lalitpur (near Patan Hospital)",
    services: ["Post-op rehab", "Cardiac physiotherapy", "Respiratory care"],
    phone: "+977 01-5522310",
    hours: "Sun–Fri: 8:00 AM – 5:00 PM",
  },
  {
    id: "pokhara-rehabilitation-hub",
    name: "Pokhara Rehabilitation Hub",
    area: "Mahendrapul",
    city: "Pokhara",
    address: "Mahendrapul, Pokhara",
    services: ["Sports injury rehab", "Neuro rehab", "Pediatric physiotherapy"],
    phone: "+977 061-521456",
    hours: "Sun–Fri: 9:00 AM – 6:00 PM",
  },
];
