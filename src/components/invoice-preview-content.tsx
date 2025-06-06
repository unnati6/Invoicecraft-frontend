'use client';

import * as _React from 'react';
import type { Invoice, Customer, CoverPageTemplate } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { getCurrencySymbol } from '@/lib/currency-utils';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { CoverPageContent } from '@/components/cover-page-content';
import { BrandingSettingsFormData as BrandingSettings } from '@/lib/schemas'; // Import BrandingSettings type

interface InvoicePreviewContentProps {
  document: Invoice;
  customer?: Customer;
  coverPageTemplate?: CoverPageTemplate;
  companyBranding: BrandingSettings; // <--- ADDED: companyBranding prop
}

function replacePlaceholders(
  content: string | undefined,
  doc: Invoice,
  customer?: Customer
): string | undefined {
  if (!content?.trim()) return undefined;
  let processedContent = content;

  const currencySymbol = getCurrencySymbol(customer?.currency || doc.currencyCode);

  const paymentTermsDisplay = (doc.paymentTerms === 'Custom' && doc.customPaymentTerms?.trim())
    ? doc.customPaymentTerms
    : (doc.paymentTerms === 'Custom' ? 'Custom (Details in document)' : doc.paymentTerms);

  const commitmentPeriodDisplay = (doc.commitmentPeriod === 'Custom' && doc.customCommitmentPeriod?.trim())
    ? doc.customCommitmentPeriod
    : (doc.commitmentPeriod === 'Custom' ? 'Custom (Details in document)' : doc.commitmentPeriod);

  const paymentFrequencyDisplay = (doc.paymentFrequency === 'Custom' && doc.customPaymentFrequency?.trim())
    ? doc.customPaymentFrequency
    : (doc.paymentFrequency === 'Custom' ? 'Custom (Details in document)' : doc.paymentFrequency);


  const placeholders: Record<string, () => string | undefined | null> = {
    '{{customerName}}': () => customer?.name,
    '{{customerEmail}}': () => customer?.email,
    '{{customerPhone}}': () => customer?.phone,
    '{{customerBillingAddress.street}}': () => customer?.billingAddress?.street,
    '{{customerBillingAddress.city}}': () => customer?.billingAddress?.city,
    '{{customerBillingAddress.state}}': () => customer?.billingAddress?.state,
    '{{customerBillingAddress.zip}}': () => customer?.billingAddress?.zip,
    '{{customerBillingAddress.country}}': () => customer?.billingAddress?.country,
    '{{customerShippingAddress.street}}': () => customer?.shippingAddress?.street,
    '{{customerShippingAddress.city}}': () => customer?.shippingAddress?.city,
    '{{customerShippingAddress.state}}': () => customer?.shippingAddress?.state,
    '{{customerShippingAddress.zip}}': () => customer?.shippingAddress?.zip,
    '{{customerShippingAddress.country}}': () => customer?.shippingAddress?.country,
    '{{documentNumber}}': () => doc.invoiceNumber,
    // Safely format dates, ensuring they are not null
    '{{issueDate}}': () => doc.issueDate ? format(new Date(doc.issueDate), 'PPP') : '',
    '{{dueDate}}': () => doc.dueDate ? format(new Date(doc.dueDate), 'PPP') : '',
    '{{totalAmount}}': () => `${currencySymbol}${(doc.total || 0).toFixed(2)}`,
    '{{paymentTerms}}': () => paymentTermsDisplay,
    '{{commitmentPeriod}}': () => commitmentPeriodDisplay,
    '{{paymentFrequency}}': () => paymentFrequencyDisplay,
    '{{serviceStartDate}}': () => doc.serviceStartDate ? format(new Date(doc.serviceStartDate), 'PPP') : '',
    '{{serviceEndDate}}': () => doc.serviceEndDate ? format(new Date(doc.serviceEndDate), 'PPP') : '',
  };

  for (const placeholder in placeholders) {
    const tag = placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const value = placeholders[placeholder]();
    processedContent = processedContent.replace(new RegExp(tag, 'g'), value || '');
  }

  const signaturePanelHtml = `
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
      <h4 style="margin-bottom: 15px; font-size: 1.1em;">Signatures</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
        <tr>
          <td style="width: 50%; padding: 10px 5px; vertical-align: bottom;">
            <div style="border-bottom: 1px solid #333; height: 40px; margin-bottom: 5px;"></div>
            <p style="margin: 0;">Authorized Signature (Your Company)</p>
          </td>
          <td style="width: 50%; padding: 10px 5px; vertical-align: bottom;">
            <div style="border-bottom: 1px solid #333; height: 40px; margin-bottom: 5px;"></div>
            <p style="margin: 0;">Client Signature</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px;">
            <p style="margin: 0;">Printed Name: _________________________</p>
          </td>
          <td style="padding: 5px;">
            <p style="margin: 0;">Printed Name: _________________________</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px;">
            <p style="margin: 0;">Date: _________________________</p>
          </td>
          <td style="padding: 5px;">
            <p style="margin: 0;">Date: _________________________</p>
          </td>
        </tr>
      </table>
    </div>
  `;
  processedContent = processedContent.replace(/{{signaturePanel}}/g, signaturePanelHtml);

  if (!processedContent?.trim()) return undefined;
  return processedContent;
}


