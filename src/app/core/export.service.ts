import { Injectable, inject } from '@angular/core';
import * as XLSX from 'xlsx';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private dataService = inject(DataService);

  /**
   * Exporta lista de clientes para Excel
   */
  async exportClients(): Promise<void> {
    try {
      const clients = await this.dataService.getClients();
      
      const data = clients.map(client => ({
        'Nome': client.name,
        'CPF': client.cpf || '-',
        'Telefone': client.phone || '-',
        'E-mail': client.email || '-',
        'Endereço': client.address || '-',
        'Rota': client.routes?.name || '-',
        'Status': this.translateStatus(client.status)
      }));

      this.downloadExcel(data, 'Clientes');
    } catch (error) {
      console.error('Erro ao exportar clientes:', error);
      throw error;
    }
  }

  /**
   * Exporta dados dos empréstimos para Excel
   */
  async exportLoans(): Promise<void> {
    try {
      const loans = await this.dataService.getLoans();
      
      const data = loans.map(loan => {
        const totalAmount = loan.installments?.reduce((sum: number, inst: any) => sum + (inst.amount || 0), 0) || 0;
        const paidAmount = loan.installments?.reduce((sum: number, inst: any) => sum + (inst.paid_amount || 0), 0) || 0;
        
        return {
          'Cliente': loan.clients?.name || '-',
          'Principal': this.formatCurrency(loan.principal),
          'Taxa': `${loan.interest_rate}% a.m.`,
          'Parcelas': loan.installments_count,
          'Data': new Date(loan.start_date).toLocaleDateString('pt-BR'),
          'Status': this.translateStatus(loan.status),
          'Total': this.formatCurrency(totalAmount),
          'Pago': this.formatCurrency(paidAmount)
        };
      });

      this.downloadExcel(data, 'Emprestimos');
    } catch (error) {
      console.error('Erro ao exportar empréstimos:', error);
      throw error;
    }
  }

  /**
   * Exporta dados dos pagamentos para Excel
   */
  async exportPayments(): Promise<void> {
    try {
      const payments = await this.dataService.getPayments();
      
      const data = payments.map((payment: any) => ({
        'Cliente': payment.installments?.loans?.clients?.name || '-',
        'Valor': this.formatCurrency(payment.value || 0),
        'Data': new Date(payment.paid_on).toLocaleDateString('pt-BR'),
        'Método': payment.method || '-',
        'Observações': payment.notes || '-'
      }));

      this.downloadExcel(data, 'Pagamentos');
    } catch (error) {
      console.error('Erro ao exportar pagamentos:', error);
      throw error;
    }
  }

  /**
   * Exporta relatório de fluxo de caixa para Excel
   */
  async exportCashFlow(startDate?: string, endDate?: string): Promise<void> {
    try {
      const metrics = await this.dataService.getDashboardMetrics();
      const loans = await this.dataService.getLoans();
      const payments = await this.dataService.getPayments();

      const workbook = XLSX.utils.book_new();

      const summaryData = [
        ['Métrica', 'Valor'],
        ['Total Emprestado', this.formatCurrency(metrics.total_loaned || 0)],
        ['Total Recebido', this.formatCurrency(metrics.total_received || 0)],
        ['Pendente', this.formatCurrency(metrics.total_outstanding || 0)],
        ['Taxa de Recuperação', `${metrics.recovery_rate?.toFixed(1) || 0}%`],
        ['Lucro Bruto', this.formatCurrency(metrics.profit || 0)],
        ['Total em Atraso', this.formatCurrency(metrics.overdue_amount || 0)],
        ['Clientes Ativos', metrics.active_clients || 0],
        ['Empréstimos Ativos', metrics.active_loans || 0]
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

      const loansData = loans.map(loan => {
        const totalAmount = loan.installments?.reduce((sum: number, inst: any) => sum + (inst.amount || 0), 0) || 0;
        const paidAmount = loan.installments?.reduce((sum: number, inst: any) => sum + (inst.paid_amount || 0), 0) || 0;
        
        return {
          'Cliente': loan.clients?.name || '-',
          'Principal': this.formatCurrency(loan.principal),
          'Taxa': `${loan.interest_rate}% a.m.`,
          'Parcelas': loan.installments_count,
          'Data': new Date(loan.start_date).toLocaleDateString('pt-BR'),
          'Status': this.translateStatus(loan.status),
          'Total': this.formatCurrency(totalAmount),
          'Pago': this.formatCurrency(paidAmount)
        };
      });
      const loansSheet = XLSX.utils.json_to_sheet(loansData);
      XLSX.utils.book_append_sheet(workbook, loansSheet, 'Empréstimos');

      const paymentsData = payments.map(payment => ({
        'Cliente': payment.installments?.loans?.clients?.name || '-',
        'Valor': this.formatCurrency(payment.value || 0),
        'Data': new Date(payment.paid_on).toLocaleDateString('pt-BR'),
        'Método': payment.method || '-',
        'Observações': payment.notes || '-'
      }));
      const paymentsSheet = XLSX.utils.json_to_sheet(paymentsData);
      XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Pagamentos');

      const fileName = `Fluxo_de_Caixa_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Erro ao exportar fluxo de caixa:', error);
      throw error;
    }
  }

  async exportDashboard(): Promise<void> {
    await this.exportCashFlow();
  }

  async exportClientHistory(clientId: string, clientName: string): Promise<void> {
    try {
      const history = await this.dataService.getClientFinancialHistory(clientId);
      
      const workbook = XLSX.utils.book_new();

      const summaryData = [
        ['Métrica', 'Valor'],
        ['Cliente', clientName],
        ['Total Emprestado', this.formatCurrency(history.summary.total_loaned || 0)],
        ['Total Pago', this.formatCurrency(history.summary.total_paid || 0)],
        ['Pendente', this.formatCurrency(history.summary.total_outstanding || 0)],
        ['Total Vencido', this.formatCurrency(history.summary.total_overdue || 0)],
        ['Pagamentos no Prazo', history.summary.on_time_payments || 0],
        ['Pagamentos Atrasados', history.summary.late_payments || 0],
        ['Score de Pagamento', `${history.summary.payment_score || 0}/100`]
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

      const loansData = (history.loans || []).map((loan: any) => ({
        'Principal': this.formatCurrency(loan.principal),
        'Taxa': `${loan.interest_rate}% a.m.`,
        'Data': new Date(loan.start_date).toLocaleDateString('pt-BR'),
        'Status': this.translateStatus(loan.status),
        'Parcelas Pagas': loan.paid_installments,
        'Total Parcelas': loan.total_installments,
        'Total Esperado': this.formatCurrency(loan.total_amount),
        'Total Pago': this.formatCurrency(loan.paid_amount)
      }));
      const loansSheet = XLSX.utils.json_to_sheet(loansData);
      XLSX.utils.book_append_sheet(workbook, loansSheet, 'Empréstimos');

      const fileName = `Historico_${clientName.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Erro ao exportar histórico do cliente:', error);
      throw error;
    }
  }

  private downloadExcel(data: any[], fileName: string): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, fileName);
    
    const excelFileName = `${fileName}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, excelFileName);
  }

  async exportToCSV(data: any[], fileName: string): Promise<void> {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  private translateStatus(status: string): string {
    const translations: { [key: string]: string } = {
      'active': 'Ativo',
      'pending': 'Pendente',
      'paid': 'Pago',
      'overdue': 'Vencido',
      'cancelled': 'Cancelado'
    };
    return translations[status] || status;
  }

  private translatePaymentMethod(method: string): string {
    const translations: { [key: string]: string } = {
      'cash': 'Dinheiro',
      'pix': 'PIX',
      'transfer': 'Transferência',
      'check': 'Cheque',
      'card': 'Cartão'
    };
    return translations[method] || method;
  }
}
