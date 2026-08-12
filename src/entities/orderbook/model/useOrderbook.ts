import { useSyncExternalStore } from "react";
import type { OrderbookStore } from "./store";
import type { BookSnapshot } from "./types";

export function useOrderbook(store: OrderbookStore): BookSnapshot {
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}
