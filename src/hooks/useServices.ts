import { useQuery } from "@tanstack/react-query";
import { getServices, type ServiceData } from "@/services/api/services";

export function useServices(category?: string) {
  return useQuery({
    queryKey: ["services", category],
    queryFn: () => getServices({ category, limit: 100 }),
  });
}

export type { ServiceData };
