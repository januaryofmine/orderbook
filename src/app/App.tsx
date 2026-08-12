import { useEffect, useMemo, useState } from "react";
import { createFeed, createOrderbookStore, type FeedSource } from "@/entities/orderbook";
import { Orderbook } from "@/widgets/orderbook";

const DEPTH = 15;

export function App() {
  const [source, setSource] = useState<FeedSource>("test");
  const [updatesPerSecond, setUpdatesPerSecond] = useState(24);
  const [running, setRunning] = useState(true);

  const { store, feed } = useMemo(
    () => ({
      store: createOrderbookStore(DEPTH),
      feed: createFeed(source, updatesPerSecond),
    }),
    [source, updatesPerSecond],
  );

  useEffect(() => {
    if (!running) return;
    return feed.connect((event) => store.apply(event));
  }, [feed, store, running]);

  const isLive = source !== "test";

  return (
    <div style={{ fontFamily: "monospace", padding: 24 }}>
      <h2>Orderbook demo</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label>
          source{" "}
          <select value={source} onChange={(e) => setSource(e.target.value as FeedSource)}>
            <option value="test">Test data</option>
            <option value="coinbase">Coinbase BTC-USD (live)</option>
            <option value="binance">Binance BTC-USDT (live)</option>
          </select>
        </label>

        {!isLive && (
          <label>
            updates/s{" "}
            <input
              type="number"
              min={1}
              max={2000}
              value={updatesPerSecond}
              onChange={(e) => setUpdatesPerSecond(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </label>
        )}

        <button type="button" onClick={() => setRunning((r) => !r)}>
          {running ? "pause" : "start"}
        </button>
      </div>

      <Orderbook store={store} />

    </div>
  );
}
