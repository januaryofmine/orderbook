import type { Level, LevelUpdate, Side } from "../model/types";
import type { Feed } from "./feed";

type PriceQty = [string, string];
interface DepthUpdate {
  U: number;
  u: number;
  b: PriceQty[];
  a: PriceQty[];
}
interface DepthSnapshot {
  lastUpdateId: number;
  bids: PriceQty[];
  asks: PriceQty[];
}

const toLevels = (arr: PriceQty[]): Level[] =>
  arr.map(([p, q]) => ({ price: +p, quantity: +q }));
const toUpdates = (arr: PriceQty[], side: Side): LevelUpdate[] =>
  arr.map(([p, q]) => ({ side, price: +p, quantity: +q }));

export function createBinanceFeed(symbol = "btcusdt"): Feed {
  return {
    connect(onEvent) {
      let closed = false;
      let ws: WebSocket | null = null;
      let buffer: DepthUpdate[] = [];
      let synced = false;
      let updateId = 0;

      const emitDelta = (e: DepthUpdate) => {
        onEvent({
          type: "delta",
          updates: [...toUpdates(e.b, "bid"), ...toUpdates(e.a, "ask")],
        });
      };

      const handle = (e: DepthUpdate) => {
        if (e.u <= updateId) return;
        if (e.U > updateId + 1) {
          ws?.close();
          return;
        }
        emitDelta(e);
        updateId = e.u;
      };

      const syncSnapshot = async () => {
        try {
          const res = await fetch(
            `https://api.binance.com/api/v3/depth?symbol=${symbol.toUpperCase()}&limit=1000`,
          );
          const snap = (await res.json()) as DepthSnapshot;
          if (closed) return;
          updateId = snap.lastUpdateId;
          onEvent({ type: "snapshot", bids: toLevels(snap.bids), asks: toLevels(snap.asks) });
          const pending = buffer.filter((e) => e.u > updateId);
          buffer = [];
          synced = true;
          for (const e of pending) handle(e);
        } catch {
          if (!closed) ws?.close();
        }
      };

      const start = () => {
        if (closed) return;
        buffer = [];
        synced = false;
        ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@depth@100ms`);
        ws.onopen = () => {
          void syncSnapshot();
        };
        ws.onmessage = (msg) => {
          const e = JSON.parse(msg.data) as DepthUpdate;
          if (!synced) buffer.push(e);
          else handle(e);
        };
        ws.onerror = () => ws?.close();
        ws.onclose = () => {
          if (!closed) setTimeout(start, 1000);
        };
      };

      start();
      return () => {
        closed = true;
        ws?.close();
      };
    },
  };
}
