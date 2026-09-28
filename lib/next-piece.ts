import { initial, type Values } from './pricing';

// A new piece never inherits an identity, photo or manual price override.
export function nextPiece(values: Values, category: string, keepPricing: boolean) {
  return {
    values: keepPricing ? { ...values, sale: 0 } : { ...initial },
    category: keepPricing ? category : 'Brincos',
  };
}
