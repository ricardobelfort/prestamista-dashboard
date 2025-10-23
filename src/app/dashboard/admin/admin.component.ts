import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faBuilding,
  faUsers,
  faUserPlus,
  faEdit,
  faTrash,
  faPlus,
  faCopy,
  faCheck,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';

import { AdminService, Organization, OrganizationMember } from '../../core/admin.service';
import { ToastService } from '../../core/toast.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, ConfirmationModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  // Icons
  faBuilding = faBuilding;
  faUsers = faUsers;
  faUserPlus = faUserPlus;
  faEdit = faEdit;
  faTrash = faTrash;
  faPlus = faPlus;
  faCopy = faCopy;
  faCheck = faCheck;
  faEnvelope = faEnvelope;

  // State
  loading = signal(false);
  organizations = signal<Organization[]>([]);
  selectedOrg = signal<Organization | null>(null);
  orgMembers = signal<OrganizationMember[]>([]);
  stats = signal({ total_organizations: 0, total_users: 0, total_loans: 0 });

  // Modals
  showCreateOrgModal = signal(false);
  showMembersModal = signal(false);
  showInviteModal = signal(false);
  showConfirmation = signal(false);
  
  // Deletion tracking
  orgToDelete = signal<Organization | null>(null);
  
  // Loading states
  isCreatingOrg = signal(false);

  // Forms
  createOrgForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    owner_email: ['', [Validators.required, Validators.email]],
    owner_name: ['', [Validators.required, Validators.minLength(2)]]
  });

  inviteForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', Validators.required],
    role: ['viewer', Validators.required]
  });

  // Roles disponíveis
  roles = [
    { value: 'owner', label: 'Proprietário', description: 'Acesso total' },
    { value: 'admin', label: 'Administrador', description: 'Gerenciar usuários e dados' },
    { value: 'collector', label: 'Cobrador', description: 'Gerenciar cobrança' },
    { value: 'viewer', label: 'Visualizador', description: 'Apenas visualizar' }
  ];

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const [orgs, statsData] = await Promise.all([
        this.adminService.listOrganizations(),
        this.adminService.getAdminStats()
      ]);
      
      this.organizations.set(orgs);
      this.stats.set(statsData);
    } catch (error) {
      this.toastService.error('Erro ao carregar dados administrativos');
    } finally {
      this.loading.set(false);
    }
  }

  // =============================================
  // ORGANIZAÇÕES
  // =============================================

  openCreateOrgModal() {
    this.createOrgForm.reset();
    this.showCreateOrgModal.set(true);
  }

  closeCreateOrgModal() {
    this.showCreateOrgModal.set(false);
  }

  async createOrganization() {
    if (this.createOrgForm.invalid) return;

    this.isCreatingOrg.set(true);
    try {
      const formData = this.createOrgForm.value;
      await this.adminService.createOrganization({
        name: formData.name!,
        owner_email: formData.owner_email!,
        owner_name: formData.owner_name!
      });

      // AdminService já mostra toast de sucesso
      this.closeCreateOrgModal();
      await this.loadData();
    } catch (error: any) {
      // AdminService já mostra toast de erro
    } finally {
      this.isCreatingOrg.set(false);
    }
  }

  async deleteOrganization(org: Organization) {
    this.orgToDelete.set(org);
    this.showConfirmation.set(true);
  }

  async confirmDelete() {
    const org = this.orgToDelete();
    if (!org) return;

    try {
      await this.adminService.deleteOrganization(org.id);
      // AdminService já mostra toast de sucesso
      await this.loadData();
    } catch (error: any) {
      // AdminService já mostra toast de erro
    } finally {
      this.closeConfirmation();
    }
  }

  closeConfirmation() {
    this.showConfirmation.set(false);
    this.orgToDelete.set(null);
  }

  // =============================================
  // MEMBROS
  // =============================================

  async viewMembers(org: Organization) {
    this.selectedOrg.set(org);
    try {
      const members = await this.adminService.getOrganizationMembers(org.id);
      this.orgMembers.set(members);
      this.showMembersModal.set(true);
    } catch (error: any) {
      // AdminService já mostra toast de erro
    }
  }

  closeMembersModal() {
    this.showMembersModal.set(false);
    this.selectedOrg.set(null);
    this.orgMembers.set([]);
  }

  async updateMemberRole(member: OrganizationMember, newRole: string) {
    try {
      await this.adminService.updateMemberRole(member.org_id, member.user_id, newRole);
      // AdminService já mostra toast de sucesso
      
      // Atualizar lista local
      const updatedMembers = this.orgMembers().map(m => 
        m.user_id === member.user_id ? { ...m, role: newRole as any } : m
      );
      this.orgMembers.set(updatedMembers);
    } catch (error: any) {
      // AdminService já mostra toast de erro
    }
  }

  async removeMember(member: OrganizationMember) {
    if (!confirm(`Remover ${member.user_name} da organização?`)) return;

    try {
      await this.adminService.removeMember(member.org_id, member.user_id);
      // AdminService já mostra toast de sucesso
      
      // Atualizar lista local
      const updatedMembers = this.orgMembers().filter(m => m.user_id !== member.user_id);
      this.orgMembers.set(updatedMembers);
    } catch (error: any) {
      // AdminService já mostra toast de erro
    }
  }

  // =============================================
  // CONVITES
  // =============================================

  openInviteModal() {
    if (!this.selectedOrg()) {
      this.toastService.error('Selecione uma organização primeiro');
      return;
    }
    this.inviteForm.reset();
    this.showInviteModal.set(true);
  }

  closeInviteModal() {
    this.showInviteModal.set(false);
  }

  async sendInvite() {
    if (this.inviteForm.invalid || !this.selectedOrg()) return;

    try {
      const formData = this.inviteForm.value;
      const inviteLink = await this.adminService.inviteUser(
        this.selectedOrg()!.id,
        formData.email!,
        formData.role!,
        formData.name!
      );

      // Copiar link para clipboard
      await navigator.clipboard.writeText(inviteLink);
      
      this.toastService.success('Link de convite copiado para a área de transferência!');
      this.closeInviteModal();
    } catch (error: any) {
      // AdminService já mostra toast de erro
    }
  }

  getRoleLabel(role: string): string {
    const roleInfo = this.roles.find(r => r.value === role);
    return roleInfo ? roleInfo.label : role;
  }

  getRoleDescription(role: string): string {
    const roleInfo = this.roles.find(r => r.value === role);
    return roleInfo ? roleInfo.description : '';
  }

  trackByOrgId(index: number, org: Organization): string {
    return org.id;
  }

  trackByMemberId(index: number, member: OrganizationMember): string {
    return member.user_id;
  }
}