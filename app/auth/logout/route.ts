import { createClient } from '@/lib/supabase/server';
import { sameOrigin } from '@/lib/storage';
export async function POST(request:Request){if(!sameOrigin(request))return new Response('Origem inválida',{status:403});const client=await createClient();await client.auth.signOut();return new Response(null,{status:303,headers:{Location:'/login','Cache-Control':'no-store'}});}
