// A tiny module-level store so the service layer can flag when it is serving
// demo data, and React can subscribe via useSyncExternalStore.
type Listener = () => void;

let offline = false;
const listeners = new Set<Listener>();

export const offlineStatus = {
  get: () => offline,

  set(value: boolean) {
    if (offline === value) return;
    offline = value;
    listeners.forEach((listener) => listener());
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
