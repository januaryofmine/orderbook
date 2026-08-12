import { type Book, createBook } from "./book";
import type { BookSnapshot, OrderbookEvent } from "./types";

export function createOrderbookStore(depth = 12) {
  const book: Book = createBook();
  const listeners = new Set<() => void>();

  let snapshot: BookSnapshot = { bids: [], asks: [], version: 0 };
  let dirty = false;
  let scheduled = false;

  function flush(): void {
    scheduled = false;
    if (!dirty) return;
    dirty = false;
    snapshot = {
      bids: book.levels("bid", depth),
      asks: book.levels("ask", depth),
      version: snapshot.version + 1,
    };
    for (const listener of listeners) listener();
  }

  return {
    apply(event: OrderbookEvent): void {
      book.apply(event);
      dirty = true;
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(flush);
      }
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot(): BookSnapshot {
      return snapshot;
    },
  };
}

export type OrderbookStore = ReturnType<typeof createOrderbookStore>;
