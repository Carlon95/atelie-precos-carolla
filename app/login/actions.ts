'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
export async function login(_state:{error:string},form:FormData){
 const email=String(form.get('email')||'').trim(),password=String(form.get('password')||'');
 if(!email||!password)return {error:'Informe seu e-mail e sua senha.'};
 const client=await createClient();
 const {error}=await client.auth.signInWithPassword({email,password});
 if(error)return {error:'Não foi possível entrar. Confira e-mail e senha e tente novamente.'};
 redirect('/');
}
