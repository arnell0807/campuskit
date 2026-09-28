import { useQuery } from "@tanstack/react-query";
import { campusService } from "../services/campusService";

export function useCheckouts() {
  return useQuery({
    queryKey: ["checkouts"],
    queryFn: campusService.getCheckouts,
  });
}
