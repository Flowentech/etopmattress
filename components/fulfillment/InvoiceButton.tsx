'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Printer, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { InvoiceData } from '@/lib/invoice/generator';

interface InvoiceButtonProps {
  storeId: string;
  orderId: string;
  disabled?: boolean;
}

export default function InvoiceButton({ storeId, orderId, disabled = false }: InvoiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const loadInvoiceData = async (): Promise<InvoiceData | null> => {
    try {
      const response = await fetch(`/api/fulfillment/invoice?storeId=${storeId}&orderId=${orderId}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        toast.error(result.error || 'Failed to load invoice data');
        return null;
      }
    } catch (error) {
      toast.error('Failed to load invoice data');
      return null;
    }
  };

  const downloadHTML = async () => {
    setIsLoading(true);
    try {
      const invoiceData = await loadInvoiceData();
      if (!invoiceData) return;

      // Load the invoice generator
      const { invoiceGenerator } = await import('@/lib/invoice/generator');
      invoiceGenerator.downloadHTML(invoiceData);

      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const invoiceData = await loadInvoiceData();
      if (!invoiceData) return;

      // Load the invoice generator
      const { invoiceGenerator } = await import('@/lib/invoice/generator');
      await invoiceGenerator.generatePDF(invoiceData);

      toast.success('PDF generation initiated! Check your print dialog.');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isLoading || isGeneratingPDF}
        >
          {(isLoading || isGeneratingPDF) ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={downloadHTML} disabled={isLoading}>
          <Download className="h-4 w-4 mr-2" />
          Download HTML
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generatePDF} disabled={isGeneratingPDF}>
          <Printer className="h-4 w-4 mr-2" />
          Print PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}