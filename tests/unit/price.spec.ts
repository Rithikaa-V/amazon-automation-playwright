import { expect, test } from '@playwright/test';
import { firstOutOfOrder, parsePrice } from '../../src/utils/price';
import { escapeRegExp } from '../../src/utils/regex';

test.describe('parsePrice', () => {
  const cases: [string | null | undefined, number | null][] = [
    ['1,299.', 1299],
    ['₹1,299.00', 1299],
    [' 499 ', 499],
    ['12,34,567', 1234567],
    ['', null],
    [null, null],
    [undefined, null],
    ['Currently unavailable', null],
    ['1.2.3', null],
  ];
  for (const [input, expected] of cases) {
    test(`parsePrice(${JSON.stringify(input)}) -> ${expected}`, () => {
      expect(parsePrice(input)).toBe(expected);
    });
  }
});

test.describe('firstOutOfOrder', () => {
  test('accepts ascending and equal neighbours', () => {
    expect(firstOutOfOrder([100, 200, 200, 300], 'asc')).toBeNull();
  });

  test('accepts descending', () => {
    expect(firstOutOfOrder([300, 200, 200, 100], 'desc')).toBeNull();
  });

  test('empty and single-item lists are trivially ordered', () => {
    expect(firstOutOfOrder([], 'asc')).toBeNull();
    expect(firstOutOfOrder([5], 'desc')).toBeNull();
  });

  test('reports the first violation', () => {
    expect(firstOutOfOrder([100, 300, 200, 400], 'asc')).toEqual({ index: 2, previous: 300, current: 200 });
  });

  // Regression: the original validator FORGAVE this list (prev <= next => `continue`),
  // so an unsorted result page passed.
  test('regression: [100, 300, 200, 400] is NOT sorted ascending', () => {
    expect(firstOutOfOrder([100, 300, 200, 400], 'asc')).not.toBeNull();
  });
});

test.describe('escapeRegExp', () => {
  test('neutralises regex metacharacters', () => {
    const name = 'A.B (home) [1]';
    expect(new RegExp(escapeRegExp(name)).test(name)).toBe(true);
    expect(new RegExp(escapeRegExp(name)).test('AxB (home) [1]')).toBe(false);
  });
});
