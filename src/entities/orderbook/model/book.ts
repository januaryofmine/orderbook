import type { Level, OrderbookEvent, Side } from "./types";

export function createBook() {
  const bids = new Map<number, number>();
  const asks = new Map<number, number>();
  const sideOf = (side: Side) => (side === "bid" ? bids : asks);

  function apply(event: OrderbookEvent): void {
    if (event.type === "snapshot") {
      bids.clear();
      asks.clear();
      for (const l of event.bids) if (l.quantity > 0) bids.set(l.price, l.quantity);
      for (const l of event.asks) if (l.quantity > 0) asks.set(l.price, l.quantity);
      return;
    }
    for (const u of event.updates) {
      const side = sideOf(u.side);
      if (u.quantity > 0) side.set(u.price, u.quantity);
      else side.delete(u.price);
    }
  }

  function levels(side: Side, depth: number): Level[] {
    const direction = side === "bid" ? -1 : 1;
    return [...sideOf(side)]
      .map(([price, quantity]) => ({ price, quantity }))
      .sort((a, b) => (a.price - b.price) * direction)
      .slice(0, depth);
  }

  return { apply, levels };
}

export type Book = ReturnType<typeof createBook>;
