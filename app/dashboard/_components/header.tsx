import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { HeaderClient } from "./header-client";

export async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const userInitials = user?.user_metadata?.full_name 
        ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.slice(0, 2).toUpperCase() || 'U';
    
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';

    return (
        <HeaderClient userInitials={userInitials} userName={userName} />
    );
}
