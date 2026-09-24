import type { Product } from './pricing';

export type ProductFilters = { query: string; category: string; lowStock: boolean };
export const emptyProductFilters: ProductFilters = { query: '', category: '', lowStock: false };
const searchable = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const terms = searchable(filters.query.trim()).split(/\s+/).filter(Boolean);
  return products.filter(product =>
    (!filters.category || product.category === filters.category) &&
    (!filters.lowStock || product.stock <= product.stock_min) &&
    terms.every(term => searchable(product.name + ' ' + (product.sku ?? '')).includes(term))
  );
}
