"use client";

import { useQuery } from "@tanstack/react-query";
import { getPackages } from "@/services/api/packages";

export function usePackages() {
  return useQuery({
    queryKey: ["packages"],
    queryFn: () => getPackages(),
  });
}
