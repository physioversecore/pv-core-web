import type { BookingTherapist, TimeSlot, CurrencyOption, PaymentMethod, BookingPatient } from "./types";

export const MOCK_PATIENTS: BookingPatient[] = [
  { id: "p1", name: "Nabin Khadka", phone: "+977-9841-123456", email: "nabin@email.com" },
  { id: "p2", name: "Sita Gurung", phone: "+977-9841-234567", email: "sita@email.com" },
  { id: "p3", name: "Hari Bahadur Rai", phone: "+977-9841-345678", email: "hari@email.com" },
  { id: "p4", name: "Aarati Thapa", phone: "+977-9841-456789", email: "aarati@email.com" },
  { id: "p5", name: "Bikash Magar", phone: "+977-9841-567890", email: "bikash@email.com" },
  { id: "p6", name: "Chhaya Lama", phone: "+977-9841-678901", email: "chhaya@email.com" },
  { id: "p7", name: "Deepak Shrestha", phone: "+977-9841-789012", email: "deepak@email.com" },
  { id: "p8", name: "Elina Rai", phone: "+977-9841-890123", email: "elina@email.com" },
];

export const MOCK_THERAPISTS_LIST: BookingTherapist[] = [
  { id: "th-001", name: "Dr. Anjali Sharma", specialty: "Sports & post-surgery rehabilitation", price: 2000, rating: 4.8, reviews: 124 },
  { id: "th-002", name: "Rajesh Shrestha", specialty: "Neuro rehabilitation", price: 2500, rating: 4.9, reviews: 98 },
  { id: "th-003", name: "Anita Tamang", specialty: "Pediatric physiotherapy", price: 1800, rating: 4.7, reviews: 76 },
  { id: "th-004", name: "Sujan Karki", specialty: "General musculoskeletal", price: 1500, rating: 4.6, reviews: 112 },
  { id: "th-005", name: "Dr. Prativa Adhikari", specialty: "Cardiopulmonary rehabilitation", price: 2200, rating: 4.8, reviews: 64 },
  { id: "th-006", name: "Manoj Bhandari", specialty: "Orthopaedic & manual therapy", price: 1900, rating: 4.5, reviews: 88 },
];

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
