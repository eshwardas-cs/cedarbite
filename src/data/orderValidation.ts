import type { OrderMode } from "../types";

type OrderReviewDetails = {
  itemCount: number;
  orderMode: OrderMode;
  pickupSlotId: string;
};

export function getOrderReviewError({
  itemCount,
  orderMode,
  pickupSlotId,
}: OrderReviewDetails): string | null {
  if (itemCount < 1) {
    return "Add at least one item to your bucket.";
  }

  if (orderMode === "scheduled" && !pickupSlotId) {
    return "Choose a pickup window before reviewing your order.";
  }

  return null;
}
