import { createBinanceFeed } from "./binanceFeed";
import { createCoinbaseFeed } from "./coinbaseFeed";
import { createTestFeed } from "./testFeed";
import type { Feed, FeedSource } from "./feed";

export function createFeed(source: FeedSource, updatesPerSecond = 200): Feed {
  switch (source) {
    case "binance":
      return createBinanceFeed("btcusdt");
    case "coinbase":
      return createCoinbaseFeed("BTC-USD");
    default:
      return createTestFeed({ updatesPerSecond });
  }
}
