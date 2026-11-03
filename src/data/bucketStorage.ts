import { menuItems } from "./menu";

export type BucketContents = Record<string, number>;

const STORAGE_KEY = "cedarbite.bucket.v1";
const validItemIds = new Set(menuItems.map((item) => item.id));

export function loadBucket(): BucketContents {
  try {
    const savedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!savedValue) return {};

    const parsedValue: unknown = JSON.parse(savedValue);
    if (
      typeof parsedValue !== "object" ||
      parsedValue === null ||
      Array.isArray(parsedValue)
    ) {
      return {};
    }

    const bucket: BucketContents = {};
    for (const [itemId, quantity] of Object.entries(parsedValue)) {
      if (
        validItemIds.has(itemId) &&
        typeof quantity === "number" &&
        Number.isSafeInteger(quantity) &&
        quantity > 0
      ) {
        bucket[itemId] = quantity;
      }
    }
    return bucket;
  } catch {
    return {};
  }
}

export function saveBucket(bucket: BucketContents): boolean {
  try {
    const validBucket: BucketContents = {};
    for (const [itemId, quantity] of Object.entries(bucket)) {
      if (
        validItemIds.has(itemId) &&
        Number.isSafeInteger(quantity) &&
        quantity > 0
      ) {
        validBucket[itemId] = quantity;
      }
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validBucket));
    return true;
  } catch {
    return false;
  }
}
