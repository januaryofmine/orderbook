import { useMemo } from "react";
import { type OrderbookStore, Row, useOrderbook } from "@/entities/orderbook";

export function Orderbook({ store }: { store: OrderbookStore }) {
  const { bids, asks } = useOrderbook(store);

  const asksToRender = useMemo(() => [...asks].reverse(), [asks]);
  const spread =
    bids[0] && asks[0] ? (asks[0].price - bids[0].price).toFixed(2) : "–";

  return (
    <div style={{ fontFamily: "monospace", width: 200 }}>
      {asksToRender.map((l) => (
        <Row key={`a-${l.price}`} {...l} color="#e5484d" />
      ))}
      <div style={{ opacity: 0.6, textAlign: "center", padding: "2px 0" }}>
        spread {spread}
      </div>
      {bids.map((l) => (
        <Row key={`b-${l.price}`} {...l} color="#30a46c" />
      ))}
    </div>
  );
}
