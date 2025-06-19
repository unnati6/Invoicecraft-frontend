// components/InvoiceExcel.jsx
import React from 'react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { getCurrencySymbol } from '../lib/currency-utils';

// Helper function to strip HTML tags
const stripHtmlTags = (htmlString) => {
  if (typeof htmlString !== 'string') return '';
  return htmlString.replace(/<[^>]*>?/gm, '');
};

const InvoiceExcel = ({ invoice, customer, companyBranding, children }) => {
  if (!invoice) {
    console.error("[InvoiceExcel] Received undefined or null invoice prop. Cannot generate Excel.");
    return React.cloneElement(children, { disabled: true });
  }

  // Safely parse items and charges
  let parsedItems = [];
  if (typeof invoice.items === 'string' && invoice.items.trim() !== '') {
    try {
      parsedItems = JSON.parse(invoice.items);
    } catch (e) {
      console.error("Failed to parse invoice.items in Excel component:", e);
    }
  } else if (Array.isArray(invoice.items)) {
    parsedItems = invoice.items;
  }

  let parsedAdditionalCharges = [];
  if (typeof invoice.additionalCharges === 'string' && invoice.additionalCharges.trim() !== '') {
    try {
      parsedAdditionalCharges = JSON.parse(invoice.additionalCharges);
    } catch (e) {
      console.error("Failed to parse invoice.additionalCharges in Excel component:", e);
    }
  } else if (Array.isArray(invoice.additionalCharges)) {
    parsedAdditionalCharges = invoice.additionalCharges;
  }

  const customerToDisplay = {
    name: invoice?.customerName || customer?.name || 'N/A',
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
    currency: customer?.currency || invoice?.currencyCode || 'USD',
  };

  const currencySymbol = getCurrencySymbol(customerToDisplay.currency);

  const paymentTermsText = invoice.paymentTerms === 'Custom'
    ? (invoice.customPaymentTerms?.trim() || 'Custom (Not specified)')
    : invoice.paymentTerms;

  const commitmentPeriodText = invoice.commitmentPeriod === 'Custom'
    ? (invoice.customCommitmentPeriod?.trim() || 'Custom (Not specified)')
    : invoice.commitmentPeriod;

  const paymentFrequencyText = invoice.paymentFrequency === 'Custom'
    ? (invoice.customPaymentFrequency?.trim() || 'Custom (Not specified)')
    : invoice.paymentFrequency;

  const getSheetData = (sheetName) => {
    switch (sheetName) {
      case "Invoice Details":
        return [
          ["Detail", "Value"],
          ["Invoice Number", invoice.invoiceNumber || 'N/A'],
          ["Issue Date", invoice.issueDate ? format(new Date(invoice.issueDate), 'PPP') : 'N/A'],
          ["Due Date", invoice.dueDate ? format(new Date(invoice.dueDate), 'PPP') : 'N/A'],
          ["Status", invoice.status || 'N/A'],
          ["Currency", customerToDisplay.currency || 'N/A'],
          ["PO Number", invoice.purchaseOrderNumber || 'N/A'],
          ["Customer Name", customerToDisplay.name],
          ["Customer Email", customerToDisplay.email],
          ["Customer Phone", customerToDisplay.phone],
          ["Company Name", customerToDisplay.company.name],
          ["Billing Address", [
            customerToDisplay.billingAddress.street,
            customerToDisplay.billingAddress.city,
            customerToDisplay.billingAddress.state,
            customerToDisplay.billingAddress.zip,
            customerToDisplay.billingAddress.country,
          ].filter(Boolean).join(', ') || 'N/A'],
          ["Shipping Address", [
            customerToDisplay.shippingAddress.street,
            customerToDisplay.shippingAddress.city,
            customerToDisplay.shippingAddress.state,
            customerToDisplay.shippingAddress.zip,
            customerToDisplay.shippingAddress.country,
          ].filter(Boolean).join(', ') || 'N/A'],
          ["Payment Terms", paymentTermsText],
          ["Commitment Period", commitmentPeriodText],
          ["Payment Frequency", paymentFrequencyText],
          ["Service Start Date", invoice.serviceStartDate ? format(new Date(invoice.serviceStartDate), 'PPP') : 'N/A'],
          ["Service End Date", invoice.serviceEndDate ? format(new Date(invoice.serviceEndDate), 'PPP') : 'N/A'],
          ["Internal Notes", invoice.internalNotes || 'N/A'],
        ];

      case "Items and Services":
        return [
          ["Description", "Details", "Quantity", `Rate (${currencySymbol})`, `Amount (${currencySymbol})`],
          ...parsedItems.map(item => [
            String(item.description),
            String(item.details || 'N/A'),
            Number(item.quantity) || 0,
            Number(item.rate ?? 0).toFixed(2),
            Number(item.amount ?? 0).toFixed(2),
          ])
        ];

      case "Additional Charges":
        return [
          ["Description", `Amount (${currencySymbol})`],
          ...parsedAdditionalCharges.map(charge => [
            `${String(charge.description)}${charge.valueType === 'percentage' ? ` (${String(charge.value)}%)` : ''}`,
            Number(charge.calculatedAmount ?? 0).toFixed(2),
          ])
        ];

      case "Totals":
        const totalAdditionalChargesValue = parsedAdditionalCharges.reduce((sum, charge) => sum + (charge.calculatedAmount ?? 0), 0);
        return [
          ["Summary", "Value"],
          ["Subtotal", (invoice.subtotal || 0).toFixed(2)],
          ["Discount", invoice.discountAmount ? `-${(invoice.discountAmount || 0).toFixed(2)}` : '0.00'],
          ["Additional Charges", totalAdditionalChargesValue.toFixed(2)],
          [`Tax (${invoice.taxRate || 0}%)`, (invoice.taxAmount || 0).toFixed(2)],
          ["Total", (invoice.total || 0).toFixed(2)],
        ];

      case "Legal Content":
        const legalRows = [];
        if (invoice.msaContent) legalRows.push(["Master Service Agreement", stripHtmlTags(invoice.msaContent)]);
        if (invoice.termsAndConditions) legalRows.push(["Terms and Conditions", stripHtmlTags(invoice.termsAndConditions)]);
        if (companyBranding.additionalFooterText) legalRows.push(["Additional Footer Text", stripHtmlTags(companyBranding.additionalFooterText)]);
        return [["Type", "Content"], ...legalRows];

      default:
        return [];
    }
  };

  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();
    const sheets = [
      "Invoice Details",
      "Items and Services",
      "Additional Charges",
      "Totals",
      "Legal Content"
    ];

    sheets.forEach(sheet => {
      const data = getSheetData(sheet);
      if (data.length) {
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, sheet);
      }
    });

    XLSX.writeFile(wb, `Invoice_${invoice.invoiceNumber || 'untitled'}.xlsx`);
  };

  return React.isValidElement(children)
    ? React.cloneElement(children, { onClick: handleDownloadExcel })
    : null;
};

export default InvoiceExcel;
