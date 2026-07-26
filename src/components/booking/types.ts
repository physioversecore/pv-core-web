export interface BookingPatient {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface BookingTherapist {
  id: string;
  name: string;
  specialty: string;
  price: number;
  rating: number;
  reviews: number;
  imageUrl?: string;
}

export interface TimeSlot {
  time: string;
  booked: boolean;
}

export interface CurrencyOption {
  code: string;
  name: string;
  flag: string;
  symbol: string;
  rate: number;
}

export interface PaymentMethod {
  id: string;
  label: string;
  icon: string;
  type: "nepal" | "international";
  subtype?: string;
}

export interface BookingState {
  currentStep: number;
  selectedDate: string;
  selectedTime: string;
  selectedCurrency: string;
  selectedPaymentMethod: string;
  bookingResult: BookingResult | null;
}

export interface BookingResult {
  reference: string;
  therapistName: string;
  date: string;
  time: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export interface AdminBookingResult {
  reference: string;
  patientName: string;
  patientId: string;
  patientPhone: string;
  patientEmail: string;
  therapistName: string;
  therapistId: string;
  therapistPhone: string;
  therapistEmail: string;
  date: string;
  time: string;
  paymentMethod?: string;
  paymentType?: "nepal" | "international";
}
