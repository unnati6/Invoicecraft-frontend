// OrderFormPreviewContent.js
import React from 'react';
import { format } from 'date-fns';
import { getCurrencySymbol } from '../lib/currency-utils'; // Path adjusted
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { CoverPageContent } from './cover-page-content'; // Path adjusted
import { Button } from './ui/button'; // Assuming you have a Button component
import { Download } from 'lucide-react'; // Import a download icon
import { PDFDownloadLink } from '@react-pdf/renderer'; // Import PDFDownloadLink
import OrderFormPDF from './OrderFormPDF'; // Import the OrderFormPDF component
import OrderFormExcel from './OrderFormExcel';
// Helper function
const replacePlaceholders = (content, orderForm, customer) => {
  let replacedContent = content;
  // Safely access properties of orderForm and customer using optional chaining or logical OR
  replacedContent = replacedContent.replace(/{{orderForm.orderFormNumber}}/g, orderForm?.orderFormNumber || 'N/A');
  replacedContent = replacedContent.replace(/{{customer.name}}/g, customer?.name || orderForm?.customerName || 'N/A');
  replacedContent = replacedContent.replace(/{{orderForm.issueDate}}/g, orderForm?.issueDate ? format(new Date(orderForm.issueDate), 'PPP') : 'N/A');
  // Add more placeholders as needed, always using optional chaining for safety
  return replacedContent;
};

