'use client';

import { useId } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { categories } from '@/lib/pricing';
import { emptyProductFilters, type ProductFilters as Filters } from '@/lib/product-filters';

type Props = { value: Filters; onChange: (value: Filters) => void; count: number; total: number };

export default function ProductFilters({ value, onChange, count, total }: Props) {
  const id = useId();
  const active = Boolean(value.query || value.category || value.lowStock);
  return <section className="panel product-filters" aria-label="Filtros de produtos">
    <div className="filter-heading"><span><SlidersHorizontal size={16} aria-hidden="true"/> Encontre suas peças</span>{active&&<button type="button" className="clear-filters" onClick={() => onChange({ ...emptyProductFilters })}><X size={14} aria-hidden="true"/> Limpar tudo</button>}</div>
    <div className="product-filter-fields">
      <label className="field" htmlFor={id + '-query'}>Nome ou SKU
        <div className="search-input"><Search size={18} aria-hidden="true"/><input id={id + '-query'} type="search" className="plain-input" placeholder="Ex.: argola ou BR-001" value={value.query} onChange={e => onChange({ ...value, query: e.target.value })}/></div>
      </label>
      <label className="field" htmlFor={id + '-category'}>Categoria
        <select id={id + '-category'} className="plain-input" value={value.category} onChange={e => onChange({ ...value, category: e.target.value })}>
          <option value="">Todas as categorias</option>
          {categories.map(category => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>
      <label className={'low-stock-filter'+(value.lowStock?' selected':'')} htmlFor={id + '-stock'}>
        <input id={id + '-stock'} type="checkbox" checked={value.lowStock} onChange={e => onChange({ ...value, lowStock: e.target.checked })}/>
        <span>Precisa repor<small>Estoque baixo ou zerado</small></span>
      </label>
    </div>
    <div className="filter-footer"><p className="filter-count" role="status"><strong>{count}</strong> de {total} {total===1?'produto':'produtos'}</p>{active&&<div className="active-filters" aria-label="Filtros ativos">{value.query&&<button type="button" onClick={()=>onChange({...value,query:''})} aria-label="Remover busca">Busca: {value.query}<X size={12} aria-hidden="true"/></button>}{value.category&&<button type="button" onClick={()=>onChange({...value,category:''})} aria-label="Remover filtro de categoria">{value.category}<X size={12} aria-hidden="true"/></button>}{value.lowStock&&<button type="button" onClick={()=>onChange({...value,lowStock:false})} aria-label="Remover filtro de estoque">Precisa repor<X size={12} aria-hidden="true"/></button>}</div>}</div>
  </section>;
}
