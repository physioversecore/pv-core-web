import { getTherapists } from "@/services/api/therapists";
import type { Therapist } from "@/types";
import LandingClient from "./LandingClient";

export default async function Landing() {
  const data = await getTherapists();
  const therapists: Therapist[] = (data?.therapists ?? []).map((t) => ({
    ...t,
    gender: t.gender as "Male" | "Female",
  }));

  return <LandingClient therapists={therapists} />;
}
