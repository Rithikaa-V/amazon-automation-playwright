export const SEARCH = { term: 'wireless headphones', brand: 'boAt' } as const;

export const SORTS = [
  { label: 'Price: Low to High', param: 'price-asc-rank', direction: 'asc' },
  { label: 'Price: High to Low', param: 'price-desc-rank', direction: 'desc' },
] as const;

export const DELIVERY_LOCATIONS = [
  { city: 'Bengaluru', pincode: '560001' },
  { city: 'Mumbai', pincode: '400001' },
  { city: 'Delhi', pincode: '110001' },
] as const;
