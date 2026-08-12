import { mulberry32 } from "@/shared/lib/prng";
import type { Level, Side } from "../model/types";
import type { Feed } from "./feed";

export function createTestFeed({
  seed = 1,
  levels = 12,
  mid = 100,
  tick = 0.1,
  updatesPerSecond = 200,
}: {
  seed?: number;
  levels?: number;
  mid?: number;
  tick?: number;
  updatesPerSecond?: number;
} = {}): Feed {
  return {
    connect(onEvent) {
      const rnd = mulberry32(seed);

      const make = (direction: number): Level[] =>
        Array.from({ length: levels }, (_, i) => ({
          price: +(mid + direction * tick * (i + 1)).toFixed(4),
          quantity: 1 + Math.floor(rnd() * 20),
        }));
      onEvent({ type: "snapshot", bids: make(-1), asks: make(1) });

      const id = setInterval(
        () => {
          const side: Side = rnd() < 0.5 ? "bid" : "ask";
          const direction = side === "bid" ? -1 : 1;
          const price = +(mid + direction * tick * (1 + Math.floor(rnd() * levels))).toFixed(4);
          const quantity = rnd() < 0.15 ? 0 : 1 + Math.floor(rnd() * 30);
          onEvent({ type: "delta", updates: [{ side, price, quantity }] });
        },
        Math.max(1, 1000 / updatesPerSecond),
      );

      return () => clearInterval(id);
    },
  };
}
