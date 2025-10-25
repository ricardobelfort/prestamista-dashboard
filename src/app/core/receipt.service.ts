import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface PaymentReceipt {
  clientName: string;
  clientPhone?: string;
  installmentNumber: number;
  loanPrincipal: number;
  installmentAmount: number;
  paidAmount: number;
  paymentMethod: string;
  paymentDate: string;
  dueDate: string;
  notes?: string;
  collectorName?: string;
  organizationName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  
  generateReceipt(receipt: PaymentReceipt): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 150] // 80mm width (thermal printer)
    });

    let yPos = 10;
    const lineHeight = 5;
    const leftMargin = 5;
    const pageWidth = 80;

    // Helper function to add centered text
    const addCenteredText = (text: string, y: number, fontSize: number = 10, bold: boolean = false) => {
      doc.setFontSize(fontSize);
      if (bold) doc.setFont('helvetica', 'bold');
      else doc.setFont('helvetica', 'normal');
      const textWidth = doc.getTextWidth(text);
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };

    // Helper function to add left-aligned text
    const addText = (text: string, y: number, fontSize: number = 9) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'normal');
      doc.text(text, leftMargin, y);
    };

    // Header
    addCenteredText(receipt.organizationName || 'Prestamista', yPos, 12, true);
    yPos += lineHeight + 2;
    addCenteredText('COMPROVANTE DE PAGAMENTO', yPos, 10, true);
    yPos += lineHeight + 3;

    // Separator line
    doc.setLineWidth(0.5);
    doc.line(leftMargin, yPos, pageWidth - leftMargin, yPos);
    yPos += lineHeight;

    // Payment date
    addText(`Data: ${this.formatDate(receipt.paymentDate)}`, yPos, 9);
    yPos += lineHeight;

    // Client info
    addText(`Cliente: ${receipt.clientName}`, yPos, 9);
    yPos += lineHeight;
    
    if (receipt.clientPhone) {
      addText(`Telefone: ${receipt.clientPhone}`, yPos, 9);
      yPos += lineHeight;
    }

    yPos += 2;
    doc.line(leftMargin, yPos, pageWidth - leftMargin, yPos);
    yPos += lineHeight;

    // Installment details
    addText(`Parcela: ${receipt.installmentNumber}`, yPos, 9);
    yPos += lineHeight;
    addText(`Vencimento: ${this.formatDate(receipt.dueDate)}`, yPos, 9);
    yPos += lineHeight;
    addText(`Valor da Parcela: ${this.formatCurrency(receipt.installmentAmount)}`, yPos, 9);
    yPos += lineHeight;

    yPos += 2;
    doc.line(leftMargin, yPos, pageWidth - leftMargin, yPos);
    yPos += lineHeight;

    // Payment details
    doc.setFont('helvetica', 'bold');
    addText(`Valor Pago: ${this.formatCurrency(receipt.paidAmount)}`, yPos, 10);
    doc.setFont('helvetica', 'normal');
    yPos += lineHeight;
    addText(`Método: ${this.getPaymentMethodLabel(receipt.paymentMethod)}`, yPos, 9);
    yPos += lineHeight;

    // Notes if any
    if (receipt.notes) {
      yPos += 2;
      doc.line(leftMargin, yPos, pageWidth - leftMargin, yPos);
      yPos += lineHeight;
      addText('Observações:', yPos, 9);
      yPos += lineHeight;
      
      // Wrap notes text
      const notesLines = doc.splitTextToSize(receipt.notes, pageWidth - (leftMargin * 2));
      notesLines.forEach((line: string) => {
        addText(line, yPos, 8);
        yPos += lineHeight;
      });
    }

    yPos += 5;
    doc.line(leftMargin, yPos, pageWidth - leftMargin, yPos);
    yPos += lineHeight;

    // Footer
    if (receipt.collectorName) {
      addText(`Cobrador: ${receipt.collectorName}`, yPos, 8);
      yPos += lineHeight;
    }

    yPos += 3;
    addCenteredText('Obrigado pelo pagamento!', yPos, 9);
    yPos += lineHeight;
    addCenteredText('_____________________', yPos + 5, 8);
    yPos += lineHeight + 2;
    addCenteredText('Assinatura do Cliente', yPos, 7);

    // Generate filename
    const filename = `recibo_${receipt.clientName.replace(/\s/g, '_')}_${receipt.paymentDate}.pdf`;
    
    // Save PDF
    doc.save(filename);
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
