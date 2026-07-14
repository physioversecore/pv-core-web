"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";
import type { ScheduleAppointment } from "@/hooks/useTherapistSchedule";

const MOCK_APPOINTMENTS: ScheduleAppointment[] = [
  { id: "a1", date: "2026-07-06", time: "09:00", status: "confirmed", patient: "Ramesh Adhikari", phone: "+977 9841-234567", address: "Baneshwor, Kathmandu", type: "home_visit", fee: 1500 },
  { id: "a2", date: "2026-07-06", time: "11:00", status: "completed", patient: "Sita Lama", phone: "+977 9851-345678", address: "Lalitpur, Patan", type: "follow_up", fee: 1500 },
  { id: "a3", date: "2026-07-07", time: "10:00", status: "pending", patient: "Anita Sharma", phone: "+977 9861-456789", address: "New Baneshwor, Kathmandu", type: "home_visit", fee: 1500 },
  { id: "a4", date: "2026-07-07", time: "14:00", status: "confirmed", patient: "Hari Prasad", phone: "+977 9871-567890", address: "Bhaktapur Durbar Area", type: "assessment", fee: 2000 },
  { id: "a5", date: "2026-07-08", time: "09:00", status: "completed", patient: "Krishna Bahadur", phone: "+977 9881-678901", address: "Patan Dhoka, Lalitpur", type: "home_visit", fee: 1500 },
  { id: "a6", date: "2026-07-08", time: "15:00", status: "pending", patient: "Gita Thapa", phone: "+977 9841-789012", address: "Kamaladi, Kathmandu", type: "follow_up", fee: 1500 },
  { id: "a7", date: "2026-07-09", time: "11:00", status: "confirmed", patient: "Ram Khatri", phone: "+977 9851-890123", address: "Lagankhel, Lalitpur", type: "home_visit", fee: 1500 },
  { id: "a8", date: "2026-07-10", time: "08:00", status: "completed", patient: "Sarita Karki", phone: "+977 9861-901234", address: "Jhamsikhel, Lalitpur", type: "assessment", fee: 2000 },
  { id: "a9", date: "2026-07-10", time: "16:00", status: "confirmed", patient: "Bikash Gurung", phone: "+977 9871-012345", address: "Thimi, Bhaktapur", type: "home_visit", fee: 1500 },
  { id: "a10", date: "2026-07-11", time: "10:00", status: "pending", patient: "Laxmi Rai", phone: "+977 9881-123456", address: "Madhyapur Thimi", type: "follow_up", fee: 1500 },
  { id: "a11", date: "2026-07-12", time: "09:00", status: "confirmed", patient: "Deepak Shrestha", phone: "+977 9841-234568", address: "Swotha, Lalitpur", type: "home_visit", fee: 1500 },
  { id: "a12", date: "2026-07-13", time: "14:00", status: "completed", patient: "Nirmala Tamang", phone: "+977 9851-345679", address: "Chabahil, Kathmandu", type: "assessment", fee: 2000 },
  { id: "a13", date: "2026-07-14", time: "10:00", status: "confirmed", patient: "Prakash Adhikari", phone: "+977 9861-456780", address: "Gongabu, Kathmandu", type: "home_visit", fee: 1500 },
  { id: "a14", date: "2026-07-14", time: "13:00", status: "pending", patient: "Mina Maharjan", phone: "+977 9871-567891", address: "Kirtipur, Kathmandu", type: "follow_up", fee: 1500 },
  { id: "a15", date: "2026-07-15", time: "09:00", status: "confirmed", patient: "Rajesh Karki", phone: "+977 9881-678902", address: "Baluwatar, Kathmandu", type: "home_visit", fee: 1500 },
  { id: "a16", date: "2026-07-16", time: "11:00", status: "completed", patient: "Sunita Poudel", phone: "+977 9841-789013", address: "Pulchowk, Lalitpur", type: "assessment", fee: 2000 },
  { id: "a17", date: "2026-07-17", time: "08:00", status: "confirmed", patient: "Kamala Poudel", phone: "+977 9851-890124", address: "Budhanilkantha, Kathmandu", type: "home_visit", fee: 1500 },
  { id: "a18", date: "2026-07-18", time: "15:00", status: "pending", patient: "Bibek Thapa", phone: "+977 9861-901235", address: "Satdobato, Lalitpur", type: "follow_up", fee: 1500 },
  { id: "a19", date: "2026-07-19", time: "10:00", status: "confirmed", patient: "Anisha Shrestha", phone: "+977 9871-012346", address: "Dillibazar, Kathmandu", type: "home_visit", fee: 1500 },
  { id: "a20", date: "2026-07-20", time: "09:00", status: "completed", patient: "Suman Basnet", phone: "+977 9881-123457", address: "Syuchatar, Kathmandu", type: "assessment", fee: 2000 },
  { id: "a21", date: "2026-07-21", time: "14:00", status: "confirmed", patient: "Rita Sharma", phone: "+977 9841-234569", address: "Maharajgunj, Kathmandu", type: "home_visit", fee: 1500 },
  { id: "a22", date: "2026-07-22", time: "11:00", status: "pending", patient: "Sunil Tamrakar", phone: "+977 9851-345670", address: "Patan, Lalitpur", type: "follow_up", fee: 1500 },
  { id: "a23", date: "2026-07-24", time: "09:00", status: "confirmed", patient: "Kavita Joshi", phone: "+977 9861-456781", address: "Sanepa, Lalitpur", type: "home_visit", fee: 1500 },
  { id: "a24", date: "2026-07-25", time: "16:00", status: "completed", patient: "Arun Mehta", phone: "+977 9871-567892", address: "Gatthaghar, Bhaktapur", type: "assessment", fee: 2000 },
  { id: "a25", date: "2026-07-27", time: "10:00", status: "confirmed", patient: "Srijana Koirala", phone: "+977 9881-678903", address: "Mangal Bazaar, Lalitpur", type: "home_visit", fee: 1500 },
  { id: "a26", date: "2026-07-28", time: "13:00", status: "pending", patient: "Nabin Bhattarai", phone: "+977 9841-789014", address: "Thankot, Kathmandu", type: "follow_up", fee: 1500 },
  { id: "a27", date: "2026-07-29", time: "08:00", status: "confirmed", patient: "Sabina Khadka", phone: "+977 9851-890125", address: "Balkhu, Kathmandu", type: "home_visit", fee: 1500 },
  { id: "a28", date: "2026-07-30", time: "11:00", status: "completed", patient: "Dipak KC", phone: "+977 9861-901236", address: "Kalanki, Kathmandu", type: "assessment", fee: 2000 },
  { id: "a29", date: "2026-07-31", time: "14:00", status: "confirmed", patient: "Pooja Magar", phone: "+977 9871-012347", address: "Imadole, Lalitpur", type: "home_visit", fee: 1500 },
];

export default function Schedule() {
  const { t } = useLang();
  const [slots, setSlots] = useState(MOCK_APPOINTMENTS);

  const handleAccept = (id: string) => {
    setSlots((prev) => prev.map((s) => s.id === id ? { ...s, status: "confirmed" } : s));
    toast.success(t("therapist_dashboard.slotAccepted"));
  };

  const handleDecline = (id: string) => {
    setSlots((prev) => prev.map((s) => s.id === id ? { ...s, status: "cancelled" } : s));
    toast.success(t("therapist_dashboard.slotDeclined"));
  };

  return (
    <div className="space-y-4">
      <ScheduleCalendar
        appointments={slots}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </div>
  );
}
