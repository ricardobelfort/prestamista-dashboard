import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import { TranslateService } from '@ngx-translate/core';

export interface PaymentReceipt {
  clientName: string;
  clientPhone?: string;
  clientAddress?: string;
  clientId?: string; // Cédula/ID
  installmentNumber: number;
  totalInstallments: number;
  loanPrincipal: number;
  loanStartDate?: string;
  installmentAmount: number;
  paidAmount: number;
  remainingBalance: number;
  paymentMethod: string;
  paymentDate: string;
  dueDate: string;
  nextDueDate?: string;
  nextInstallmentAmount?: number;
  notes?: string;
  collectorName?: string;
  organizationName?: string;
  organizationPhone?: string;
  organizationAddress?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  private translate = inject(TranslateService);
  
  generateReceipt(receipt: PaymentReceipt): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 180] // 80mm thermal printer width
    });

    let yPos = 6;
    const lineHeight = 4.5;
    const leftMargin = 4;
    const rightMargin = 4;
    const pageWidth = 80;
    const contentWidth = pageWidth - leftMargin - rightMargin;

    // Helper functions
    const addCenteredText = (text: string, y: number, fontSize: number = 10, bold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      const textWidth = doc.getTextWidth(text);
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };

    const addText = (text: string, y: number, fontSize: number = 9, bold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.text(text, leftMargin, y);
    };

    const addRow = (label: string, value: string, y: number, fontSize: number = 9, boldValue: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'normal');
      doc.text(label, leftMargin, y);
      
      doc.setFont('helvetica', boldValue ? 'bold' : 'normal');
      const valueWidth = doc.getTextWidth(value);
      doc.text(value, pageWidth - rightMargin - valueWidth, y);
    };

    const addDivider = (y: number, thickness: number = 0.2) => {
      doc.setLineWidth(thickness);
      doc.line(leftMargin, y, pageWidth - rightMargin, y);
    };

    const addDashedLine = (y: number) => {
      // Create dashed effect with small dots
      doc.setLineWidth(0.1);
      const dashLength = 1;
      const gapLength = 1;
      let x = leftMargin;
      while (x < pageWidth - rightMargin) {
        doc.line(x, y, Math.min(x + dashLength, pageWidth - rightMargin), y);
        x += dashLength + gapLength;
      }
    };

    // ============= HEADER =============
    addCenteredText(receipt.organizationName || 'Prestamista', yPos, 16, true);
    yPos += lineHeight + 1;
    
    if (receipt.organizationPhone) {
      addCenteredText(receipt.organizationPhone, yPos, 8);
      yPos += lineHeight - 0.5;
    }
    
    if (receipt.organizationAddress) {
      addCenteredText(receipt.organizationAddress, yPos, 7);
      yPos += lineHeight;
    }

    yPos += 1;
    addDivider(yPos, 0.4);
    yPos += lineHeight + 1;

    // ============= TÍTULO =============
    addCenteredText(this.translate.instant('receipt.title'), yPos, 11, true);
    yPos += lineHeight + 2;

    // ============= CLIENTE =============
    addText(`${this.translate.instant('receipt.name')}:`, yPos, 8, true);
    yPos += lineHeight - 0.5;
    addText(receipt.clientName.toUpperCase(), yPos, 10, true);
    yPos += lineHeight + 0.5;
    
    if (receipt.clientAddress) {
      addText(receipt.clientAddress, yPos, 7);
      yPos += lineHeight;
    }
    
    if (receipt.clientId) {
      const maskedId = this.maskId(receipt.clientId);
      addText(`${this.translate.instant('receipt.documentId')}: ${maskedId}`, yPos, 7);
      yPos += lineHeight + 0.5;
    }

    yPos += 0.5;
    addDashedLine(yPos);
    yPos += lineHeight + 1;

    // ============= VALOR PAGO (DESTAQUE) =============
    addCenteredText(this.translate.instant('receipt.paidToCapitalInterest'), yPos, 9, true);
    yPos += lineHeight + 1;
    
    // Box com fundo cinza para o valor (mais alto e melhor centralizado)
    const boxHeight = 14;
    doc.setFillColor(240, 240, 240);
    doc.rect(leftMargin, yPos - 2, contentWidth, boxHeight, 'F');
    
    // Centralizar o valor verticalmente dentro do box
    const valueYPos = yPos + (boxHeight / 2) - 1;
    addCenteredText(this.formatCurrency(receipt.paidAmount), valueYPos, 18, true);
    yPos += boxHeight;

    // Status "Em dia"
    yPos += 1;
    const daysText = this.getDaysUntil(receipt.nextDueDate);
    const statusText = `${this.translate.instant('receipt.upToDate')} (${this.translate.instant('receipt.nextIn')} ${daysText})`;
    addCenteredText(statusText, yPos, 8);
    yPos += lineHeight + 1;

    addDashedLine(yPos);
    yPos += lineHeight + 1;

    // ============= RESUMO FINANCEIRO =============
    addRow(this.translate.instant('receipt.paidInstallments'), 
           `${receipt.installmentNumber} / ${receipt.totalInstallments}`, yPos, 9, true);
    yPos += lineHeight;
    
    addRow(this.translate.instant('receipt.remainingBalance'), 
           this.formatCurrency(receipt.remainingBalance), yPos, 9, true);
    yPos += lineHeight;
    
    addRow(this.translate.instant('receipt.pendingLateFee'), 
           this.formatCurrency(0), yPos, 8);
    yPos += lineHeight;
    
    addRow(this.translate.instant('receipt.pendingCharges'), 
           this.formatCurrency(0), yPos, 8);
    yPos += lineHeight + 1;

    addDashedLine(yPos);
    yPos += lineHeight + 1;

    // ============= INFORMAÇÕES DO EMPRÉSTIMO =============
    if (receipt.loanStartDate) {
      addRow(this.translate.instant('receipt.loanFrom'), 
             this.formatDate(receipt.loanStartDate), yPos, 8);
      yPos += lineHeight;
    }
    
    addRow(this.translate.instant('receipt.paymentDate'), 
           this.formatDate(receipt.paymentDate), yPos, 8);
    yPos += lineHeight;
    
    if (receipt.nextDueDate) {
      addRow(this.translate.instant('receipt.nextInstallmentOpen'), 
             this.formatDate(receipt.nextDueDate), yPos, 8);
      yPos += lineHeight;
      
      addRow(this.translate.instant('receipt.dueDate'), 
             this.formatDate(receipt.nextDueDate), yPos, 8);
      yPos += lineHeight;
    }

    // Notas (se houver)
    if (receipt.notes) {
      yPos += 1;
      addDashedLine(yPos);
      yPos += lineHeight;
      
      addText(this.translate.instant('receipt.notes'), yPos, 8, true);
      yPos += lineHeight;
      
      const notesLines = doc.splitTextToSize(receipt.notes, contentWidth);
      notesLines.forEach((line: string) => {
        addText(line, yPos, 7);
        yPos += lineHeight - 0.5;
      });
    }

    yPos += 2;
    addDivider(yPos, 0.4);
    yPos += lineHeight + 1;

    // ============= FOOTER =============
    addCenteredText(this.translate.instant('receipt.thankYou'), yPos, 9, true);
    yPos += lineHeight;
    
    const now = new Date();
    const timestamp = now.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
    addCenteredText(`${timestamp}`, yPos, 6);

    // Generate filename
    const filename = `recibo_${receipt.clientName.replace(/\s/g, '_')}_${receipt.paymentDate}.pdf`;
    
    // Save PDF
    doc.save(filename);
  }

  private maskId(id: string): string {
    if (!id || id.length < 6) return id;
    
    // Show first 2 and last 2 digits, mask middle with asterisks
    const firstPart = id.substring(0, 2);
    const lastPart = id.substring(id.length - 2);
    const middleLength = id.length - 4;
    const maskedMiddle = '*'.repeat(Math.min(middleLength, 4));
    
    return `${firstPart}${maskedMiddle}${lastPart}`;
  }

  private getDaysUntil(dateStr?: string): string {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') {
      return `-- ${this.translate.instant('receipt.days')}`;
    }
    
    try {
      // Parse the date string properly
      const targetDate = new Date(dateStr);
      const today = new Date();
      
      // Reset time part for accurate day calculation
      targetDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      // Calculate difference in days
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return this.translate.instant('receipt.today');
      if (diffDays === 1) {
        // Remove 's' for singular
        const dayWord = this.translate.instant('receipt.days');
        const singularDay = dayWord.endsWith('s') ? dayWord.slice(0, -1) : dayWord;
        return `1 ${singularDay}`;
      }
      if (diffDays < 0) return `${Math.abs(diffDays)} ${this.translate.instant('receipt.daysLate')}`;
      
      return `${diffDays} ${this.translate.instant('receipt.days')}`;
    } catch (error) {
      console.error('Error calculating days until:', error, dateStr);
      return `-- ${this.translate.instant('receipt.days')}`;
    }
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  private getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      'money': 'Dinheiro',
      'pix': 'PIX',
      'card': 'Cartão',
      'bank_transfer': 'Transferência Bancária'
    };
    return labels[method] || method;
  }
}
