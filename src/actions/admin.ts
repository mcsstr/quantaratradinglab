"use server";
import { createClient } from '@supabase/supabase-js';

/**
 * Server Action para atualização do Email na tabela auth.users.
 * CUIDADO: Este projeto atualmente usa VITE (React SPA) e não Next.js App Router.
 * Importar esta Server Action diretamente num componente Vite causará erro no navegador
 * e vazamento de chaves ou quebra de compilação (process.env is not defined).
 */
export async function updateAuthEmailAction(userId: string, newEmail: string) {
    // Inicializa o cliente com privilégios de administrador (bypassa RLS)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: newEmail,
    });

    if (error) throw new Error(error.message);
    return data;
}
