export type Direction = 'asc' | 'desc';

/** "1,299." | "₹1,299.00" | " 499 " -> number. Returns null when no number is present. */
export function parsePrice(text: string | null | undefined): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[^\d.]/g, '').replace(/\.$/, '');
  if (cleaned === '') return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export interface OrderViolation {
  index: number;
  previous: number;
  current: number;
}

/**
 * STRICT ordering check: returns the first adjacent pair that breaks the order, or null.
 * (The original suite "forgave" some violations, so an unsorted list could pass.)
 */
export function firstOutOfOrder(values: readonly number[], direction: Direction): OrderViolation | null {
  for (let i = 1; i < values.length; i++) {
    const previous = values[i - 1] as number;
    const current = values[i] as number;
    const broken = direction === 'asc' ? previous > current : previous < current;
    if (broken) return { index: i, previous, current };
  }
  return null;
}
