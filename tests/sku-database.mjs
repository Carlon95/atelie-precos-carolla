import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const setup=readFileSync(new URL('database.mjs',import.meta.url),'utf8').match(/await db.exec\(`([\s\S]*?)`\);/)[1];
const schema=readFileSync(new URL('../supabase/schema.sql',import.meta.url),'utf8');
const upgrade=readFileSync(new URL('../supabase/upgrade-sku.sql',import.meta.url),'utf8');
for(const legacy of [false,true]){
 const db=new PGlite();await db.exec(setup);
 const base=legacy?schema.replace(/^ sku text.*\n/m,'').replace(/^create unique index products_owner_sku_idx.*\n/m,'').replaceAll('name,sku,category','name,category'):schema;
 await db.exec(base);
 const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';
 await db.exec(`insert into auth.users values('${a}'),('${b}');insert into products(owner,name,category,data) values('${a}','Existente','Brincos','{}');`);
 await db.exec(upgrade);await db.exec(upgrade);
 assert.equal((await db.query('select sku from products')).rows[0].sku,null);
 await db.exec(`set role authenticated;set app.user_id='${a}';`);
 const insert=sku=>db.query('insert into products(owner,name,category,data,sku) values($1,$2,$3,$4,$5) returning id',[a,'Peça','Brincos',{},sku]);
 const {rows:[product]}=await insert('001-A');
 await assert.rejects(insert('001-a'),/products_owner_sku_idx/);
 await insert(null);await insert(null);
 for(const sku of ['', ' padded ', 'A'.repeat(65),'AB\nCD'])await assert.rejects(insert(sku),/products_sku_valid/);
 await db.query('update products set sku=$1 where id=$2',['002-B',product.id]);
 assert.equal((await db.query('select sku from products where id=$1',[product.id])).rows[0].sku,'002-B');
 await db.exec(`set app.user_id='${b}';`);
 assert.equal((await db.query('select count(*)::int as n from products')).rows[0].n,0);
 await db.query('insert into products(owner,name,category,data,sku) values($1,$2,$3,$4,$5)',[b,'Outra conta','Brincos',{},'002-b']);
 assert.equal((await db.query('update products set sku=$1 where id=$2 returning id',['OUTRO',product.id])).rows.length,0);
 await db.exec('set role anon');await assert.rejects(db.query('select sku from products'),/permission denied/);
 await db.close();console.log('PASS: SKU, duplicidade, edição e isolamento — '+(legacy?'atualização':'banco novo'));
}
