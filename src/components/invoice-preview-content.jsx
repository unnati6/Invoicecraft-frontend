// components/invoice-preview-content.js
import React, { useState } from 'react';
import { format } from 'date-fns';
import { getCurrencySymbol } from '../lib/currency-utils';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { CoverPageContent } from './cover-page-content'; // Assuming cover pages can apply to invoices
import { Button } from './ui/button';
import { Download , Mail} from 'lucide-react';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF'; // Correct: This is a default import as exported by InvoicePDF.jsx
import InvoiceExcel from './InvoiceExcel';
import { BASE_URL } from '../lib/Api';
import { EmailOrderDialog } from './email-order-dialog';
// Helper function
const replacePlaceholders = (content, invoice, customer) => {
  let replacedContent = content;
  // Safely access properties of invoice and customer using optional chaining or logical OR
  replacedContent = replacedContent.replace(/{{invoice.invoiceNumber}}/g, invoice?.invoiceNumber || 'N/A'); // Changed placeholder
  replacedContent = replacedContent.replace(/{{customer.name}}/g, customer?.name || invoice?.customerName || 'N/A');
  replacedContent = replacedContent.replace(/{{invoice.issueDate}}/g, invoice?.issueDate ? format(new Date(invoice.issueDate), 'PPP') : 'N/A');
  // Add more placeholders as needed, always using optional chaining for safety
  return replacedContent;
};

