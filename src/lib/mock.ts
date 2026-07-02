export const CITIES = ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Chitwan", "Biratnagar"] as const;
export const SPECIALTIES = [
  "Sports & post-surgery",
  "Musculoskeletal",
  "Geriatric & neuro",
  "Pediatric rehab",
  "Neurological",
  "Post-operative",
  "General",
] as const;

export interface Therapist {
  id: string;
  name: string;
  specialty: string;
  city: string;
  gender: "Male" | "Female";
  rating: number;
  reviews: number;
  price: number;
  experience: number;
  bio: string;
}

export const THERAPISTS: Therapist[] = [
  { id: "t1", name: "Dr. Aarati Shrestha", specialty: "Sports & post-surgery", city: "Kathmandu", gender: "Female", rating: 4.9, reviews: 128, price: 1500, experience: 8, bio: "Specialist in ACL and rotator cuff rehab with 8+ years of home-visit experience." },
  { id: "t2", name: "Dr. Bibek Thapa", specialty: "Musculoskeletal", city: "Lalitpur", gender: "Male", rating: 4.8, reviews: 96, price: 1200, experience: 6, bio: "Manual therapy and dry needling specialist." },
  { id: "t3", name: "Dr. Sushmita Rai", specialty: "Geriatric & neuro", city: "Kathmandu", gender: "Female", rating: 4.9, reviews: 142, price: 1400, experience: 10, bio: "Stroke and Parkinson's rehab for elderly patients." },
  { id: "t4", name: "Dr. Nirajan Karki", specialty: "Pediatric rehab", city: "Pokhara", gender: "Male", rating: 4.7, reviews: 67, price: 1300, experience: 5, bio: "Cerebral palsy and developmental delays." },
  { id: "t5", name: "Dr. Sabina Gurung", specialty: "Neurological", city: "Bhaktapur", gender: "Female", rating: 4.8, reviews: 84, price: 1600, experience: 9, bio: "Post-stroke and spinal cord rehabilitation." },
  { id: "t6", name: "Dr. Rajan Magar", specialty: "Post-operative", city: "Chitwan", gender: "Male", rating: 4.6, reviews: 51, price: 1100, experience: 4, bio: "Post-op knee and hip recovery." },
  { id: "t7", name: "Dr. Priya Tamang", specialty: "General", city: "Biratnagar", gender: "Female", rating: 4.7, reviews: 73, price: 1000, experience: 5, bio: "General home physiotherapy and pain management." },
  { id: "t8", name: "Dr. Anil Shakya", specialty: "Sports & post-surgery", city: "Lalitpur", gender: "Male", rating: 4.9, reviews: 110, price: 1700, experience: 11, bio: "Former national team physio." },
];

export interface Product {
  id: string;
  name: string;
  category: "equipment" | "medicine" | "nutrition";
  description: string;
  price: number;
  rentPerDay?: number;
  inStock: boolean;
  emoji: string;
}

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Standard Wheelchair", category: "equipment", description: "Foldable, lightweight, 100kg capacity.", price: 18000, rentPerDay: 150, inStock: true, emoji: "♿" },
  { id: "p2", name: "Adjustable Crutches (Pair)", category: "equipment", description: "Aluminum, height adjustable.", price: 2200, rentPerDay: 40, inStock: true, emoji: "🩼" },
  { id: "p3", name: "TENS Therapy Unit", category: "equipment", description: "Dual-channel pain relief device.", price: 4500, rentPerDay: 80, inStock: true, emoji: "⚡" },
  { id: "p4", name: "Hot & Cold Therapy Pack", category: "equipment", description: "Reusable gel pack with strap.", price: 850, rentPerDay: 20, inStock: true, emoji: "🧊" },
  { id: "p5", name: "Knee Support Brace", category: "equipment", description: "Post-op stabilizing brace.", price: 1600, inStock: true, emoji: "🦵" },
  { id: "p6", name: "Walker with Wheels", category: "equipment", description: "Senior-friendly mobility walker.", price: 6500, rentPerDay: 60, inStock: false, emoji: "🚶" },

  { id: "m1", name: "Ibuprofen 400mg (10 tabs)", category: "medicine", description: "Pain & inflammation relief.", price: 120, inStock: true, emoji: "💊" },
  { id: "m2", name: "Diclofenac Gel 30g", category: "medicine", description: "Topical anti-inflammatory.", price: 240, inStock: true, emoji: "🧴" },
  { id: "m3", name: "Calcium + D3 (30 tabs)", category: "medicine", description: "Bone health supplement.", price: 380, inStock: true, emoji: "🦴" },
  { id: "m4", name: "Muscle Relaxant (10 tabs)", category: "medicine", description: "Rx — uploaded by therapist.", price: 280, inStock: true, emoji: "💊" },

  { id: "n1", name: "Whey Protein 1kg", category: "nutrition", description: "Muscle recovery support.", price: 3200, inStock: true, emoji: "🥤" },
  { id: "n2", name: "Collagen Peptides 250g", category: "nutrition", description: "Joint & tissue repair.", price: 2400, inStock: true, emoji: "🍶" },
  { id: "n3", name: "Omega-3 (60 caps)", category: "nutrition", description: "Anti-inflammatory.", price: 1100, inStock: true, emoji: "🐟" },
  { id: "n4", name: "Recovery Meal Plan (1 week)", category: "nutrition", description: "Nepali-style nutrition plan.", price: 1800, inStock: true, emoji: "🍱" },
];

export interface Session {
  id: string;
  therapist: string;
  therapistId: string;
  date: string;
  time: string;
  type: string;
  status: "Confirmed" | "Completed" | "Cancelled" | "Pending";
  patient?: string;
  patientId?: string;
  address?: string;
  fee?: number;
}

export const MOCK_SESSIONS: Session[] = [
  { id: "s1", therapist: "Dr. Aarati Shrestha", therapistId: "t1", date: "2026-07-02", time: "10:00", type: "Post-surgery recovery", status: "Confirmed", patient: "Ramesh Adhikari", patientId: "u1", address: "Baluwatar, Kathmandu", fee: 1500 },
  { id: "s2", therapist: "Dr. Bibek Thapa", therapistId: "t2", date: "2026-07-05", time: "16:00", type: "Lower back pain", status: "Confirmed", patient: "Sita Lama", patientId: "u2", address: "Jhamsikhel, Lalitpur", fee: 1200 },
  { id: "s3", therapist: "Dr. Aarati Shrestha", therapistId: "t1", date: "2026-06-20", time: "11:00", type: "Knee rehabilitation", status: "Completed", patient: "Ramesh Adhikari", patientId: "u1", fee: 1500 },
  { id: "s4", therapist: "Dr. Sushmita Rai", therapistId: "t3", date: "2026-06-18", time: "09:00", type: "Stroke rehab", status: "Completed", patient: "Hari Pradhan", patientId: "u3", fee: 1400 },
  { id: "s5", therapist: "Dr. Bibek Thapa", therapistId: "t2", date: "2026-06-12", time: "14:00", type: "Initial consult", status: "Cancelled", patient: "Sita Lama", patientId: "u2", fee: 1200 },
];

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
