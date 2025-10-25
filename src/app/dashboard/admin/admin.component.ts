import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, Building2, Users, UserPlus, Edit, Trash2, Plus, Copy, Check, Mail, AlertTriangle, CheckCircle, XCircle } from 'lucide-angular';

import { AdminService, Organization, OrganizationMember, SystemUser, OrganizationDeleteImpact } from '../../core/admin.service';
import { ToastService } from '../../core/toast.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ConfirmationModalComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  // Icons
  readonly Building2 = Building2;
  readonly Users = Users;
  readonly UserPlus = UserPlus;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly Plus = Plus;
  readonly Copy = Copy;
  readonly Check = Check;
  readonly Mail = Mail;
  readonly AlertTriangle = AlertTriangle;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;

  // Active tab
  activeTab = signal<'organizations' | 'users'>('organizations');

  // State
  loading = signal(false);
  organizations = signal<Organization[]>([]);
  selectedOrg = signal<Organization | null>(null);
  orgMembers = signal<OrganizationMember[]>([]);
  stats = signal({ total_organizations: 0, total_users: 0, total_loans: 0 });
  
  // Users state
  systemUsers = signal<SystemUser[]>([]);
  filteredUsers = signal<SystemUser[]>([]);
  userFilter = signal<'all' | 'active' | 'inactive' | 'orphan'>('all');
  selectedUsers = signal<Set<string>>(new Set());
  isAllUsersSelected = signal(false);

  // Modals
  showCreateOrgModal = signal(false);
  showMembersModal = signal(false);
  showInviteModal = signal(false);
  showConfirmation = signal(false);
  showDeleteImpactModal = signal(false);
  showDeleteUsersConfirmation = signal(false);
  
  // Deletion tracking
  orgToDelete = signal<Organization | null>(null);
  deleteImpact = signal<OrganizationDeleteImpact | null>(null);
  
  // Loading states
  isCreatingOrg = signal(false);
  isDeletingOrg = signal(false);

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

    this.isDeletingOrg.set(true);
    try {
      await this.adminService.deleteOrganization(org.id);
      // AdminService já mostra toast de sucesso
      await this.loadData();
    } catch (error: any) {
      // AdminService já mostra toast de erro
    } finally {
      this.isDeletingOrg.set(false);
      this.closeConfirmation();
    }
  }

  closeConfirmation() {
    this.showConfirmation.set(false);
    this.orgToDelete.set(null);
    this.isDeletingOrg.set(false);
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
      await this.adminService.inviteUser(
        this.selectedOrg()!.id,
        formData.email!,
        formData.role!,
        formData.name!
      );

      this.closeInviteModal();
      
      // Recarregar membros se o modal de membros estiver aberto
      if (this.showMembersModal()) {
        const members = await this.adminService.getOrganizationMembers(this.selectedOrg()!.id);
        this.orgMembers.set(members);
      }
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

  // =============================================
  // GERENCIAMENTO DE USUÁRIOS
  // =============================================

  switchTab(tab: 'organizations' | 'users') {
    this.activeTab.set(tab);
    if (tab === 'users' && this.systemUsers().length === 0) {
      this.loadSystemUsers();
    }
  }

  async loadSystemUsers() {
    this.loading.set(true);
    try {
      const users = await this.adminService.listAllUsers();
      this.systemUsers.set(users);
      this.applyUserFilter();
    } finally {
      this.loading.set(false);
    }
  }

  setUserFilter(filter: 'all' | 'active' | 'inactive' | 'orphan') {
    this.userFilter.set(filter);
    this.applyUserFilter();
  }

  applyUserFilter() {
    const users = this.systemUsers();
    const filter = this.userFilter();
    
    let filtered = users;
    if (filter === 'active') {
      filtered = users.filter(u => u.is_active);
    } else if (filter === 'inactive') {
      filtered = users.filter(u => !u.is_active);
    } else if (filter === 'orphan') {
      filtered = users.filter(u => u.total_organizations === 0);
    }
    
    this.filteredUsers.set(filtered);
  }

  // =============================================
  // EXCLUSÃO INTELIGENTE DE ORGANIZAÇÕES
  // =============================================

  async confirmDeleteOrganization(org: Organization) {
    this.orgToDelete.set(org);
    this.loading.set(true);
    
    try {
      const impact = await this.adminService.checkOrganizationDeleteImpact(org.id);
      this.deleteImpact.set(impact);
      this.showDeleteImpactModal.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  closeDeleteImpactModal() {
    this.showDeleteImpactModal.set(false);
    this.orgToDelete.set(null);
    this.deleteImpact.set(null);
  }

  async proceedWithDelete() {
    const org = this.orgToDelete();
    if (!org) return;

    this.showDeleteImpactModal.set(false);
    this.showConfirmation.set(true);
  }

  // User selection methods
  toggleSelectAllUsers() {
    const currentlySelected = this.isAllUsersSelected();
    if (currentlySelected) {
      this.selectedUsers.set(new Set());
      this.isAllUsersSelected.set(false);
    } else {
      const allUserIds = new Set(this.filteredUsers().map(u => u.user_id));
      this.selectedUsers.set(allUserIds);
      this.isAllUsersSelected.set(true);
    }
  }

  toggleUserSelection(userId: string) {
    const selected = new Set(this.selectedUsers());
    if (selected.has(userId)) {
      selected.delete(userId);
    } else {
      selected.add(userId);
    }
    this.selectedUsers.set(selected);
    this.isAllUsersSelected.set(selected.size === this.filteredUsers().length && this.filteredUsers().length > 0);
  }

  isUserSelected(userId: string): boolean {
    return this.selectedUsers().has(userId);
  }

  clearUserSelection() {
    this.selectedUsers.set(new Set());
    this.isAllUsersSelected.set(false);
  }

  confirmDeleteSelectedUsers() {
    const selectedCount = this.selectedUsers().size;
    if (selectedCount === 0) return;
    
    this.showDeleteUsersConfirmation.set(true);
  }

  async deleteSelectedUsers() {
    const selectedCount = this.selectedUsers().size;
    if (selectedCount === 0) return;
    
    this.showDeleteUsersConfirmation.set(false);
    this.loading.set(true);
    try {
      const userIds = Array.from(this.selectedUsers());
      const result = await this.adminService.deleteUsers(userIds);
      
      if (result?.success) {
        this.toastService.success(result.message);
        this.clearUserSelection();
        // Recarregar a lista de usuários
        await this.loadSystemUsers();
      }
    } catch (error) {
      console.error('Erro ao excluir usuários:', error);
    } finally {
      this.loading.set(false);
    }
  }

  trackByOrgId(index: number, org: Organization): string {
    return org.id;
  }

  trackByMemberId(index: number, member: OrganizationMember): string {
    return member.user_id;
  }

  trackByUserId(index: number, user: SystemUser): string {
    return user.user_id;
  }
}
