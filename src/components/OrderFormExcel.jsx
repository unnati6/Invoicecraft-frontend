// components/OrderFormExcel.jsx
import React from 'react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { getCurrencySymbol } from '../lib/currency-utils';

// Helper function to strip HTML tags
const stripHtmlTags = (htmlString) => {
  if (typeof htmlString !== 'string') return '';
  return htmlString.replace(/<[^>]*>?/gm, '');
};

const OrderFormExcel = ({ orderForm, customer, companyBranding, children }) => {
  if (!orderForm) {
    console.error("[OrderFormExcel] Received undefined or null orderForm prop. Cannot generate Excel.");
    return React.cloneElement(children, { disabled: true });
  }

  // Parse items and additionalCharges from JSON strings if they exist and are strings
  let parsedItems = [];
  if (typeof orderForm.items === 'string' && orderForm.items.trim() !== '') {
    try {
      parsedItems = JSON.parse(orderForm.items);
    } catch (e) {
      console.error("Failed to parse orderForm.items in Excel component:", e);
    }
  } else if (Array.isArray(orderForm.items)) {
    parsedItems = orderForm.items;
  }

  let parsedAdditionalCharges = [];
  if (typeof orderForm.additionalCharges === 'string' && orderForm.additionalCharges.trim() !== '') {
    try {
      parsedAdditionalCharges = JSON.parse(orderForm.additionalCharges);
    } catch (e) {
      console.error("Failed to parse orderForm.additionalCharges in Excel component:", e);
    }
  } else if (Array.isArray(orderForm.additionalCharges)) {
    parsedAdditionalCharges = orderForm.additionalCharges;
  }

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

  const paymentTermsText = (orderForm.paymentTerms === 'Custom')
    ? (orderForm.customPaymentTerms?.trim() ? orderForm.customPaymentTerms : 'Custom (Not specified)')
    : orderForm.paymentTerms;

  const commitmentPeriodText = (orderForm.commitmentPeriod === 'Custom')
    ? (orderForm.customCommitmentPeriod?.trim() ? orderForm.customCommitmentPeriod : 'Custom (Not specified)')
    : orderForm.commitmentPeriod;

  const paymentFrequencyText = (orderForm.paymentFrequency === 'Custom')
    ? (orderForm.customPaymentFrequency?.trim() ? orderForm.customPaymentFrequency : 'Custom (Not specified)')
    : orderForm.paymentFrequency;

  // Helper function to get data for a given sheet
  const getSheetData = (sheetName) => {
    switch (sheetName) {
      case "Order Form Details":
        return [
          ["Detail", "Value"],
          ["Order Form Number", orderForm.orderFormNumber || 'N/A'],
          ["Issue Date", orderForm.issueDate ? format(new Date(orderForm.issueDate), 'PPP') : 'N/A'],
          ["Valid Until Date", orderForm.validUntilDate ? format(new Date(orderForm.validUntilDate), 'PPP') : 'N/A'],
          ["Status", orderForm.status || 'N/A'],
          ["Currency", customerToDisplay.currency || 'N/A'],
          ["PO Number", orderForm.purchaseOrderNumber || 'N/A'],
          ["Customer Name", customerToDisplay.name],
          ["Customer Email", customerToDisplay.email],
          ["Customer Phone", customerToDisplay.phone],
          ["Company Name", customerToDisplay.company.name],
          [
            "Billing Address",
            [
              customerToDisplay.billingAddress.street,
              customerToDisplay.billingAddress.city,
              customerToDisplay.billingAddress.state,
              customerToDisplay.billingAddress.zip,
              customerToDisplay.billingAddress.country
            ].filter(Boolean).join(', ') || 'N/A'
          ],
          [
            "Shipping Address",
            [
              customerToDisplay.shippingAddress.street,
              customerToDisplay.shippingAddress.city,
              customerToDisplay.shippingAddress.state,
              customerToDisplay.shippingAddress.zip,
              customerToDisplay.shippingAddress.country
            ].filter(Boolean).join(', ') || 'N/A'
          ],
          ["Payment Terms", paymentTermsText],
          ["Commitment Period", commitmentPeriodText],
          ["Payment Frequency", paymentFrequencyText],
          [
            "Service Start Date",
            orderForm.serviceStartDate ? format(new Date(orderForm.serviceStartDate), 'PPP') : 'N/A'
          ],
          [
            "Service End Date",
            orderForm.serviceEndDate ? format(new Date(orderForm.serviceEndDate), 'PPP') : 'N/A'
          ],
          ["Internal Notes", orderForm.internalNotes || 'N/A'],
        ];

      case "Items and Services":
        const itemsHeader = ["Description", "Details", "Quantity", `Rate (${currencySymbol})`, `Amount (${currencySymbol})`];
        const itemsRows = (Array.isArray(parsedItems) ? parsedItems : []).map(item => ([ // Use parsedItems
          String(item.description),
          String(item.details || 'N/A'),
          Number(item.quantity) || 0,
          Number(item.rate ?? 0).toFixed(2),
          Number(item.amount ?? 0).toFixed(2),
        ]));
        return [itemsHeader, ...itemsRows];

      case "Additional Charges":
        const chargesHeader = ["Description", `Amount (${currencySymbol})`];
        const chargesRows = (Array.isArray(parsedAdditionalCharges) ? parsedAdditionalCharges : []).map(charge => ([ // Use parsedAdditionalCharges
          `${String(charge.description)}${charge.valueType === 'percentage' ? ` (${String(charge.value)}%)` : ''}`,
          Number(charge.calculatedAmount ?? 0).toFixed(2),
        ]));
        return [chargesHeader, ...chargesRows];

      case "Totals":
        const totalAdditionalChargesValue = (Array.isArray(parsedAdditionalCharges) ? parsedAdditionalCharges : []).reduce((sum, charge) => sum + (charge.calculatedAmount ?? 0), 0);
        return [
          ["Summary", "Value"],
          ["Subtotal", (orderForm.subtotal || 0).toFixed(2)],
          ["Discount", orderForm.discountAmount ? `-${(orderForm.discountAmount || 0).toFixed(2)}` : '0.00'],
          ["Additional Charges", totalAdditionalChargesValue.toFixed(2)],
          [`Tax (${orderForm.taxRate || 0}%)`, (orderForm.taxAmount || 0).toFixed(2)],
          ["Total", (orderForm.total || 0).toFixed(2)],
        ];

      case "Legal Content":
        const legalRows = [];
        if (orderForm.msaContent) {
          legalRows.push(["Master Service Agreement", stripHtmlTags(orderForm.msaContent)]);
        }
        if (orderForm.termsAndConditions) {
          legalRows.push(["Terms and Conditions", stripHtmlTags(orderForm.termsAndConditions)]);
        }
        if (companyBranding.additionalFooterText) {
          legalRows.push(["Additional Footer Text", stripHtmlTags(companyBranding.additionalFooterText)]);
        }
        return [["Type", "Content"], ...legalRows];

      default:
        return [];
    }
  };

  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();

    const sheetsToGenerate = [
      "Order Form Details",
      "Items and Services",
      "Additional Charges",
      "Totals",
      "Legal Content",
    ];

    sheetsToGenerate.forEach(sheetName => {
      const data = getSheetData(sheetName);
      if (data.length > 0) {
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }
    });

    XLSX.writeFile(wb, `OrderForm_${orderForm.orderFormNumber || 'untitled'}.xlsx`);
  };

  return React.cloneElement(children, { onClick: handleDownloadExcel });
};

export default OrderFormExcel;
