"use client";

import { useQuery } from "@tanstack/react-query";
import { getTherapistPatients } from "@/services/api/patients";
import type { UsePaginationReturn } from "./usePagination";

const DUMMY_PATIENTS = [
  { id: "p1", name: "Sita Sharma", phone: "9841XXXXXX", condition: "Back Pain", sessions: 12, last: "2026-07-10", notes: "Lower back pain, doing stretching exercises" },
  { id: "p2", name: "Ram Thapa", phone: "9851XXXXXX", condition: "Post-surgery", sessions: 8, last: "2026-07-09", notes: "Knee replacement rehab, progressing well" },
  { id: "p3", name: "Gita Magar", phone: "9861XXXXXX", condition: "Sports Injury", sessions: 5, last: "2026-07-08", notes: "ACL tear, physiotherapy ongoing" },
  { id: "p4", name: "Hari Bahadur", phone: "9841XXXXXX", condition: "Post-stroke rehab", sessions: 15, last: "2026-07-07", notes: "Left side weakness, improving gradually" },
  { id: "p5", name: "Anita Gurung", phone: "9851XXXXXX", condition: "Frozen shoulder", sessions: 6, last: "2026-07-06", notes: "Right shoulder, range of motion exercises" },
  { id: "p6", name: "Binod Karki", phone: "9861XXXXXX", condition: "Back Pain", sessions: 10, last: "2026-07-05", notes: "Herniated disc, doing core strengthening" },
  { id: "p7", name: "Sunita Rai", phone: "9841XXXXXX", condition: "Post-surgery", sessions: 4, last: "2026-07-04", notes: "ACL reconstruction, early phase rehab" },
  { id: "p8", name: "Prakash Tamang", phone: "9851XXXXXX", condition: "Sports Injury", sessions: 7, last: "2026-07-03", notes: "Rotator cuff injury, manual therapy" },
  { id: "p9", name: "Kamala Shrestha", phone: "9861XXXXXX", condition: "Frozen shoulder", sessions: 3, last: "2026-07-02", notes: "Left shoulder, hydrotherapy added" },
  { id: "p10", name: "Rajesh Adhikari", phone: "9841XXXXXX", condition: "Post-stroke rehab", sessions: 18, last: "2026-07-01", notes: "Right side weakness, balance training" },
  { id: "p11", name: "Laxmi Bhattarai", phone: "9851XXXXXX", condition: "Back Pain", sessions: 9, last: "2026-06-30", notes: "Sciatica pain, nerve glide exercises" },
  { id: "p12", name: "Deepak Maharjan", phone: "9861XXXXXX", condition: "Post-surgery", sessions: 6, last: "2026-06-28", notes: "Hip replacement, walking with support" },
  { id: "p13", name: "Nirmala Khadka", phone: "9841XXXXXX", condition: "Sports Injury", sessions: 11, last: "2026-06-25", notes: "Ankle sprain grade 2, taping and exercises" },
  { id: "p14", name: "Suman Basnet", phone: "9851XXXXXX", condition: "Frozen shoulder", sessions: 2, last: "2026-06-20", notes: "Both shoulders, cryotherapy started" },
  { id: "p15", name: "Mina Koirala", phone: "9861XXXXXX", condition: "Post-stroke rehab", sessions: 20, last: "2026-06-18", notes: "Speech and motor recovery, home exercises" },
];

interface UseTherapistPatientsOptions {
  pagination: UsePaginationReturn;
  search: string;
  condition: string;
  lastVisit: string;
}

export function useTherapistPatients({
  pagination,
  search,
  condition,
  lastVisit,
}: UseTherapistPatientsOptions) {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [
      "therapist-patients",
      pagination.skip,
      pagination.pageSize,
      search,
      condition,
      lastVisit,
    ],
    queryFn: () =>
      getTherapistPatients({
        skip: pagination.skip,
        limit: pagination.pageSize,
        search: search || undefined,
        condition: condition || undefined,
        lastVisit: lastVisit !== "all" ? lastVisit : undefined,
      }),
  });

  const apiPatients = data?.patients;
  const apiTotal = data?.total;

  let filtered = DUMMY_PATIENTS;

  if (apiPatients && apiPatients.length > 0) {
    filtered = apiPatients;
  } else {
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.id.includes(q),
      );
    }
    if (condition) {
      filtered = filtered.filter((p) => p.condition === condition);
    }
    if (lastVisit !== "all") {
      const days = Number(lastVisit);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filtered = filtered.filter((p) => new Date(p.last) >= cutoff);
    }
  }

  const paged = filtered.slice(pagination.skip, pagination.skip + pagination.pageSize);

  return {
    patients: apiPatients && apiPatients.length > 0 ? apiPatients : paged,
    total: apiTotal ?? filtered.length,
    isLoading,
    refetch,
    isRefetching,
  };
}
