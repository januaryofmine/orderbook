export type Side = "bid" | "ask";

export interface Level {
  price: number;
  quantity: number;
}

export interface LevelUpdate {
  side: Side;
  price: number;
  quantity: number;
}

export type OrderbookEvent =
  | { type: "snapshot"; bids: Level[]; asks: Level[] }
  | { type: "delta"; updates: LevelUpdate[] };

export interface BookSnapshot {
  bids: Level[];
  asks: Level[];
  version: number;
}