export function InvoicePreviewContent({ document: invoice, customer, coverPageTemplate, companyBranding }: InvoicePreviewContentProps) {
  console.log("[InvoicePreviewContent] Received document:", invoice);
  console.log("[InvoicePreviewContent] Received customer:", customer);
  console.log("[InvoicePreviewContent] Received coverPageTemplate:", coverPageTemplate);
  console.log("[InvoicePreviewContent] Received companyBranding:", companyBranding);

  const companyLogoUrl = companyBranding.logoUrl || '/images/revynox_logo_black.png';
  const companySignatureUrl = companyBranding.signatureUrl;

  const yourCompanyDisplay = {
    name: companyBranding.name || 'Your Awesome Company LLC',
    addressLine1: companyBranding.street || 'Your Address Line 1',
    addressLine2: `${companyBranding.city || ''}${companyBranding.city && (companyBranding.state || companyBranding.zip || companyBranding.country) ? ', ' : ''}${companyBranding.state || ''} ${companyBranding.zip || ''}${companyBranding.zip && companyBranding.country ? ', ' : ''}${companyBranding.country || ''}`.trim(),
    email: companyBranding.email || 'billing@yourcompany.com',
    phone: companyBranding.phone || '(555) 123-4567',
  };

  if (yourCompanyDisplay.addressLine2.replace(/[, ]/g, '').length === 0) {
    yourCompanyDisplay.addressLine2 = '';
  }


  const customerToDisplay: Partial<Customer> & { name: string; email: string; currency: string } = {
    name: invoice.customerName || customer?.name || 'N/A',
    email: customer?.email || 'N/A',
    billingAddress: customer?.billingAddress || undefined,
    shippingAddress: customer?.shippingAddress || undefined,
    currency: customer?.currency || invoice.currencyCode || 'USD'
  };


  const currencySymbol = getCurrencySymbol(customerToDisplay.currency);
  const partnerLogoUrl = 'https://placehold.co/150x50.png';
  const totalAdditionalChargesValue = invoice.additionalCharges?.reduce((sum, charge) => sum + (charge.calculatedAmount ?? 0), 0) || 0;
  const hasShippingAddress = customerToDisplay.shippingAddress &&
    (customerToDisplay.shippingAddress.street ||
      customerToDisplay.shippingAddress.city);

  const processedMsaContent = invoice.msaContent ? replacePlaceholders(invoice.msaContent, invoice, customer) : undefined;
  const processedTermsAndConditions = invoice.termsAndConditions ? replacePlaceholders(invoice.termsAndConditions, invoice, customer) : undefined;

  const paymentTermsText = (invoice.paymentTerms === 'Custom')
    ? (invoice.customPaymentTerms?.trim() ? invoice.customPaymentTerms : 'Custom (Not specified)')
    : invoice.paymentTerms;

  const commitmentPeriodText = (invoice.commitmentPeriod === 'Custom')
    ? (invoice.customCommitmentPeriod?.trim() ? invoice.customCommitmentPeriod : 'Custom (Not specified)')
    : invoice.commitmentPeriod;

  const paymentFrequencyText = (invoice.paymentFrequency === 'Custom')
    ? (invoice.customPaymentFrequency?.trim() ? invoice.customPaymentFrequency : 'Custom (Not specified)')
    : invoice.paymentFrequency;

  return (
    <div className="p-6 bg-card text-foreground font-sans text-sm">
      {coverPageTemplate && invoice?.msaContent && (
        <>
          <CoverPageContent document={invoice} customer={customer} template={coverPageTemplate} />
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
          {companyLogoUrl ? (
            <Image src={companyLogoUrl} alt={`${yourCompanyDisplay.name} Logo`} width={180} height={54} className="mb-3" style={{ objectFit: 'contain', maxHeight: '54px' }} data-ai-hint="company logo"/>
          ) : ( <div className="mb-3 w-[180px] h-[54px] bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">Your Logo</div> )}
          <h2 className="text-xl font-semibold text-primary">{yourCompanyDisplay.name}</h2>
          <p className="text-xs text-muted-foreground">{yourCompanyDisplay.addressLine1}</p>
          {yourCompanyDisplay.addressLine2 && <p className="text-xs text-muted-foreground">{yourCompanyDisplay.addressLine2}</p>}
          <p className="text-xs text-muted-foreground">Email: {yourCompanyDisplay.email}</p>
          <p className="text-xs text-muted-foreground">Phone: {yourCompanyDisplay.phone}</p>
        </div>
        <div className="text-right w-1/2">
          <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
          <p className="text-muted-foreground">Invoice #: {invoice.invoiceNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <h3 className="font-semibold mb-1 text-muted-foreground">BILL TO:</h3>
          <p className="font-medium">{customerToDisplay.name}</p>
          {customerToDisplay.billingAddress && (<>
            <p className="text-sm">{customerToDisplay.billingAddress.street}</p>
            <p className="text-sm">{customerToDisplay.billingAddress.city}, {customerToDisplay.billingAddress.state} {customerToDisplay.billingAddress.zip}</p>
            <p className="text-sm">{customerToDisplay.billingAddress.country}</p>
          </>)}
          <p className="text-sm">{customerToDisplay.email}</p>
        </div>

        {hasShippingAddress && (
          <div className="md:col-span-1">
            <h3 className="font-semibold mb-1 text-muted-foreground">SHIP TO:</h3>
            <p className="font-medium">{customerToDisplay.name}</p>
            {customerToDisplay.shippingAddress && (<>
              <p className="text-sm">{customerToDisplay.shippingAddress.street}</p>
              <p className="text-sm">{customerToDisplay.shippingAddress.city}, {customerToDisplay.shippingAddress.state} {customerToDisplay.shippingAddress.zip}</p>
              <p className="text-sm">{customerToDisplay.shippingAddress.country}</p>
            </>)}
          </div>
        )}

        <div className={`text-left ${hasShippingAddress ? 'md:text-right md:col-span-1' : 'md:text-right md:col-start-3 md:col-span-1'}`}>
          {/* CORRECTED LINES BELOW: */}
          <p><span className="font-semibold text-muted-foreground">Issue Date:</span> {invoice.issueDate ? format(new Date(invoice.issueDate), 'PPP') : 'N/A'}</p>
          <p><span className="font-semibold text-muted-foreground">Due Date:</span> {invoice.dueDate ? format(new Date(invoice.dueDate), 'PPP') : 'N/A'}</p>
          {/* END OF CORRECTED LINES */}
          <p className="mt-2"><span className="font-semibold text-muted-foreground">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'Paid' ? 'bg-primary/10 text-primary' : invoice.status === 'Overdue' ? 'bg-status-overdue-background text-status-overdue-foreground' : invoice.status === 'Sent' ? 'bg-destructive/10 text-destructive-foreground' : 'bg-secondary text-secondary-foreground'}`}>{invoice.status}</span></p>
          {customerToDisplay.currency && <p><span className="font-semibold text-muted-foreground">Currency:</span> {customerToDisplay.currency}</p>}
        </div>
      </div>

      {(paymentTermsText || commitmentPeriodText || paymentFrequencyText || invoice.serviceStartDate || invoice.serviceEndDate) && (
        <div className="mb-6 p-4 border rounded-md bg-muted/30">
          <h3 className="font-semibold mb-2 text-muted-foreground">Service &amp; Payment Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {paymentTermsText && paymentTermsText !== "N/A" && <p><span className="font-medium">Payment Terms:</span> {paymentTermsText}</p>}
            {commitmentPeriodText && commitmentPeriodText !== "N/A" && <p><span className="font-medium">Commitment Period:</span> {commitmentPeriodText}</p>}
            {paymentFrequencyText && paymentFrequencyText !== "N/A" && <p><span className="font-medium">Payment Frequency:</span> {paymentFrequencyText}</p>}
            {invoice.serviceStartDate && <p><span className="font-medium">Service Start:</span> {format(new Date(invoice.serviceStartDate), 'PPP')}</p>}
            {invoice.serviceEndDate && <p><span className="font-medium">Service End:</span> {format(new Date(invoice.serviceEndDate), 'PPP')}</p>}
          </div>
        </div>
      )}

      <div className="mb-4">
        <table className="w-full border-collapse">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left font-semibold border border-border">Description</th>
              <th className="p-2 text-right font-semibold border border-border">Quantity</th>
              <th className="p-2 text-right font-semibold border border-border">Rate</th>
              <th className="p-2 text-right font-semibold border border-border">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-border">
                <td className="p-2 border border-border">{item.description}</td>
                <td className="p-2 text-right border border-border">{item.quantity.toFixed(2)}</td>
                <td className="p-2 text-right border border-border">{currencySymbol}{item.rate.toFixed(2)}</td>
                <td className="p-2 text-right border border-border">{currencySymbol}{Number(item.amount ?? 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invoice.additionalCharges && invoice.additionalCharges.length > 0 && (
        <div className="mb-8">
          <table className="w-full border-collapse">
            <tbody>
              {invoice.additionalCharges.map((charge) => (
                <tr key={charge.id} className="border-b border-border">
                  <td className="p-2 border border-border">
                    {charge.description}
                    {charge.valueType === 'percentage' && ` (${charge.value}%)`}
                  </td>
                  <td className="p-2 text-right border border-border">
                    {currencySymbol}
                    {(charge.calculatedAmount ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {partnerLogoUrl && (
        <div className="mb-8 mt-4 py-4 border-t border-b border-dashed flex justify-start">
          <Image src={partnerLogoUrl} alt="Partner Logo" width={150} height={50} style={{ objectFit: 'contain', maxHeight: '50px' }} data-ai-hint="partner logo" />
        </div>
      )}

      <div className="flex justify-end mb-8">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal (Items):</span><span>{currencySymbol}{(isFinite(invoice.subtotal) ? invoice.subtotal : 0).toFixed(2)}</span></div>
          {totalAdditionalChargesValue > 0 && (<div className="flex justify-between"><span className="text-muted-foreground">Total Additional Charges:</span><span>{currencySymbol}{(isFinite(totalAdditionalChargesValue) ? totalAdditionalChargesValue : 0).toFixed(2)}</span></div>)}
          {invoice.discountEnabled && invoice.discountAmount && invoice.discountAmount > 0 && (
            <div className="flex justify-between text-destructive">
              <span>Discount {invoice.discountDescription ? `(${invoice.discountDescription})` : ''}:</span>
              <span>-{currencySymbol}{(isFinite(invoice.discountAmount) ? invoice.discountAmount : 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between"><span className="text-muted-foreground">Taxable Amount:</span><span>{currencySymbol}{(isFinite(invoice.subtotal + totalAdditionalChargesValue - (invoice.discountAmount || 0)) ? (invoice.subtotal + totalAdditionalChargesValue - (invoice.discountAmount || 0)) : 0).toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Tax ({invoice.taxRate}%):</span><span>{currencySymbol}{(isFinite(invoice.taxAmount) ? invoice.taxAmount : 0).toFixed(2)}</span></div>
          <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="font-bold text-lg">Total:</span><span className="font-bold text-lg">{currencySymbol}{(isFinite(invoice.total) ? invoice.total : 0).toFixed(2)}</span></div>
        </div>
      </div>

      {processedTermsAndConditions && (
        <div className="mb-8 prose prose-sm max-w-none break-words">
          <h3 className="font-semibold mb-2 text-muted-foreground">Terms & Conditions:</h3>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{processedTermsAndConditions}</ReactMarkdown>
        </div>
      )}

      <div className="mt-12 pt-8 border-t">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="font-semibold mb-1">Authorized Signature ({yourCompanyDisplay.name}):</p>
            {companySignatureUrl ? (<div className="relative h-20 mb-2"><Image src={companySignatureUrl} alt="Company Signature" fill={true} style={{ objectFit: 'contain' }} className="border-b border-gray-400"/></div>) : (<div className="h-16 border-b border-gray-400 mb-2"></div>)}
            <p className="text-xs text-muted-foreground">{yourCompanyDisplay.name}</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Client Signature:</p>
            <div className="h-16 border-b border-gray-400 mb-2"></div>
            <p className="text-xs text-muted-foreground">{customerToDisplay.name}</p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground mt-12">
        <p>Thank you for your business! Questions? Contact {yourCompanyDisplay.email}</p>
      </div>
    </div>
  );
}

InvoicePreviewContent.displayName = "InvoicePreviewContent";