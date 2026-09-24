import assert from 'node:assert/strict';
import {test} from 'node:test';
import {parseSku} from '../lib/sku.ts';
import {filterProducts,emptyProductFilters} from '../lib/product-filters.ts';
const products=[
 {id:'1',name:'Anel Coração',sku:'AN-001',category:'Anéis',stock:3,stock_min:3},
 {id:'2',name:'Brinco Dourado',sku:'BR-002',category:'Brincos',stock:8,stock_min:3},
 {id:'3',name:'Anel Prata',sku:null,category:'Anéis',stock:0,stock_min:0},
];
const ids=filters=>filterProducts(products,{...emptyProductFilters,...filters}).map(p=>p.id);
test('SKU opcional, espaços e zeros à esquerda',()=>{
 for(const value of [undefined,null,'','   '])assert.equal(parseSku(value),null);
 assert.equal(parseSku('  001-a  '),'001-a');
 assert.equal(parseSku('A'.repeat(64)).length,64);
 for(const value of [123,{},[],'A'.repeat(65),'AB\nCD'])assert.throws(()=>parseSku(value));
});
test('busca ignora acentos e maiúsculas e encontra SKU',()=>{
 assert.deepEqual(ids({query:'CORACAO'}),['1']);
 assert.deepEqual(ids({query:'br-002'}),['2']);
 assert.deepEqual(ids({query:'anel AN-001'}),['1']);
});
test('filtros combinados, limite de estoque e produtos sem SKU',()=>{
 assert.deepEqual(ids({category:'Anéis',lowStock:true}),['1','3']);
 assert.deepEqual(ids({category:'Brincos',lowStock:true}),[]);
 assert.deepEqual(ids({query:'prata',lowStock:true}),['3']);
 assert.deepEqual(ids({query:'   '}),['1','2','3']);
 assert.deepEqual(ids({query:'inexistente'}),[]);
});
