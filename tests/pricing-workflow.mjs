import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

function moduleURL(name, dependencies = {}) {
  let code = ts.transpileModule(readFileSync(new URL(`../lib/${name}.ts`, import.meta.url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;
  for (const [specifier, url] of Object.entries(dependencies)) code = code.replaceAll(`'${specifier}'`, JSON.stringify(url));
  return `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
}
const pricingURL = moduleURL('pricing');
const { initial, money } = await import(pricingURL);
const { nextPiece } = await import(moduleURL('next-piece', { './pricing': pricingURL }));
const { productReport, salesReport, reportHTML } = await import(moduleURL('print-report', { './pricing': pricingURL, './sales': moduleURL('sales') }));

test('próxima peça mantém custos sem herdar preço manual ou alterar origem', () => {
  const original = { ...initial, purchase: 25, freight: 80, quantity: 20, packaging: 3, overhead: 2, fixedFee: 1, fee: 5, tax: 6, margin: 35, sale: 99 };
  const next = nextPiece(original, 'Colares', true);
  assert.deepEqual(next, { category: 'Colares', values: { ...original, sale: 0 } });
  next.values.purchase = 40;
  assert.equal(original.purchase, 25);
  assert.deepEqual(nextPiece(original, 'Colares', false), { category: 'Brincos', values: initial });
});

test('relatório considera apenas a seleção e diferencia preço manual do sugerido', () => {
  const report = productReport([{ ...initial, name: 'Peça A', sku: '001', category: 'Anéis', purchase: 10, sale: 25, stock: 2, stock_min: 2 }], { query: '001', category: 'Anéis', lowStock: true });
  assert.equal(report.rows.length, 1);
  assert.equal(report.rows[0][3], money(16.67));
  assert.equal(report.rows[0][4], money(25));
  assert.deepEqual(report.totals[2], ['Valor de aquisição em estoque', money(20)]);
  assert.match(report.context, /Busca: 001/);
});

test('relatório de vendas exclui canceladas dos totais e preserva centavos', () => {
  const sale = { product_name: 'Peça', category: 'Brincos', quantity: 2, unit_price: 1234, total: 2468, cost_total: 800, fee_total: 125, sold_on: '2026-09-28', cancelled: 0 };
  const report = salesReport([sale, { ...sale, cancelled: 1, total: 100000 }], { start: '2026-09-01', end: '2026-09-28' });
  assert.equal(report.rows.length, 2);
  assert.deepEqual(report.totals[0], ['Faturamento', money(24.68)]);
  assert.deepEqual(report.totals[3], ['Lucro estimado', money(15.43)]);
  assert.equal(report.rows[1][7], 'Cancelada');
});

test('HTML de impressão escapa dados e repete cabeçalho em múltiplas páginas', () => {
  const report = productReport([{ ...initial, name: '<script>alert(1)</script>', sku: '"<&', category: 'Anéis', stock: 1, stock_min: 0 }], { query: '<img onerror=alert(1)>', category: '', lowStock: false });
  const html = reportHTML(report, new Date('2026-09-28T15:00:00Z'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('table-header-group'));
  assert.ok(html.includes('A4 landscape'));
});
