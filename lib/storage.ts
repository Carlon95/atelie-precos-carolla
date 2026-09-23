import { createClient } from './supabase/server';
export async function identity(){const client=await createClient();const {data:{user},error}=await client.auth.getUser();if(error||!user)throw new Error('AUTH');return {client,owner:user.id};}
export function failure(e:unknown){console.error(e);const auth=e instanceof Error&&e.message==='AUTH';return Response.json({error:auth?'Sua sessão expirou. Saia e entre novamente.':'Não foi possível concluir a operação. Tente novamente.'},{status:auth?401:500,headers:{'Cache-Control':'no-store'}});}
export function sameOrigin(r:Request){const origin=r.headers.get('origin');return !!origin&&origin===new URL(r.url).origin;}
export function check(error:unknown){if(error)throw error;}
export const bucketName='product-photos';
