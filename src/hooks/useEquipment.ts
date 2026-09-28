import { useQuery } from "@tanstack/react-query";
import { campusService } from "../services/campusService";

export function useEquipment() {
  return useQuery({
    queryKey: ["equipment"],
    queryFn: campusService.getEquipment,
  });
}
