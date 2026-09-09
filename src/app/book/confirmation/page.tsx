"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Clock3, TriangleAlert, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { getSession } from "@/services/api/sessions";
import { to12h } from "@/components/modals/BookingModal";

function formatDisplayDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "unknown";
  const sessionId = searchParams.get("sessionId") ?? "";
  const ref = searchParams.get("ref") ?? "";
  const amount = searchParams.get("amount") ?? "";
  const method = searchParams.get("method") ?? "";

  const { data: session, isLoading } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => getSession(sessionId),
    enabled: !!sessionId,
  });

  const isSuccess = status === "completed";
  const isCancelled = status === "cancelled";
  const isPending = status === "pending";
  const isFailed = status === "failed";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-[440px] bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="text-center space-y-3">
          <div
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
              isSuccess && "bg-success/10 text-success",
              isCancelled && "bg-warning/10 text-warning",
              isFailed && "bg-danger/10 text-danger",
              isPending && "bg-warning/10 text-warning",
              !isSuccess && !isCancelled && !isPending && !isFailed && "bg-surface text-text-light",
            )}
          >
            {isLoading && (!session || !sessionId) ? (
              <Loader2 className="w-9 h-9 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-9 h-9" />
            ) : isCancelled || isFailed ? (
              <XCircle className="w-9 h-9" />
            ) : isPending ? (
              <Clock3 className="w-9 h-9" />
            ) : (
              <TriangleAlert className="w-9 h-9" />
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-text">
              {isSuccess
                ? "Payment successful!"
                : isPending
                  ? "Payment in progress"
                  : isCancelled
                    ? "Payment was cancelled"
                    : isFailed
                      ? "Payment failed"
                      : "Payment status unknown"}
            </h1>
            <p className="text-sm text-text-light mt-1">
              {isSuccess
                ? "Your booking is confirmed."
                : isPending
                  ? "We are still confirming your payment. This page will show the result once it settles."
                  : isCancelled
                    ? "No money was charged. Your slot is still open — you can retry whenever you like."
                    : isFailed
                      ? "We could not confirm your payment. If money was deducted, it will be refunded automatically."
                      : "We could not confirm your payment right now."}
            </p>
          </div>
        </div>

        {(session || sessionId) && (
          <div className="bg-surface rounded-xl p-4 space-y-2 text-sm">
            {session && (
              <>
                <DetailRow label="Therapist" value={session.therapistName ?? "—"} />
                <DetailRow label="Date" value={formatDisplayDate(session.date)} />
                <DetailRow label="Time" value={session.time ? to12h(session.time) : "—"} />
              </>
            )}
            {sessionId && !session && <DetailRow label="Booking" value={sessionId} />}
            {amount && (
              <DetailRow label="Amount" value={`Rs ${Number(amount).toLocaleString("en-IN")}`} />
            )}
            {method && <DetailRow label="Payment method" value={method} />}
            {ref && <DetailRow label="Transaction ref." value={ref} />}
          </div>
        )}

        {isSuccess && (
          <p className="text-xs text-text-light text-center">
            The therapist has been notified of your booking.
          </p>
        )}

        <div className="space-y-2">
          {!isSuccess && (
            <Link
              href="/find-a-therapist"
              className="block w-full py-3 rounded-xl font-semibold bg-secondary text-white hover:bg-secondary/90 transition-all text-center"
            >
              Book another session
            </Link>
          )}
          <Link
            href={isSuccess ? "/patient/sessions" : "/"}
            className="block w-full py-3 rounded-xl font-semibold border border-border bg-card text-text hover:bg-surface transition-all text-center"
          >
            {isSuccess ? "View my bookings" : "Back to home"}
          </Link>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-text-light">{label}</span>
      <span className="font-medium text-text text-right break-all">{value}</span>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
