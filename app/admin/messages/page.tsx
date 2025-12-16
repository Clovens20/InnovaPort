import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { MessagesClient } from './messages-client';

export default async function MessagesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    return <MessagesClient />;
}

