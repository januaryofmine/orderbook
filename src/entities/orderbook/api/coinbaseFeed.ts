import type { Level, LevelUpdate, Side } from "../model/types";
import type { Feed } from "./feed";

interface CbUpdate {
  side: "bid" | "offer";
  price_level: string;
  new_quantity: string;
}
interface CbEvent {
  type: "snapshot" | "update";
  product_id: string;
  updates: CbUpdate[];
}
interface CbMessage {
  channel: string;
  events?: CbEvent[];
}

const mapSide = (s: "bid" | "offer"): Side => (s === "bid" ? "bid" : "ask");

export function createCoinbaseFeed(productId = "BTC-USD"): Feed {
  return {
    connect(onEvent) {
      let closed = false;
      let ws: WebSocket | null = null;

      const start = () => {
        if (closed) return;
        ws = new WebSocket("wss://advanced-trade-ws.coinbase.com");
        ws.onopen = () => {
          const sub = (channel: string) =>
            ws?.send(JSON.stringify({ type: "subscribe", product_ids: [productId], channel }));
          sub("level2");
          sub("heartbeats");
        };
        ws.onmessage = (msg) => {
          const data = JSON.parse(msg.data) as CbMessage;
          if (data.channel !== "l2_data" || !data.events) return;
          for (const ev of data.events) {
            if (ev.type === "snapshot") {
              const bids: Level[] = [];
              const asks: Level[] = [];
              for (const u of ev.updates) {
                const level = { price: +u.price_level, quantity: +u.new_quantity };
                if (level.quantity > 0) (u.side === "bid" ? bids : asks).push(level);
              }
              onEvent({ type: "snapshot", bids, asks });
            } else {
              const updates: LevelUpdate[] = ev.updates.map((u) => ({
                side: mapSide(u.side),
                price: +u.price_level,
                quantity: +u.new_quantity,
              }));
              onEvent({ type: "delta", updates });
            }
          }
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
