export type PickupSlot = {
  id: string;
  label: string;
};

function makeSlotId(slot: Date): string {
  const year = slot.getFullYear();
  const month = String(slot.getMonth() + 1).padStart(2, "0");
  const day = String(slot.getDate()).padStart(2, "0");
  const hour = String(slot.getHours()).padStart(2, "0");
  const minute = String(slot.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function getUpcomingPickupSlots(
  now: Date = new Date(),
  unavailableSlotIds: ReadonlySet<string> = new Set(),
): PickupSlot[] {
  const lastPickupTime = new Date(now);
  lastPickupTime.setHours(16, 0, 0, 0);

  const oneHourAhead = new Date(now.getTime() + 60 * 60 * 1000);
  const slots: PickupSlot[] = [];

  for (let minuteOfDay = 8 * 60; minuteOfDay <= 16 * 60; minuteOfDay += 10) {
    const slotTime = new Date(now);
    slotTime.setHours(
      Math.floor(minuteOfDay / 60),
      minuteOfDay % 60,
      0,
      0,
    );

    const slotId = makeSlotId(slotTime);

    if (
      slotTime <= now ||
      slotTime > lastPickupTime ||
      slotTime > oneHourAhead ||
      unavailableSlotIds.has(slotId)
    ) {
      continue;
    }

    slots.push({
      id: slotId,
      label: slotTime.toLocaleTimeString("en-PK", {
        hour: "numeric",
        minute: "2-digit",
      }),
    });

    if (slots.length === 6) {
      break;
    }
  }

  return slots;
}
