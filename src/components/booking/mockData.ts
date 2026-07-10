import type { BookingTherapist, TimeSlot, CurrencyOption, PaymentMethod } from "./types";

export const MOCK_THERAPIST: BookingTherapist = {
  id: "th-001",
  name: "Dr. Anjali Sharma",
  specialty: "Sports & post-surgery rehabilitation",
  price: 2000,
  rating: 4.8,
  reviews: 124,
};

export const MOCK_TIME_SLOTS: TimeSlot[] = [
  { time: "08:00", booked: true },
  { time: "09:00", booked: false },
  { time: "10:00", booked: false },
  { time: "11:00", booked: true },
  { time: "12:00", booked: false },
  { time: "13:00", booked: false },
  { time: "14:00", booked: true },
  { time: "15:00", booked: false },
  { time: "16:00", booked: false },
];

export const CURRENCIES: CurrencyOption[] = [
  { code: "NPR", name: "Nepalese Rupee", flag: "🇳🇵", symbol: "Rs.", rate: 1 },
  { code: "USD", name: "US Dollar", flag: "🇺🇸", symbol: "$", rate: 0.0075 },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", symbol: "A$", rate: 0.011 },
  { code: "EUR", name: "Euro", flag: "🇪🇺", symbol: "€", rate: 0.0069 },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", symbol: "£", rate: 0.0059 },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", symbol: "C$", rate: 0.010 },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳", symbol: "₹", rate: 0.63 },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬", symbol: "S$", rate: 0.010 },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", symbol: "¥", rate: 1.12 },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪", symbol: "د.إ", rate: 0.028 },
];

export const NEPAL_PAYMENTS: PaymentMethod[] = [
  { id: "esewa", label: "eSewa", icon: "💳", type: "nepal", subtype: "Digital wallet" },
  { id: "khalti", label: "Khalti", icon: "💳", type: "nepal", subtype: "Digital wallet" },
  { id: "connectips", label: "ConnectIPS", icon: "🏦", type: "nepal", subtype: "Bank transfer" },
  { id: "imepay", label: "IME Pay", icon: "💳", type: "nepal", subtype: "Digital wallet" },
  { id: "fonepay", label: "FonePay", icon: "📱", type: "nepal", subtype: "QR/mobile" },
  { id: "cash", label: "Cash", icon: "💵", type: "nepal", subtype: "Pay on visit" },
];

export const INTERNATIONAL_PAYMENTS: PaymentMethod[] = [
  { id: "card", label: "Card", icon: "💳", type: "international", subtype: "Credit/Debit" },
  { id: "paypal", label: "PayPal", icon: "🅿️", type: "international", subtype: "Online wallet" },
  { id: "googlepay", label: "Google Pay", icon: "📱", type: "international", subtype: "Mobile wallet" },
  { id: "applepay", label: "Apple Pay", icon: "🍎", type: "international", subtype: "Mobile wallet" },
];

export const BILLING_COUNTRIES = [
  "Nepal",
  "United States",
  "Australia",
  "United Kingdom",
  "Canada",
  "India",
  "Singapore",
  "United Arab Emirates",
  "Japan",
  "Germany",
  "France",
];
