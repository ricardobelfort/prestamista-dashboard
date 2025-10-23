import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteUserRequest {
  org_id: string;
  email: string;
  role: 'admin' | 'collector' | 'viewer';
  name?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase com privilégios admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verificar autenticação do usuário que está fazendo a requisição
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Verificar se o usuário tem permissão (owner ou admin)
    const { data: requestBody }: { data: InviteUserRequest } = await req.json();
    const { org_id, email, role, name } = requestBody;

    if (!org_id || !email || !role) {
      throw new Error('Missing required fields: org_id, email, role');
    }

    // Verificar se o usuário tem permissão na organização
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('organization_members')
      .select('role')
      .eq('org_id', org_id)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      throw new Error('User is not a member of this organization');
    }

    if (membership.role !== 'owner' && membership.role !== 'admin') {
      throw new Error('Insufficient permissions. Only owners and admins can invite users.');
    }

    // Verificar se o email já está cadastrado
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser?.users.some(u => u.email === email);

    if (userExists) {
      // Se o usuário já existe, apenas adicionar à organização
      const { data: existingUserData } = await supabaseAdmin.auth.admin.listUsers();
      const targetUser = existingUserData?.users.find(u => u.email === email);

      if (targetUser) {
        // Verificar se já é membro
        const { data: existingMembership } = await supabaseAdmin
          .from('organization_members')
          .select('*')
          .eq('org_id', org_id)
          .eq('user_id', targetUser.id)
          .single();

        if (existingMembership) {
          return new Response(
            JSON.stringify({ 
              error: 'User is already a member of this organization',
              alreadyMember: true
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Adicionar à organização
        const { error: insertError } = await supabaseAdmin
          .from('organization_members')
          .insert({
            org_id,
            user_id: targetUser.id,
            role
          });

        if (insertError) {
          throw insertError;
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'User added to organization successfully',
            userExists: true
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Enviar convite por email usando Supabase Auth
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:4200';
    
    // Detectar idioma preferido do usuário que está convidando (ou usar padrão)
    const inviterLanguage = user.user_metadata?.preferred_language || 'pt-BR';
    
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          org_id,
          role,
          name: name || '',
          invited_by: user.id,
          invited_at: new Date().toISOString(),
          preferred_language: inviterLanguage // Armazena idioma para usar no callback
        },
        redirectTo: `${siteUrl}/auth/callback?org_id=${org_id}&role=${role}&lang=${inviterLanguage}`
      }
    );

    if (inviteError) {
      throw inviteError;
    }

    console.log('Invite sent successfully:', { email, org_id, role });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Invitation email sent successfully',
        user: inviteData.user
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error inviting user:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
