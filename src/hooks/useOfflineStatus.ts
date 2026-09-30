import { useSyncExternalStore } from "react";
import { offlineStatus } from "../services/offlineStatus";

export function useOfflineStatus() {
  return useSyncExternalStore(offlineStatus.subscribe, offlineStatus.get);
}
