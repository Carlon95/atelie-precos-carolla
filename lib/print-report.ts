import { calculate, money, type Product } from './pricing';
import { summarize, type Sale } from './sales';
import type { ProductFilters } from './product-filters';

export type PrintReport = {
  title: string;
  context: string;
  totals: [string, string][];
  columns: string[];
  rows: (string | number)[][];
  note: string;
};
const dateLabel = (date: string) => date.split('-').reverse().join('/');

export function productReport(products: Product[], filters: ProductFilters): PrintReport {
  const context = [filters.query.trim() && `Busca: ${filters.query.trim()}`, filters.category && `Categoria: ${filters.category}`, filters.lowStock && 'Estoque baixo ou zerado'].filter(Boolean).join(' · ') || 'Todos os produtos';
  return {
    title: 'Produtos, preços e estoque', context,
    totals: [['Produtos', String(products.length)], ['Peças em estoque', String(products.reduce((n, p) => n + p.stock, 0))], ['Valor de aquisição em estoque', money(products.reduce((n, p) => n + p.stock * (p.purchase + p.freight / p.quantity), 0))]],
    columns: ['Produto / categoria', 'SKU', 'Custo por peça', 'Preço sugerido', 'Preço de venda', 'Saldo / mínimo', 'Situação'],
    rows: products.map(p => { const r = calculate(p); return [`${p.name}\n${p.category}`, p.sku || '—', money(r.cost), money(r.suggested), money(r.price), `${p.stock} / ${p.stock_min}`, p.stock === 0 ? 'Sem estoque' : p.stock <= p.stock_min ? 'Repor' : 'Disponível']; }),
    note: 'Os totais consideram apenas os produtos filtrados. Custo por peça inclui os custos informados na precificação. Valor de aquisição em estoque considera compra e frete. Preço de venda usa o valor manual, quando informado, ou o preço sugerido.',
  };
}

export function salesReport(sales: Sale[], period: { start: string; end: string }): PrintReport {
  const total = summarize(sales);
  return {
    title: 'Vendas por período', context: `De ${dateLabel(period.start)} a ${dateLabel(period.end)}`,
    totals: [['Faturamento', money(total.revenue / 100)], ['Custos', money(total.cost / 100)], ['Taxas e impostos', money(total.fees / 100)], ['Lucro estimado', money(total.profit / 100)], ['Peças vendidas', String(total.units)]],
    columns: ['Data', 'Produto / categoria', 'Qtde.', 'Preço unitário', 'Total', 'Custos + taxas', 'Lucro estimado', 'Situação'],
    rows: sales.map(s => [dateLabel(s.sold_on), `${s.product_name}\n${s.category}`, s.quantity, money(s.unit_price / 100), money(s.total / 100), money((s.cost_total + s.fee_total) / 100), money((s.total - s.cost_total - s.fee_total) / 100), s.cancelled ? 'Cancelada' : 'Confirmada']),
    note: 'Vendas canceladas aparecem para conferência, mas não entram nos totais. Os valores usam os custos e as taxas registrados no momento da venda. O lucro é uma estimativa baseada nas despesas informadas.',
  };
}

const escapeHTML = (value: string | number) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function reportHTML(report: PrintReport, generatedAt = new Date()): string {
  const stamp = generatedAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHTML(report.title)} - By Carolla</title><style>
    @page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}body{margin:0;padding:24px;font:12px/1.5 Arial,sans-serif;color:#183d36;background:#fff}header{border-bottom:2px solid #1a7161;padding-bottom:14px;margin-bottom:18px}.brand{font-size:11px;letter-spacing:2px;text-transform:uppercase}h1{font:28px Georgia,serif;margin:8px 0}p{margin:6px 0}.stamp{font-size:11px;color:#546b65}.totals{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0}.metric{border:1px solid #cbd7d0;padding:10px 14px;flex:1;min-width:125px}.metric span{display:block;font-size:10px}.metric strong{font-size:18px}table{border-collapse:collapse;width:100%;table-layout:fixed;font-size:11px}th,td{padding:9px 7px;border-bottom:1px solid #d8e0db;text-align:left;vertical-align:top;white-space:pre-line;overflow-wrap:anywhere}th{background:#edf3ef;font-weight:bold}th:first-child{width:20%}thead{display:table-header-group}tr{break-inside:avoid;page-break-inside:avoid}.note{margin-top:18px;font-size:10px;color:#425a53}footer{border-top:1px solid #d8e0db;margin-top:20px;padding-top:8px;font-size:10px}@media screen{body{min-width:900px}}@media print{body{padding:0}.totals,header{break-inside:avoid}th{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
    </style></head><body><header><div class="brand">By Carolla · Ateliê de Preços</div><h1>${escapeHTML(report.title)}</h1><p>${escapeHTML(report.context)}</p><p class="stamp">Gerado em ${escapeHTML(stamp)} (horário de Brasília)</p></header><section class="totals">${report.totals.map(([label, value]) => `<div class="metric"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong></div>`).join('')}</section><table><thead><tr>${report.columns.map(c => `<th scope="col">${escapeHTML(c)}</th>`).join('')}</tr></thead><tbody>${report.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHTML(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table><p class="note">${escapeHTML(report.note)}</p><footer>By Carolla · Relatório para conferência interna · ${report.rows.length} ${report.rows.length === 1 ? 'registro' : 'registros'}</footer></body></html>`;
}
