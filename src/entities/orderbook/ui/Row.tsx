import { memo } from "react";
import type { Level } from "../model/types";

export const Row = memo(function Row({
  price,
  quantity,
  color,
}: Level & { color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", color }}>
      <span>{price.toFixed(2)}</span>
      <span>{quantity}</span>
    </div>
  );
});
