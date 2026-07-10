import BookingModal from "@/components/booking/BookingModal";

export default async function BookPage({ params }: { params: Promise<{ therapistId: string }> }) {
  const { therapistId } = await params;
  return <BookingModal onClose={() => {}} />;
}