export function OrderFormPreviewContent({ document: orderForm, customer, coverPageTemplate, companyBranding }) {
  // Defensive check: If orderForm is null or undefined, return an error message early.
  // This prevents accessing properties of undefined.
  if (!orderForm) {
    console.error("[OrderFormPreviewContent] Received undefined or null document prop. Cannot render preview.");
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-red-500">
        <h3 className="text-xl font-semibold">Error: Order Form Data Missing</h3>
        <p className="text-muted-foreground mt-2">Could not display preview due to missing order form details.</p>
        <p className="text-muted-foreground">Please ensure the order form exists and is properly loaded.</p>
      </div>
    );
  }

  // Console logs for debugging (will only run if orderForm is valid)
  console.log("[OrderFormPreviewContent] Received document:", orderForm);
  console.log("[OrderFormPreviewContent] Received customer:", customer);
  console.log("[OrderFormPreviewContent] Received coverPageTemplate:", coverPageTemplate);
  console.log("[OrderFormPreviewContent] Received companyBranding:", companyBranding);
  let parsedItems = [];
  if (typeof orderForm.items === 'string' && orderForm.items.trim() !== '') {
    try {
      parsedItems = JSON.parse(orderForm.items);
    } catch (e) {
      console.error("Failed to parse orderForm.items:", e);
    }
  } else if (Array.isArray(orderForm.items)) {
    parsedItems = orderForm.items;
  }

  let parsedAdditionalCharges = [];
  if (typeof orderForm.additionalCharges === 'string' && orderForm.additionalCharges.trim() !== '') {
    try {
      parsedAdditionalCharges = JSON.parse(orderForm.additionalCharges);
    } catch (e) {
      console.error("Failed to parse orderForm.additionalCharges:", e);
    }
  } else if (Array.isArray(orderForm.additionalCharges)) {
    parsedAdditionalCharges = orderForm.additionalCharges;
  }

  // Safely access customer properties for display and ensure address parts are strings
  const customerToDisplay = {
    name: orderForm?.customerName || customer?.name || 'N/A',
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
    // Ensure addresses are objects, and their properties are explicitly defaulted to strings
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
    currency: customer?.currency || orderForm?.currencyCode || 'USD'
  };

  const currencySymbol = getCurrencySymbol(customerToDisplay.currency);
  // FIX: Ensure orderForm.additionalCharges is an array before calling .reduce()
  const totalAdditionalChargesValue = (Array.isArray(orderForm.additionalCharges) ? orderForm.additionalCharges : []).reduce((sum, charge) => sum + (charge.calculatedAmount ?? 0), 0);
  
  // Adjusted hasShippingAddress check based on the now-guaranteed string properties
  const hasShippingAddress = customerToDisplay.shippingAddress.street || customerToDisplay.shippingAddress.city;

  // Process markdown content, ensuring orderForm and customer are valid
  const processedMsaContent = orderForm.msaContent ? replacePlaceholders(orderForm.msaContent, orderForm, customer) : undefined;
  const processedTermsAndConditions = orderForm.termsAndConditions ? replacePlaceholders(orderForm.termsAndConditions, orderForm, customer) : undefined;

  const paymentTermsText = (orderForm.paymentTerms === 'Custom')
    ? (orderForm.customPaymentTerms?.trim() ? orderForm.customPaymentTerms : 'Custom (Not specified)')
    : orderForm.paymentTerms;

  const commitmentPeriodText = (orderForm.commitmentPeriod === 'Custom')
    ? (orderForm.customCommitmentPeriod?.trim() ? orderForm.customCommitmentPeriod : 'Custom (Not specified)')
    : orderForm.commitmentPeriod;

  const paymentFrequencyText = (orderForm.paymentFrequency === 'Custom')
    ? (orderForm.customPaymentFrequency?.trim() ? orderForm.customPaymentFrequency : 'Custom (Not specified)')
    : orderForm.paymentFrequency;

  return (
    <div className="p-6 bg-card text-foreground font-sans text-sm">
      {coverPageTemplate && orderForm?.msaContent && (
        <>
          <CoverPageContent document={orderForm} customer={customer} template={coverPageTemplate} />
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
            <img src={companyBranding.logoUrl} alt={`${companyBranding.name} Logo`} width={180} height={54} className="mb-3" style={{ objectFit: 'contain', maxHeight: '54px' }} data-ai-hint="company logo"/>
          ) : ( <div className="mb-3 w-[180px] h-[54px] bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">Your Logo</div> )}
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
          <h1 className="text-3xl font-bold text-primary">ORDER FORM</h1>
          <p className="text-muted-foreground">Order Form no: {orderForm.orderFormNumber}</p>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-1">
          <h3 className="font-semibold mb-1 text-muted-foreground">ORDER FORM FOR:</h3>
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
          <p><span className="font-semibold text-muted-foreground">Issue Date:</span> {orderForm.issueDate ? format(new Date(orderForm.issueDate), 'PPP') : 'N/A'}</p>
          <p><span className="font-semibold text-muted-foreground">Valid Until:</span> {orderForm.validUntilDate ? format(new Date(orderForm.validUntilDate), 'PPP') : 'N/A'}</p>
           <p className="mt-2"><span className="font-semibold text-muted-foreground">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${orderForm.status === 'Accepted' ? 'bg-primary/10 text-primary' : orderForm.status === 'Declined' || orderForm.status === 'Expired' ? 'bg-destructive/10 text-destructive-foreground' : 'bg-secondary text-secondary-foreground'}`}>{orderForm.status}</span></p>
           {customerToDisplay.currency && <p><span className="font-semibold text-muted-foreground">Currency:</span> {String(customerToDisplay.currency)}</p>}
           {orderForm.purchaseOrderNumber && <p><span className="font-semibold text-muted-foreground">PO Number:</span> {String(orderForm.purchaseOrderNumber)}</p>}
        </div>
      </div>

      { (paymentTermsText || commitmentPeriodText || paymentFrequencyText || orderForm.serviceStartDate || orderForm.serviceEndDate || orderForm.notes) && (
        <div className="mb-6 p-4 border rounded-md bg-muted/30">
          <h3 className="font-semibold mb-2 text-muted-foreground">Service &amp; Payment Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {paymentTermsText && paymentTermsText !== "N/A" && <p><span className="font-medium">Payment Terms:</span> {String(paymentTermsText)}</p>}
            {commitmentPeriodText && commitmentPeriodText !== "N/A" && <p><span className="font-medium">Commitment Period:</span> {String(commitmentPeriodText)}</p>}
            {paymentFrequencyText && paymentFrequencyText !== "N/A" && <p><span className="font-medium">Payment Frequency:</span> {String(paymentFrequencyText)}</p>}
            {orderForm.serviceStartDate && <p><span className="font-medium">Service Start:</span> {format(new Date(orderForm.serviceStartDate), 'PPP')}</p>}
            {orderForm.serviceEndDate && <p><span className="font-medium">Service End:</span> {format(new Date(orderForm.serviceEndDate), 'PPP')}</p>}
            {orderForm.notes && <p className="md:col-span-2"><span className="font-medium">Notes:</span> {String(orderForm.notes)}</p>}
          </div>
        </div>
      )}

      {/* Order Form Items */}
      {(Array.isArray(parsedItems) && parsedItems.length > 0) && ( // Use parsedItems here
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
              {parsedItems.map((item, index) => ( // Use parsedItems here
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
      {(Array.isArray(parsedAdditionalCharges) && parsedAdditionalCharges.length > 0) && ( // Use parsedAdditionalCharges here
        <div className="mb-8">
          <h3 className="font-semibold mb-2 text-muted-foreground">Additional Charges</h3>
          <table className="w-full border-collapse">
            <tbody>
              {parsedAdditionalCharges.map((charge, index) => ( // Use parsedAdditionalCharges here
                <tr key={charge.id || index} className="border-b border-border">
                  <td className="p-2 border border-border">
                    {String(charge.description)}
                    {charge.valueType === 'percentage' && ` (${String(charge.value)}%)`}
                  </td>
                  <td className="p-2 text-right border border-border">{currencySymbol}{(charge.calculatedAmount ?? 0).toFixed(2)}</td>
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
            <span>{currencySymbol}{(orderForm.subtotal || 0).toFixed(2)}</span>
          </div>
          {orderForm.discountType && orderForm.discountValue !== undefined && (
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Discount ({orderForm.discountType === 'percentage' ? `${String(orderForm.discountValue)}%` : currencySymbol}):</span>
              <span>-{currencySymbol}{(orderForm.discountAmount || 0).toFixed(2)}</span>
            </div>
          )}
          {totalAdditionalChargesValue > 0 && (
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Additional Charges:</span>
              <span>{currencySymbol}{(totalAdditionalChargesValue).toFixed(2)}</span>
            </div>
          )}
          {orderForm.taxRate !== undefined && orderForm.taxRate > 0 && (
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Tax ({String(orderForm.taxRate)}%):</span>
              <span>{currencySymbol}{(orderForm.taxAmount || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2 border-border">
            <span>Total:</span>
            <span>{currencySymbol}{(orderForm.total || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Additional Information / Footer Details */}
      {(orderForm.internalNotes || companyBranding.additionalFooterText) && (
        <div className="mt-8 mb-8 p-4 border rounded-md bg-muted/30">
          <h3 className="font-semibold mb-2 text-muted-foreground">Additional Information</h3>
          {orderForm.internalNotes && <p className="text-sm mb-2"><span className="font-medium">Internal Notes:</span> {String(orderForm.internalNotes)}</p>}
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
              <img src={companyBranding.signatureUrl} alt="Company Signature" width={200} height={80} className="mt-4 mb-2" style={{ objectFit: 'contain', maxHeight: '80px' }} data-ai-hint="company signature"/>
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
          document={<OrderFormPDF orderForm={orderForm} customer={customer} companyBranding={companyBranding} />}
          fileName={`OrderForm_${orderForm.orderFormNumber || 'untitled'}.pdf`}
        >
          {({ blob, url, loading, error }) => (
            <Button size="lg" disabled={loading}>
              <Download className="mr-2 h-5 w-5" />
              {loading ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          )}
        </PDFDownloadLink>

        {/* Excel Download Button - Corrected usage */}
        <OrderFormExcel orderForm={orderForm} customer={customer} companyBranding={companyBranding}>
          <Button size="lg" variant="outline"> {/* Using 'outline' variant for distinction */}
            <Download className="mr-2 h-5 w-5" />
            Download Excel
          </Button>
        </OrderFormExcel>
      </div>

    </div>
  );
}

