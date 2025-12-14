// app/admin/social-proof/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SocialProofClient from './SocialProofClient';

export const metadata = {
    title: "Social Proof Admin | InnovaPort",
};

export default async function SocialProofAdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login?redirectTo=/admin/social-proof');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    return <SocialProofClient />;
}