import {identity,failure,sameOrigin,check,bucketName} from '@/lib/storage';
import {calculate,keys,categories,type Values} from '@/lib/pricing';
export const dynamic='force-dynamic';
function present(row:Record<string,unknown>){const {data,owner,...rest}=row;void owner;return {...rest,...data as object,photo:row.photo?`/api/photos/${row.id}?v=${encodeURIComponent(String(row.updated_at))}`:null};}
export async function GET(){try{const {client,owner}=await identity();let rows:Record<string,unknown>[]=[];for(let offset=0;;offset+=1000){const {data,error}=await client.from('products').select('*').eq('owner',owner).order('updated_at',{ascending:false}).order('id').range(offset,offset+999);check(error);rows.push(...data!);if(data!.length<1000)break;}return Response.json(rows.map(present),{headers:{'Cache-Control':'no-store'}});}catch(e){return failure(e);}}
export async function POST(request:Request){const context=await identity().catch(()=>null);if(!context)return failure(new Error('AUTH'));const {client,owner}=context;let uploaded:string|null=null;try{
 if(!sameOrigin(request))return Response.json({error:'Origem inválida.'},{status:403});
 if(Number(request.headers.get('content-length')||0)>3.5*1024*1024)return Response.json({error:'Envie uma foto de até 3 MB.'},{status:413});
 const form=await request.formData();let input;try{input=JSON.parse(String(form.get('data')));}catch{return Response.json({error:'Dados inválidos.'},{status:400});}
 if(!input||typeof input!=='object')return Response.json({error:'Dados inválidos.'},{status:400});
 const name=String(input.name||'').trim(),category=String(input.category||'');const values=Object.fromEntries(keys.map(k=>[k,input[k]])) as Values;
 if(!name||name.length>120||!categories.includes(category)||keys.some(k=>typeof values[k]!=='number'||values[k]>10000000)||!calculate(values).valid)return Response.json({error:'Revise o nome, os custos e as porcentagens.'},{status:400});
 const id=input.id?String(input.id):crypto.randomUUID();
 const existing=input.id?await client.from('products').select('*').eq('id',id).eq('owner',owner).maybeSingle():{data:null,error:null};check(existing.error);const old=existing.data;
 if(input.id&&!old)return Response.json({error:'Produto não encontrado.'},{status:404});
 let photo=input.removePhoto?null:old?.photo||null;const file=form.get('photo');
 if(file instanceof File&&file.size){
 if(file.size>3*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))return Response.json({error:'Use JPG, PNG ou WebP de até 3 MB.'},{status:400});
 const bytes=await file.arrayBuffer(),b=new Uint8Array(bytes);const signature=file.type==='image/jpeg'?b[0]===255&&b[1]===216&&b[2]===255:file.type==='image/png'?b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71:new TextDecoder().decode(b.slice(0,4))==='RIFF'&&new TextDecoder().decode(b.slice(8,12))==='WEBP';
 if(!signature)return Response.json({error:'O arquivo não é uma imagem válida.'},{status:400});
 const path=`${owner}/${crypto.randomUUID()}`;const {error}=await client.storage.from(bucketName).upload(path,bytes,{contentType:file.type,upsert:false});check(error);uploaded=path;photo=path;
 }
 const update={name,category,data:values,photo,updated_at:new Date().toISOString()};
 const result=old?await client.from('products').update(update).eq('id',id).eq('owner',owner).select('*').single():await client.from('products').insert({id,owner,...update}).select('*').single();check(result.error);uploaded=null;
 if(old?.photo&&old.photo!==photo)await client.storage.from(bucketName).remove([old.photo]);
 return Response.json(present(result.data));
 }catch(e){if(uploaded)await client.storage.from(bucketName).remove([uploaded]);return failure(e);}}
export async function DELETE(request:Request){try{const {client,owner}=await identity();if(!sameOrigin(request))return Response.json({error:'Origem inválida.'},{status:403});const {id}=await request.json();const {data,error}=await client.from('products').delete().eq('id',String(id)).eq('owner',owner).select('photo').maybeSingle();if(error?.code==='23503')return Response.json({error:'Este produto tem vendas registradas e deve ser mantido para preservar o histórico.'},{status:409});check(error);if(!data)return Response.json({error:'Produto não encontrado.'},{status:404});if(data.photo)await client.storage.from(bucketName).remove([data.photo]);return Response.json({ok:true});}catch(e){return failure(e);}}
