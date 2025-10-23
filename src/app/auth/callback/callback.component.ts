import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../core/supabase.service';
import { ToastService } from '../../core/toast.service';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [LoadingComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50">
      <app-loading message="Processando autenticação..."></app-loading>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  async ngOnInit() {
    try {
      // Processar hash de autenticação do Supabase
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (!accessToken || !refreshToken) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Configurar sessão do usuário
      const { data: sessionData, error: sessionError } = await this.supabase.client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (sessionError || !sessionData.user) {
        throw sessionError || new Error('Erro ao configurar sessão');
      }

      const user = sessionData.user;

      // Verificar se é um convite (invitation) ou signup
      if (type === 'invite' || type === 'signup') {
        // Pegar org_id e role dos query params ou metadata
        const queryParams = this.route.snapshot.queryParams;
        const orgId = queryParams['org_id'] || user.user_metadata?.['org_id'];
        const role = queryParams['role'] || user.user_metadata?.['role'] || 'viewer';

        if (orgId) {
          // Verificar se o usuário já é membro da organização
          const { data: existingMembership } = await this.supabase.client
            .from('organization_members')
            .select('*')
            .eq('org_id', orgId)
            .eq('user_id', user.id)
            .single();

          if (!existingMembership) {
            // Adicionar usuário à organização
            const { error: memberError } = await this.supabase.client
              .from('organization_members')
              .insert({
                org_id: orgId,
                user_id: user.id,
                role: role
              });

            if (memberError) {
              console.error('Erro ao adicionar usuário à organização:', memberError);
              this.toastService.error('Erro ao processar convite. Entre em contato com o administrador.');
            } else {
              this.toastService.success('Convite aceito com sucesso! Bem-vindo à plataforma.');
            }
          } else {
            this.toastService.success('Login realizado com sucesso!');
          }
        }
      }

      // Redirecionar para dashboard
      this.router.navigate(['/dashboard']);
      
    } catch (error: any) {
      console.error('Erro no callback de autenticação:', error);
      this.toastService.error(error.message || 'Erro ao processar autenticação');
      this.router.navigate(['/login']);
    }
  }
}
