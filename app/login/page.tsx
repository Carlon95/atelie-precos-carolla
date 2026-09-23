import LoginForm from './form';
import {createClient} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Login(){const client=await createClient();const {data:{user}}=await client.auth.getUser();if(user)redirect('/');return <main className="login-shell"><section className="panel login-panel"><p className="eyebrow">BY CAROLLA · ATELIÊ DE PREÇOS</p><h1>Bem-vinda ao seu ateliê.</h1><p>Suas peças, seus custos e suas vendas em um só lugar.</p><LoginForm/></section></main>;}
