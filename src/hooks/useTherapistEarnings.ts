"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getTherapistTransactions,
  getTherapistPayouts,
} from "@/services/api/earnings";
import type { UsePaginationReturn } from "./usePagination";

const DUMMY_TRANSACTIONS = [
  { id: "tx1", date: "2026-07-10", patient: "Sita Sharma", sessionType: "In-clinic", fee: 1500, status: "Completed" as const },
  { id: "tx2", date: "2026-07-10", patient: "Ram Thapa", sessionType: "Home visit", fee: 2500, status: "Completed" as const },
  { id: "tx3", date: "2026-07-09", patient: "Gita Magar", sessionType: "In-clinic", fee: 1500, status: "Completed" as const },
  { id: "tx4", date: "2026-07-08", patient: "Hari Bahadur", sessionType: "In-clinic", fee: 1500, status: "Scheduled" as const },
  { id: "tx5", date: "2026-07-07", patient: "Anita Gurung", sessionType: "Telehealth", fee: 1000, status: "Completed" as const },
  { id: "tx6", date: "2026-07-05", patient: "Binod Karki", sessionType: "In-clinic", fee: 1500, status: "Completed" as const },
  { id: "tx7", date: "2026-07-04", patient: "Sunita Rai", sessionType: "Home visit", fee: 2500, status: "Completed" as const },
  { id: "tx8", date: "2026-07-03", patient: "Prakash Tamang", sessionType: "In-clinic", fee: 1500, status: "Cancelled" as const },
  { id: "tx9", date: "2026-07-02", patient: "Kamala Shrestha", sessionType: "Telehealth", fee: 1000, status: "Completed" as const },
  { id: "tx10", date: "2026-07-01", patient: "Rajesh Adhikari", sessionType: "In-clinic", fee: 1500, status: "Completed" as const },
  { id: "tx11", date: "2026-06-30", patient: "Laxmi Bhattarai", sessionType: "In-clinic", fee: 1500, status: "Completed" as const },
  { id: "tx12", date: "2026-06-28", patient: "Deepak Maharjan", sessionType: "Home visit", fee: 2500, status: "Completed" as const },
  { id: "tx13", date: "2026-06-25", patient: "Nirmala Khadka", sessionType: "In-clinic", fee: 1500, status: "Completed" as const },
  { id: "tx14", date: "2026-06-20", patient: "Suman Basnet", sessionType: "Telehealth", fee: 1000, status: "Completed" as const },
  { id: "tx15", date: "2026-06-18", patient: "Mina Koirala", sessionType: "In-clinic", fee: 1500, status: "Completed" as const },
];

const DUMMY_PAYOUTS = [
  { ref: "PAY-2026-071", date: "2026-07-08", method: "eSewa" as const, account: "98XXXXXX21", amount: 12000, status: "Paid" as const },
  { ref: "PAY-2026-065", date: "2026-06-28", method: "Khalti" as const, account: "98XXXXXX99", amount: 9500, status: "Paid" as const },
  { ref: "PAY-2026-059", date: "2026-06-18", method: "Bank transfer" as const, account: "NIC Asia ••4521", amount: 15000, status: "Paid" as const },
  { ref: "PAY-2026-052", date: "2026-06-08", method: "eSewa" as const, account: "98XXXXXX21", amount: 8000, status: "Paid" as const },
  { ref: "PAY-2026-048", date: "2026-05-28", method: "Khalti" as const, account: "98XXXXXX99", amount: 11000, status: "Paid" as const },
  { ref: "PAY-2026-045", date: "2026-05-18", method: "Bank transfer" as const, account: "NIC Asia ••4521", amount: 7500, status: "Paid" as const },
  { ref: "PAY-2026-041", date: "2026-05-08", method: "eSewa" as const, account: "98XXXXXX21", amount: 13000, status: "Paid" as const },
  { ref: "PAY-2026-038", date: "2026-04-28", method: "Khalti" as const, account: "98XXXXXX99", amount: 6000, status: "Paid" as const },
  { ref: "PAY-2026-034", date: "2026-04-18", method: "Bank transfer" as const, account: "NIC Asia ••4521", amount: 14500, status: "Paid" as const },
  { ref: "PAY-2026-030", date: "2026-04-08", method: "eSewa" as const, account: "98XXXXXX21", amount: 10000, status: "Paid" as const },
  { ref: "PAY-2026-027", date: "2026-03-28", method: "Khalti" as const, account: "98XXXXXX99", amount: 8500, status: "Paid" as const },
  { ref: "PAY-2026-022", date: "2026-03-18", method: "Bank transfer" as const, account: "NIC Asia ••4521", amount: 16000, status: "Paid" as const },
];

function filterByPeriod<T extends { date: string }>(items: T[], period: string): T[] {
  if (period === "all") return items;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === "lastMonth") {
    start.setMonth(start.getMonth() - 1);
  }
  return items.filter((item) => new Date(item.date) >= start);
}

interface UseTherapistListOptions {
  pagination: UsePaginationReturn;
  period: string;
}

export function useTherapistTransactions({
  pagination,
  period,
}: UseTherapistListOptions) {
  const { data, isLoading } = useQuery({
    queryKey: [
      "therapist-transactions",
      pagination.skip,
      pagination.pageSize,
      period,
    ],
    queryFn: () =>
      getTherapistTransactions({
        skip: pagination.skip,
        limit: pagination.pageSize,
        period,
      }),
  });

  const apiTransactions = data?.transactions;
  const apiTotal = data?.total;

  let pool = apiTransactions && apiTransactions.length > 0 ? apiTransactions : filterByPeriod(DUMMY_TRANSACTIONS, period);
  const total = apiTotal ?? pool.length;
  const paged = apiTransactions && apiTransactions.length > 0 ? pool : pool.slice(pagination.skip, pagination.skip + pagination.pageSize);

  return {
    transactions: paged,
    total,
    isLoading,
  };
}

export function useTherapistPayouts({
  pagination,
  period,
}: UseTherapistListOptions) {
  const { data, isLoading } = useQuery({
    queryKey: [
      "therapist-payouts",
      pagination.skip,
      pagination.pageSize,
      period,
    ],
    queryFn: () =>
      getTherapistPayouts({
        skip: pagination.skip,
        limit: pagination.pageSize,
        period,
      }),
  });

  const apiPayouts = data?.payouts;
  const apiTotal = data?.total;

  let pool = apiPayouts && apiPayouts.length > 0 ? apiPayouts : filterByPeriod(DUMMY_PAYOUTS, period);
  const total = apiTotal ?? pool.length;
  const paged = apiPayouts && apiPayouts.length > 0 ? pool : pool.slice(pagination.skip, pagination.skip + pagination.pageSize);

  return {
    payouts: paged,
    total,
    isLoading,
  };
}