export function InvoicePreviewContent({ document: invoice, customer, coverPageTemplate, companyBranding, authToken }) { // Changed component name and prop name
//  const [isSendingEmail, setIsSendingEmail] = useState(false);
  //const [emailStatus, setEmailStatus] = useState(null); // To show success/error messages
console.log("DEBUG: InvoiceExcel after import:", InvoiceExcel);
 const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false); // <-- New state for dialog visibility

  if (!invoice) { // Changed prop name
    console.error("[InvoicePreviewContent] Received undefined or null document prop. Cannot render preview."); // Message changed
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-red-500">
        <h3 className="text-xl font-semibold">Error: Invoice Data Missing</h3> {/* Message changed */}
        <p className="text-muted-foreground mt-2">Could not display preview due to missing invoice details.</p> {/* Message changed */}
        <p className="text-muted-foreground">Please ensure the invoice exists and is properly loaded.</p> {/* Message changed */}
      </div>
    );
  }

  // Console logs for debugging (will only run if invoice is valid)
  console.log("[InvoicePreviewContent] Received document:", invoice); // Message changed
  console.log("[InvoicePreviewContent] Received customer:", customer); // Message changed
  console.log("[InvoicePreviewContent] Received coverPageTemplate:", coverPageTemplate); // Message changed
  console.log("[InvoicePreviewContent] Received companyBranding:", companyBranding); // Message changed

  let parsedItems = [];
  if (typeof invoice.items === 'string' && invoice.items.trim() !== '') { // Changed prop
    try {
      parsedItems = JSON.parse(invoice.items); // Changed prop
    } catch (e) {
      console.error("Failed to parse invoice.items:", e); // Message changed
    }
  } else if (Array.isArray(invoice.items)) { // Changed prop
    parsedItems = invoice.items; // Changed prop
  }

  let parsedAdditionalCharges = [];
  if (typeof invoice.additionalCharges === 'string' && invoice.additionalCharges.trim() !== '') { // Changed prop
    try {
      parsedAdditionalCharges = JSON.parse(invoice.additionalCharges); // Changed prop
    } catch (e) {
      console.error("Failed to parse invoice.additionalCharges:", e); // Message changed
    }
  } else if (Array.isArray(invoice.additionalCharges)) { // Changed prop
    parsedAdditionalCharges = invoice.additionalCharges; // Changed prop
  }

  // Safely access customer properties for display and ensure address parts are strings
  const customerToDisplay = {
    name: invoice?.customerName || customer?.name || 'N/A', // Changed prop
    email: customer?.email || 'N/A',
    phone: customer?.phone || 'N/A',
    company: {
      name: customer?.company?.name || '',
      street: customer?.company?.street || '',
      city: customer?.company?.city || '',
      state: customer?.company?.state || '',
      zip: customer?.company?.zip || '',
      country: customer?.company?.country || '',
    },
    billingAddress: {
      street: customer?.billingAddress?.street || '',
      city: customer?.billingAddress?.city || '',
      state: customer?.billingAddress?.state || '',
      zip: customer?.billingAddress?.zip || '',
      country: customer?.billingAddress?.country || '',
    },
    shippingAddress: {
      street: customer?.shippingAddress?.street || '',
      city: customer?.shippingAddress?.city || '',
      state: customer?.shippingAddress?.state || '',
      zip: customer?.shippingAddress?.zip || '',
      country: customer?.shippingAddress?.country || '',
    },
    currency: customer?.currency || invoice?.currencyCode || 'USD' // Changed prop
  };

  const currencySymbol = getCurrencySymbol(customerToDisplay.currency);
  // FIX: Ensure invoice.additionalCharges is an array before calling .reduce()
  const totalAdditionalChargesValue = (Array.isArray(invoice.additionalCharges) ? invoice.additionalCharges : []).reduce((sum, charge) => sum + (charge.calculatedAmount ?? 0), 0); // Changed prop

  // Adjusted hasShippingAddress check based on the now-guaranteed string properties
  const hasShippingAddress = customerToDisplay.shippingAddress.street || customerToDisplay.shippingAddress.city;

  // Process markdown content, ensuring invoice and customer are valid
  const processedMsaContent = invoice.msaContent ? replacePlaceholders(invoice.msaContent, invoice, customer) : undefined; // Changed prop
  const processedTermsAndConditions = invoice.termsAndConditions ? replacePlaceholders(invoice.termsAndConditions, invoice, customer) : undefined; // Changed prop

  const paymentTermsText = (invoice.paymentTerms === 'Custom') // Changed prop
    ? (invoice.customPaymentTerms?.trim() ? invoice.customPaymentTerms : 'Custom (Not specified)') // Changed prop
    : invoice.paymentTerms; // Changed prop

  const commitmentPeriodText = (invoice.commitmentPeriod === 'Custom') // Changed prop
    ? (invoice.customCommitmentPeriod?.trim() ? invoice.customCommitmentPeriod : 'Custom (Not specified)') // Changed prop
    : invoice.commitmentPeriod; // Changed prop

  const paymentFrequencyText = (invoice.paymentFrequency === 'Custom') // Changed prop
    ? (invoice.customPaymentFrequency?.trim() ? invoice.customPaymentFrequency : 'Custom (Not specified)') // Changed prop
    : invoice.paymentFrequency; // Changed prop

  // const handleSendEmail = async () => {
  //   const token = localStorage.getItem('supabase_access_token');
  //   if (!token) {
  //     console.error("Token missing. Cannot send email.");
  //     return;
  //   }
  //   setIsSendingEmail(true);
  //   setEmailStatus(null); // Clear previous status

  //   try {
  //     // Generate the PDF as a Blob
  //     const pdfBlob = await pdf(
  //       <InvoicePDF invoice={invoice} customer={customer} companyBranding={companyBranding} /> // Changed component and prop
  //     ).toBlob();

  //     // Read the Blob as a Base64 Data URL
  //     const reader = new FileReader();
  //     reader.readAsDataURL(pdfBlob);

  //     reader.onloadend = async () => {
  //       const base64data = reader.result.split(',')[1]; // Extract Base64 part

  //       // Prepare the data to send to your backend
  //       const emailData = {
  //         to: customer?.email || 'sales@example.com', // Get customer email or use a default
  //         subject: `Invoice #${invoice.invoiceNumber} from ${companyBranding.name}`, // Message changed
  //         body: `
  //           <p>Dear ${customer?.name || 'Customer'},</p>
  //           <p>Please find attached your Invoice with number <strong>${invoice.invoiceNumber}</strong>, issued on ${invoice.issueDate ? format(new Date(invoice.issueDate), 'PPP') : 'N/A'}.</p>
  //           <p>If you have any questions, please feel free to contact us.</p>
  //           <p>Best regards,<br>${companyBranding.name}</p>
  //         `,
  //         pdfBufferBase64: base64data,
  //         senderName: companyBranding.name || 'InvoiceCraft'
  //       };

  //       try {
  //         // Send the request to your backend's new endpoint
  //         const response = await fetch(`${BASE_URL}/invoices/${invoice.id}/send-email`, { // Changed endpoint
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //             'Authorization': `Bearer ${authToken}` // Use the actual auth token passed as a prop
  //           },
  //           body: JSON.stringify(emailData),
  //         });

  //         if (response.ok) {
  //           const result = await response.json();
  //           setEmailStatus({ type: 'success', message: result.message });
  //           console.log('Email sent successfully:', result);
  //         } else {
  //           const errorData = await response.json();
  //           setEmailStatus({ type: 'error', message: errorData.message || 'Failed to send email.' });
  //           console.error('Failed to send email:', errorData);
  //         }
  //       } catch (networkError) {
  //         setEmailStatus({ type: 'error', message: 'Network error or server unreachable.' });
  //         console.error('Network error during email send:', networkError);
  //       }
  //     };

  //     reader.onerror = (error) => {
  //       setEmailStatus({ type: 'error', message: 'Error reading PDF file.' });
  //       console.error('FileReader error:', error);
  //     };

  //   } catch (pdfGenerationError) {
  //     setEmailStatus({ type: 'error', message: 'Error generating PDF.' });
  //     console.error('PDF generation error:', pdfGenerationError);
  //   } finally {
  //     setIsSendingEmail(false);
  //   }
  // };

  return (
    <div className="p-6 bg-card text-foreground font-sans text-sm">
      {coverPageTemplate && invoice?.msaContent && ( // Changed prop
        <>
          <CoverPageContent document={invoice} customer={customer} template={coverPageTemplate} /> {/* Changed prop */}
          <hr className="my-6 border-border" />
        </>
      )}
      {processedMsaContent && (
        <>
          <div className="mb-4 prose prose-sm max-w-none break-words">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{processedMsaContent}</ReactMarkdown>
          </div>
          <hr className="my-6 border-border" />
        </>
      )}

      <div className="flex justify-between items-start mb-10">
        <div className="w-1/2">
          {companyBranding.logoUrl ? (
            <img src={companyBranding.logoUrl} alt={`${companyBranding.name} Logo`} width={180} height={54} className="mb-3" style={{ objectFit: 'contain', maxHeight: '54px' }} data-ai-hint="company logo" />
          ) : (<div className="mb-3 w-[180px] h-[54px] bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">Your Logo</div>)}
          <h2 className="text-xl font-semibold text-primary">{companyBranding.name}</h2>
          <p className="text-xs text-muted-foreground">{companyBranding.street}</p>
          {(companyBranding.city || companyBranding.state || companyBranding.zip) && (
            <p className="text-xs text-muted-foreground">
              {String(companyBranding.city)}{String(companyBranding.city) && String(companyBranding.state) ? ', ' : ''}
              {String(companyBranding.state)}{String(companyBranding.state) && String(companyBranding.zip) ? ' ' : ''}
              {String(companyBranding.zip)}
            </p>
          )}
          {companyBranding.country && <p className="text-xs text-muted-foreground">{String(companyBranding.country)}</p>}
          <p className="text-xs text-muted-foreground">Email: {String(companyBranding.email)}</p>
          <p className="text-xs text-muted-foreground">Phone: {String(companyBranding.phone)}</p>
          {companyBranding.website && <p className="text-xs text-muted-foreground">Website: <a href={String(companyBranding.website)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{String(companyBranding.website)}</a></p>}
          {companyBranding.taxId && <p className="text-xs text-muted-foreground">Tax ID: {String(companyBranding.taxId)}</p>}
        </div>
        <div className="text-right w-1/2">
          <h1 className="text-3xl font-bold text-primary">INVOICE</h1> {/* Changed text */}
          <p className="text-muted-foreground">Invoice no: {invoice.invoiceNumber}</p> {/* Changed text and prop */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-1">
          <h3 className="font-semibold mb-1 text-muted-foreground">INVOICE FOR:</h3> {/* Changed text */}
          <p className="font-medium">{String(customerToDisplay.name)}</p>
          <p className="text-sm">{String(customerToDisplay.email)}</p>

          <p className="text-sm">{String(customerToDisplay.phone)}</p>
          <p className="text-sm">{String(customerToDisplay.company.name)}</p>

          {/* Now explicitly converting each address part to a string */}
          {(customerToDisplay.company.city || customerToDisplay.company.state || customerToDisplay.company.zip) && (
            <p className="text-sm">
              {String(customerToDisplay.company.city)}
              {(String(customerToDisplay.company.city) && String(customerToDisplay.company.state)) ? ', ' : ''}
              {String(customerToDisplay.company.state)}
              {(String(customerToDisplay.company.state) && String(customerToDisplay.company.zip)) ? ' ' : ''}
              {String(customerToDisplay.company.zip)}
            </p>
          )}
          {customerToDisplay.company.country && <p className="text-sm">{String(customerToDisplay.billingAddress.country)}</p>}

        </div>
        <div className="md:col-span-1">
          <h3 className="font-semibold mb-1 text-muted-foreground">BILL TO:</h3>
          {customerToDisplay.billingAddress.street && <p className="text-sm">{String(customerToDisplay.billingAddress.street)}</p>}
          {(customerToDisplay.billingAddress.city || customerToDisplay.billingAddress.state || customerToDisplay.billingAddress.zip) && (
            <p className="text-sm">
              {String(customerToDisplay.billingAddress.city)}
              {(String(customerToDisplay.billingAddress.city) && String(customerToDisplay.billingAddress.state)) ? ', ' : ''}
              {String(customerToDisplay.billingAddress.state)}
              {(String(customerToDisplay.billingAddress.state) && String(customerToDisplay.billingAddress.zip)) ? ' ' : ''}
              {String(customerToDisplay.billingAddress.zip)}
            </p>
          )}
          {customerToDisplay.billingAddress.country && <p className="text-sm">{String(customerToDisplay.billingAddress.country)}</p>}
        </div>

        {hasShippingAddress && (
          <div className="md:col-span-1">
            <h3 className="font-semibold mb-1 text-muted-foreground">SHIP TO:</h3>
            {customerToDisplay.shippingAddress.street && <p className="text-sm">{String(customerToDisplay.shippingAddress.street)}</p>}
            {(customerToDisplay.shippingAddress.city || customerToDisplay.shippingAddress.state || customerToDisplay.shippingAddress.zip) && (
              <p className="text-sm">
                {String(customerToDisplay.shippingAddress.city)}
                {(String(customerToDisplay.shippingAddress.city) && String(customerToDisplay.shippingAddress.state)) ? ', ' : ''}
                {String(customerToDisplay.shippingAddress.state)}
                {(String(customerToDisplay.shippingAddress.state) && String(customerToDisplay.shippingAddress.zip)) ? ' ' : ''}
                {String(customerToDisplay.shippingAddress.zip)}
              </p>
            )}
            {customerToDisplay.shippingAddress.country && <p className="text-sm">{String(customerToDisplay.shippingAddress.country)}</p>}
          </div>
        )}

        <div className={`text-left ${hasShippingAddress ? 'md:text-right md:col-span-1' : 'md:text-right md:col-start-3 md:col-span-1'}`}>
          <p><span className="font-semibold text-muted-foreground">Issue Date:</span> {invoice.issueDate ? format(new Date(invoice.issueDate), 'PPP') : 'N/A'}</p> {/* Changed prop */}
          <p><span className="font-semibold text-muted-foreground">Due Date:</span> {invoice.validUntilDate ? format(new Date(invoice.validUntilDate), 'PPP') : 'N/A'}</p> {/* Changed to Due Date */}
          <p className="mt-2"><span className="font-semibold text-muted-foreground">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'Paid' ? 'bg-primary/10 text-primary' : invoice.status === 'Overdue' || invoice.status === 'Cancelled' ? 'bg-destructive/10 text-destructive-foreground' : 'bg-secondary text-secondary-foreground'}`}>{invoice.status}</span></p> {/* Message changed, prop changed */}
          {customerToDisplay.currency && <p><span className="font-semibold text-muted-foreground">Currency:</span> {String(customerToDisplay.currency)}</p>}
          {invoice.purchaseOrderNumber && <p><span className="font-semibold text-muted-foreground">PO Number:</span> {String(invoice.purchaseOrderNumber)}</p>} {/* Changed prop */}
        </div>
      </div>

      {(paymentTermsText || commitmentPeriodText || paymentFrequencyText || invoice.serviceStartDate || invoice.serviceEndDate || invoice.notes) && ( // Changed props
        <div className="mb-6 p-4 border rounded-md bg-muted/30">
          <h3 className="font-semibold mb-2 text-muted-foreground">Service &amp; Payment Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {paymentTermsText && paymentTermsText !== "N/A" && <p><span className="font-medium">Payment Terms:</span> {String(paymentTermsText)}</p>}
            {commitmentPeriodText && commitmentPeriodText !== "N/A" && <p><span className="font-medium">Commitment Period:</span> {String(commitmentPeriodText)}</p>}
            {paymentFrequencyText && paymentFrequencyText !== "N/A" && <p><span className="font-medium">Payment Frequency:</span> {String(paymentFrequencyText)}</p>}
            {invoice.serviceStartDate && <p><span className="font-medium">Service Start:</span> {format(new Date(invoice.serviceStartDate), 'PPP')}</p>} {/* Changed prop */}
            {invoice.serviceEndDate && <p><span className="font-medium">Service End:</span> {format(new Date(invoice.serviceEndDate), 'PPP')}</p>} {/* Changed prop */}
            {invoice.notes && <p className="md:col-span-2"><span className="font-medium">Notes:</span> {String(invoice.notes)}</p>} {/* Changed prop */}
          </div>
        </div>
      )}

      {/* Invoice Items */}
      {(Array.isArray(parsedItems) && parsedItems.length > 0) && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2 text-muted-foreground">Items & Services</h3>
          <table className="w-full border border-border">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                <th className="p-2 text-left border border-border">Description</th>
                <th className="p-2 text-left border border-border">Details</th>
                <th className="p-2 text-right border border-border">Quantity</th>
                <th className="p-2 text-right border border-border">Rate ({currencySymbol})</th>
                <th className="p-2 text-right border border-border">Amount ({currencySymbol})</th>
              </tr>
            </thead>
            <tbody>
              {parsedItems.map((item, index) => (
                <tr key={item.id || index} className="border-b border-border">
                  <td className="p-2 border border-border">{String(item.description)}</td>
                  <td className="p-2 border border-border text-xs text-muted-foreground">{String(item.details || 'N/A')}</td>
                  <td className="p-2 text-right border border-border">{String(item.quantity)}</td>
                  <td className="p-2 text-right border border-border">{(item.rate ?? 0).toFixed(2)}</td>
                  <td className="p-2 text-right border border-border">{(item.amount ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Additional Charges */}
      {(Array.isArray(parsedAdditionalCharges) && parsedAdditionalCharges.length > 0) && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2 text-muted-foreground">Additional Charges</h3>
          <table className="w-full border-collapse">
            <tbody>
              {parsedAdditionalCharges.map((charge, index) => (
                <tr key={charge.id || index} className="border-b border-border">
                  <td className="p-2 border border-border">
                    {String(charge.description)}
                    {charge.valueType === 'percentage' && ` (${String(charge.value)}%)`}
                  </td>
                  <td className="p-2 text-right border border-border">{currencySymbol}{(charge.value ?? 0).toFixed(2)}</td> {/* Ensure 'calculatedAmount' is used for display */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals Section */}
      <div className="flex justify-end mb-8">
        <div className="w-full md:w-1/3 border border-border p-4">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Subtotal:</span>
            <span>{currencySymbol}{(invoice.subtotal || 0).toFixed(2)}</span> {/* Changed prop */}
          </div>
          {invoice.discountType && invoice.discountValue !== undefined && ( // Changed prop
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Discount ({invoice.discountType === 'percentage' ? `${String(invoice.discountValue)}%` : currencySymbol}):</span> {/* Changed prop */}
              <span>-{currencySymbol}{(invoice.discountAmount || 0).toFixed(2)}</span> {/* Changed prop */}
            </div>
          )}
          {totalAdditionalChargesValue > 0 && (
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Additional Charges:</span>
              <span>{currencySymbol}{(totalAdditionalChargesValue).toFixed(2)}</span>
            </div>
          )}
          {invoice.taxRate !== undefined && invoice.taxRate > 0 && ( // Changed prop
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Tax ({String(invoice.taxRate)}%):</span> {/* Changed prop */}
              <span>{currencySymbol}{(invoice.taxAmount || 0).toFixed(2)}</span> {/* Changed prop */}
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2 border-border">
            <span>Total:</span>
            <span>{currencySymbol}{(invoice.total || 0).toFixed(2)}</span> {/* Changed prop */}
          </div>
        </div>
      </div>

      {/* Additional Information / Footer Details */}
      {(invoice.internalNotes || companyBranding.additionalFooterText) && ( // Changed prop
        <div className="mt-8 mb-8 p-4 border rounded-md bg-muted/30">
          <h3 className="font-semibold mb-2 text-muted-foreground">Additional Information</h3>
          {invoice.internalNotes && <p className="text-sm mb-2"><span className="font-medium">Internal Notes:</span> {String(invoice.internalNotes)}</p>} {/* Changed prop */}
          {companyBranding.additionalFooterText && (
            <div className="prose prose-sm max-w-none break-words text-xs text-muted-foreground">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>{String(companyBranding.additionalFooterText)}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Final Signatures */}
      <div className="mt-12 pt-6 border-t border-border">
        <div className="flex justify-between items-end text-sm">
          <div className="w-1/2 pr-4">
            <p className="font-semibold text-muted-foreground">For {companyBranding.name}:</p>
            {companyBranding.signatureUrl ? (
              <img src={companyBranding.signatureUrl} alt="Company Signature" width={200} height={80} className="mt-4 mb-2" style={{ objectFit: 'contain', maxHeight: '80px' }} data-ai-hint="company signature" />
            ) : (
              <div className="mt-4 mb-2 w-[200px] h-[80px] bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">Signature Area</div>
            )}
            <p className="border-t border-border pt-2">Authorized Signature</p>
            {companyBranding.authorisedSignatoryName && <p className="text-xs text-muted-foreground">{String(companyBranding.authorisedSignatoryName)}</p>}
            {companyBranding.authorisedSignatoryTitle && <p className="text-xs text-muted-foreground">{String(companyBranding.authorisedSignatoryTitle)}</p>}
          </div>
          <div className="w-1/2 pl-4 text-right">
            <p className="font-semibold text-muted-foreground">For Customer:</p>
            <div className="mt-4 mb-2 w-full h-[80px] bg-muted rounded inline-flex items-center justify-center text-muted-foreground text-xs">Customer Signature Area</div>
            <p className="border-t border-border pt-2">Client Signature</p>
            {customerToDisplay.contactPerson && <p className="text-xs text-muted-foreground">{String(customerToDisplay.contactPerson)}</p>}
            {customerToDisplay.contactTitle && <p className="text-xs text-muted-foreground">{String(customerToDisplay.contactTitle)}</p>}
          </div>
        </div>
      </div>

      {/* Page Break Hint (for print) */}
    <div className="hidden print:block h-64"></div>
      <div className="hidden print:block text-center text-muted-foreground text-xs mt-8">-- End of Order Form --</div>
   <div className="flex justify-center gap-4 mt-8 print:hidden"> {/* Use gap-4 for spacing */}
        {/* PDF Download Button */}
        <PDFDownloadLink
          document={<InvoicePDF invoice={invoice} customer={customer} companyBranding={companyBranding} />} // Changed component and prop
          fileName={`Invoice_${invoice.invoiceNumber || 'untitled'}.pdf`} // Changed file name
        >
          {({ blob, url, loading, error }) => (
            <Button size="lg" disabled={loading}>
              <Download className="mr-2 h-5 w-5" />
              {loading ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          )}
        </PDFDownloadLink>

        {/* Excel Download Button - Corrected usage */}
        <InvoiceExcel
  invoice={invoice}
  customer={customer}
  companyBranding={companyBranding}
  children={<Button size="lg" variant="outline"><Download className="mr-2 h-5 w-5" />Download Excel</Button>}
/>

{/* Send to Mail Button - Now opens the dialog */}
        <Button
            size="lg"
            variant="outline"
            onClick={() => setIsEmailDialogOpen(true)} // <-- Open the dialog on click
            disabled={!invoice.id || !customer?.email} // Disable if critical data missing
        >
            <Mail className="mr-2 h-5 w-5" /> {/* Using Mail icon */}
            Send to Mail
        </Button>

        {/* Removed emailStatus display from here, dialog handles its own status */}
        
        {/* Email Dialog Component */}
        {isEmailDialogOpen && ( // Only render when open
            <EmailOrderDialog
                isOpen={isEmailDialogOpen}
                onClose={() => setIsEmailDialogOpen(false)}
                documentData={invoice} // Pass order form data as documentData
                customerData={customerToDisplay} // Pass customer data
                companyBranding={companyBranding} // Pass company branding
                authToken={authToken} // Pass the auth token
            />
        )}

      </div>

    </div>
  );
}