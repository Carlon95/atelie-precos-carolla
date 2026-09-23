import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Dashboard from './dashboard';
export const dynamic = 'force-dynamic';
export default async function Page(){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login');return <Dashboard/>;}
