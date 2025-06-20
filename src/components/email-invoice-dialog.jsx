// src/components/email-invoice-dialog.jsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'; // Adjust path based on your Shadcn UI setup
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';// Adjust path
import axiosInstance from '../lib/axiosInstance'; // Adjust path
import { pdf } from '@react-pdf/renderer'; // Import pdf to generate PDF on the fly
import OrderFormPDF from './OrderFormPDF'; // Make sure this path is correct

export function EmailInvoiceDialog({
  isOpen,
  onClose,
  documentData, // Renamed from invoiceData to documentData for generic use (OrderForm, Invoice etc.)
  customerData, // Added customerData prop
  companyBranding, // Added companyBranding prop
  authToken, // Added authToken prop
  userEmail,
}) {
  const { toast } = useToast();
  const [isSending, setIsSending] = React.useState(false);

  // Initialize form state with document and customer data
  const [formData, setFormData] = React.useState({
    from: userEmail || 'your_company_email@example.com', // This should likely come from user settings or env
    to: customerData?.email || '',
    cc: '',
    bcc: '',
    subject: `Order Form - ${documentData?.orderFormNumber || ''} from ${companyBranding?.name || 'Your Company'}`,
    body: `Dear ${customerData?.name || 'Customer'},\n\nPlease find attached Order Form #${documentData?.orderFormNumber || ''} for your reference.\n\nYou can view, print, and download your order form from the link below:\n[Order Form Link Placeholder - You'll replace this with actual link]\n\nThank you for your business!\n\nRegards,\n${companyBranding?.name || 'Your Company Name'}`,
    documentId: documentData?.id || '', // Changed from invoiceId to documentId
  });

  React.useEffect(() => {
    // Update form data if documentData or customerData changes while dialog is open
    if (documentData && customerData && companyBranding) {
      setFormData(prev => ({
        ...prev,
        from: userEmail || prev.from,
        to: customerData.email || '',
        subject: `Order Form - ${documentData.orderFormNumber || ''} from ${companyBranding.name || 'Your Company'}`,
        body: `Dear ${customerData.name || 'Customer'},\n\nPlease find attached Order Form #${documentData.orderFormNumber || ''} for your reference.\n\nYou can view, print, and download your order form from the link below:\n[Order Form Link Placeholder - You'll replace this with actual link]\n\nThank you for your business!\n\nRegards,\n${companyBranding.name || 'Your Company Name'}`,
        documentId: documentData.id || '',
      }));
    }
  }, [documentData, customerData, companyBranding]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      // 1. Generate the PDF as a Blob using the provided OrderFormPDF component
      const pdfBlob = await pdf(
        <OrderFormPDF 
          orderForm={documentData} 
          customer={customerData} 
          companyBranding={companyBranding} 
        />
      ).toBlob();

      // 2. Read the Blob as a Base64 Data URL
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);

      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1]; // Extract Base64 part

        // const finalBody = formData.body.replace(
        //   '[Order Form Link Placeholder - You\'ll replace this with actual link]',
        //   `${window.location.origin}/order-forms/${formData.documentId}/preview` // Example dynamic link for preview
        // );

        // Your API endpoint to send the email (same as you had in OrderFormPreviewContent)
        const response = await fetch(`${axiosInstance.defaults.baseURL}/order-forms/${formData.documentId}/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}` // Use the actual auth token passed as a prop
            },
            body: JSON.stringify({
                to: formData.to,
                cc: formData.cc,
                bcc: formData.bcc,
                subject: formData.subject,
                body: formData.body, // Send the body with the dynamic link
                pdfBufferBase64: base64data,
                senderName: companyBranding?.name || 'InvoiceCraft'
            }),
        });

        if (response.ok) {
            const result = await response.json();
            toast({
                title: "Success",
                description: result.message || "Order Form email sent successfully!",
            });
            onClose(); // Close dialog on success
        } else {
            const errorData = await response.json();
            toast({
                title: "Error",
                description: errorData.message || 'Failed to send email.',
                variant: "destructive",
            });
        }
      };

      reader.onerror = (error) => {
          toast({ title: "Error", description: 'Error reading PDF file.', variant: "destructive" });
          console.error('FileReader error:', error);
      };

    } catch (error) {
      console.error("Failed to send order form email:", error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.response?.data?.message || error.message || error.toString()}`,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">  
        <DialogHeader>
          <DialogTitle>Email Order Form {documentData?.orderFormNumber}</DialogTitle>
          <DialogDescription>
            Send this order form directly to your customer via email.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="from" className="text-right">From</Label>
            <Input id="from" name="from" value={formData.from} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="to" className="text-right">To</Label>
            <Input id="to" name="to" value={formData.to} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cc" className="text-right">Cc</Label>
            <Input id="cc" name="cc" value={formData.cc} onChange={handleChange} className="col-span-3" placeholder="comma-separated emails" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bcc" className="text-right">Bcc</Label>
            <Input id="bcc" name="bcc" value={formData.bcc} onChange={handleChange} className="col-span-3" placeholder="comma-separated emails" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">Subject</Label>
            <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="body" className="text-right pt-2">Body</Label>
            <Textarea id="body" name="body" value={formData.body} onChange={handleChange} rows={8} className="col-span-3" />
          </div>
          {/* You might add a checkbox here for "Attach PDF" if your backend requires it */}
          {/* <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1"></div>
            <div className="col-span-3 flex items-center">
              <input type="checkbox" id="attachPdf" name="attachPdf" checked readOnly className="mr-2" />
              <Label htmlFor="attachPdf">Attach Order Form PDF</Label>
            </div>
          </div> */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>Cancel</Button>
          <Button onClick={handleSendEmail} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}