import { useQuery } from "@tanstack/react-query";
import { campusService } from "../services/campusService";

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: campusService.getStudents,
  });
}
