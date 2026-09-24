'use client';

import { useId } from 'react';
import { categories } from '@/lib/pricing';
import { emptyProductFilters, type ProductFilters as Filters } from '@/lib/product-filters';

type Props = {
  value: Filters;
  onChange: (value: Filters) => void;
  count: number;
  total: number;
};

export default function ProductFilters({ value, onChange, count, total }: Props) {
  const id = useId();
  const active = Boolean(value.query || value.category || value.lowStock);
  return <section className="panel product-filters" aria-label="Filtros de produtos">
    <div className="product-filter-fields">
      <label className="field" htmlFor={id + '-query'}>Buscar produto
        <input id={id + '-query'} type="search" className="plain-input" placeholder="Nome ou SKU da peça" value={value.query} onChange={e => onChange({ ...value, query: e.target.value })}/>
      </label>
      <label className="field" htmlFor={id + '-category'}>Categoria
        <select id={id + '-category'} className="plain-input" value={value.category} onChange={e => onChange({ ...value, category: e.target.value })}>
          <option value="">Todas as categorias</option>
          {categories.map(category => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>
      <label className="low-stock-filter" htmlFor={id + '-stock'}>
        <input id={id + '-stock'} type="checkbox" checked={value.lowStock} onChange={e => onChange({ ...value, lowStock: e.target.checked })}/>
        Apenas estoque baixo ou zerado
      </label>
      <button type="button" className="outline" disabled={!active} onClick={() => onChange({ ...emptyProductFilters })}>Limpar filtros</button>
    </div>
    <p className="filter-count" role="status">{count} de {total} produtos encontrados</p>
  </section>;
}
