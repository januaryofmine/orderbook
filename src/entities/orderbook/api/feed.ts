import type { OrderbookEvent } from "../model/types";

export interface Feed {
  connect(onEvent: (event: OrderbookEvent) => void): () => void;
}

export type FeedSource = "test" | "binance" | "coinbase";
