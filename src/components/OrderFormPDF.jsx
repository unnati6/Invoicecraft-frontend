// components/OrderFormPDF.jsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image, // Import Image for logos/signatures
} from "@react-pdf/renderer";
import { format } from 'date-fns';
import { getCurrencySymbol } from "../lib/currency-utils";// Ensure this path is correct relative to this file

// Register a font if you want something other than the default.
// For simplicity, we'll stick to default for now, but this is how you'd add:
// Font.register({ family: 'Inter', src: 'https://rsms.me/inter/inter.css' }); // Example - needs a direct .ttf or .woff source

// Style definitions for the PDF
const styles = StyleSheet.create({
  page: { 
    padding: 30,
    fontFamily: 'Helvetica', // Default font, can be 'Times-Roman', 'Courier', or custom registered fonts
    fontSize: 10, // Base font size for the document
    color: '#333', // Dark gray text color
  },
  section: { marginBottom: 10 },
  headerSection: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 20 
  },
  companyInfo: { 
    width: '50%',
    paddingRight: 10,
  },
  logo: { 
    maxWidth: 180, 
    maxHeight: 54, 
    marginBottom: 5,
    objectFit: 'contain',
  },
  companyName: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginBottom: 2,
     color: '#008000' // Primary-like color
  },
  addressText: { 
    fontSize: 8, 
    color: '#555', 
    marginBottom: 1 
  },
  docHeader: { 
    width: '50%', 
    textAlign: 'right' 
  },
  docTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 5,
    color: '#008000', // Primary-like color
  },
  docNumber: { 
    fontSize: 10, 
    color: '#555' 
  },
  
  // Customer & Addresses Section
  addressesGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: 20 
  },
  addressColumn: { 
    width: '25%', 
    paddingRight: 8, 
  },
  addressHeading: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    marginBottom: 5, 
    color: '#555' 
  },
  addressTextP: { 
    fontSize: 9, 
    marginBottom: 2, 
    color: '#333' 
  },
  dateStatusColumn: {
    width: '25%',
    textAlign: 'right',
    paddingLeft: 8,
  },
  dateStatusText: { 
    fontSize: 9, 
    marginBottom: 2 
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 9999, // full rounded
    fontSize: 8,
    textAlign: 'center',
    display: 'inline-block', // Crucial for background color to wrap content
    alignSelf: 'flex-end', // Align to right within its container
    marginTop: 5,
  },
  statusDraft: { backgroundColor: '#e0e7ff', color: '#007bff' }, // Example shades
  statusAccepted: { backgroundColor: '#d1fae5', color: '#059669' },
  statusDeclinedExpired: { backgroundColor: '#fee2e2', color: '#ef4444' },
  statusSent: { backgroundColor: '#bfdbfe', color: '#3b82f6' },

  // Service & Payment Overview
  overviewSection: { 
    marginBottom: 15, 
    padding: 10, 
    borderRadius: 4, 
    backgroundColor: '#f8f8f8',
    border: '1px solid #eee'
  },
  overviewHeading: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    marginBottom: 5, 
    color: '#555' 
  },
  overviewGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap' 
  },
  overviewItem: { 
    width: '50%', 
    marginBottom: 3 
  },
  overviewLabel: { 
    fontWeight: 'bold', 
    fontSize: 9 
  },
  overviewValue: { 
    fontSize: 9 
  },

  // Items Table
  tableContainer: { 
    marginBottom: 20, 
    border: '1px solid #ddd', 
    borderRadius: 4, 
    overflow: 'hidden' 
  },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#f2f2f2', 
    borderBottom: '1px solid #ddd', 
    fontWeight: 'bold' 
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottom: '1px solid #eee' 
  },
  tableCell: { 
    padding: 8, 
    fontSize: 9, 
    textAlign: 'left', 
    borderRight: '1px solid #eee', 
    flexGrow: 1 
  },
  tableCellDescription: { 
    width: '40%' 
  },
  tableCellDetails: { 
    width: '20%' 
  },
  tableCellQuantity: { 
    width: '10%', 
    textAlign: 'right' 
  },
  tableCellRateAmount: { 
    width: '15%', 
    textAlign: 'right' 
  },
  // Last cell has no right border
  lastTableCell: { 
    borderRightWidth: 0 
  },

  // Additional Charges Table (simplified)
  chargesTable: { 
    marginBottom: 20, 
    border: '1px solid #ddd', 
    borderRadius: 4, 
    overflow: 'hidden' 
  },
  chargesRow: { 
    flexDirection: 'row', 
    borderBottom: '1px solid #eee' 
  },
  chargesDescription: { 
    flexGrow: 1, 
    padding: 8, 
    fontSize: 9 
  },
  chargesAmount: { 
    width: '30%', 
    textAlign: 'right', 
    padding: 8, 
    fontSize: 9 
  },

  // Totals Section
  totalsContainer: { 
    width: '35%', 
    alignSelf: 'flex-end', 
    border: '1px solid #ddd', 
    padding: 10, 
    borderRadius: 4 
  },
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 5 
  },
  totalLabel: { 
    fontWeight: 'bold', 
    fontSize: 10 
  },
  totalValue: { 
    fontSize: 10 
  },
  grandTotalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 8, 
    paddingTop: 8, 
    borderTop: '1px solid #ddd', 
    fontWeight: 'bold', 
    fontSize: 12 
  },

  // Footer/Signature Section
  footerSection: { 
    marginTop: 40, 
    paddingTop: 20, 
    borderTop: '1px solid #eee', 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  signatureBlock: { 
    width: '48%', 
    textAlign: 'center' 
  },
  signatureImage: { 
    height: 60, 
    width: 180, 
    objectFit: 'contain', 
    marginBottom: 5 
  },
  signatureLine: { 
    borderTop: '1px solid #777', 
    width: '80%', 
    alignSelf: 'center', 
    paddingTop: 5 
  },
  signatoryText: { 
    fontSize: 8, 
    color: '#555' 
  },
  // Basic markdown styles for terms/msa - no HTML support.
  markdownContent: {
    fontSize: 10,
    marginBottom: 15,
    lineHeight: 1.5,
  },
  markdownHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  // Page break hint for print
  pageBreak: {
    marginTop: 30, // Some margin before the break
    marginBottom: 30,
  }
});

// Helper function to render address safely
const renderAddress = (address) => {
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city || address.state || address.zip) {
    let cityStateZip = [];
    if (address.city) cityStateZip.push(address.city);
    if (address.state) cityStateZip.push(address.state);
    if (address.zip) cityStateZip.push(address.zip);
    parts.push(cityStateZip.join(', '));
  }
  if (address.country) parts.push(address.country);
  return parts.length > 0 ? (
    <View>
      {parts.map((part, index) => (
        <Text key={index} style={styles.addressTextP}>{String(part)}</Text>
      ))}
    </View>
  ) : null;
};


// Main OrderForm PDF Component
const OrderFormPDF = ({ orderForm, customer, companyBranding }) => {
  // Defensive check for orderForm
  if (!orderForm) {
    console.error("[OrderFormPDF] Received undefined or null orderForm prop. Cannot render PDF.");
    return null;
  }

  // Parse items and additionalCharges from JSON strings if they exist and are strings
  let parsedItems = [];
  if (typeof orderForm.items === 'string' && orderForm.items.trim() !== '') {
    try {
      parsedItems = JSON.parse(orderForm.items);
    } catch (e) {
      console.error("Failed to parse orderForm.items in PDF component:", e);
    }
  } else if (Array.isArray(orderForm.items)) {
    parsedItems = orderForm.items;
  }

  let parsedAdditionalCharges = [];
  if (typeof orderForm.additionalCharges === 'string' && orderForm.additionalCharges.trim() !== '') {
    try {
      parsedAdditionalCharges = JSON.parse(orderForm.additionalCharges);
    } catch (e) {
      console.error("Failed to parse orderForm.additionalCharges in PDF component:", e);
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

  const totalAdditionalChargesValue = (Array.isArray(orderForm.additionalCharges) ? orderForm.additionalCharges : []).reduce((sum, charge) => sum + (charge.calculatedAmount ?? 0), 0);
  const hasShippingAddress = customerToDisplay.shippingAddress.street || customerToDisplay.shippingAddress.city;

  const paymentTermsText = (orderForm.paymentTerms === 'Custom')
    ? (orderForm.customPaymentTerms?.trim() ? orderForm.customPaymentTerms : 'Custom (Not specified)')
    : orderForm.paymentTerms;

  const commitmentPeriodText = (orderForm.commitmentPeriod === 'Custom')
    ? (orderForm.customCommitmentPeriod?.trim() ? orderForm.customCommitmentPeriod : 'Custom (Not specified)')
    : orderForm.commitmentPeriod;

  const paymentFrequencyText = (orderForm.paymentFrequency === 'Custom')
    ? (orderForm.customPaymentFrequency?.trim() ? orderForm.customPaymentFrequency : 'Custom (Not specified)')
    : orderForm.paymentFrequency;

  // Function to strip HTML tags from content for PDF (React-PDF doesn't render HTML directly)
  const stripHtmlTags = (htmlString) => {
    if (typeof htmlString !== 'string') return '';
    return htmlString.replace(/<[^>]*>?/gm, ''); // Simple regex to remove HTML tags
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Info and Document Header */}
        <View style={styles.headerSection}>
          <View style={styles.companyInfo}>
            {companyBranding.logoUrl ? (
              <Image src={companyBranding.logoUrl} style={styles.logo} />
            ) : (
              <View style={[styles.logo, { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 8, color: '#999' }}>Your Logo</Text>
              </View>
            )}
            <Text style={styles.companyName}>{companyBranding.name}</Text>
            <Text style={styles.addressText}>{companyBranding.street}</Text>
            { (companyBranding.city || companyBranding.state || companyBranding.zip) && (
              <Text style={styles.addressText}>
                {companyBranding.city}{companyBranding.city && companyBranding.state ? ', ' : ''}
                {companyBranding.state}{companyBranding.state && companyBranding.zip ? ' ' : ''}
                {companyBranding.zip}
              </Text>
            )}
            {companyBranding.country && <Text style={styles.addressText}>{companyBranding.country}</Text>}
            <Text style={styles.addressText}>Email: {companyBranding.email}</Text>
            <Text style={styles.addressText}>Phone: {companyBranding.phone}</Text>
            {companyBranding.website && <Text style={styles.addressText}>Website: {companyBranding.website}</Text>}
            {companyBranding.taxId && <Text style={styles.addressText}>Tax ID: {companyBranding.taxId}</Text>}
          </View>
          <View style={styles.docHeader}>
            <Text style={styles.docTitle}>ORDER FORM</Text>
            <Text style={styles.docNumber}>Order Form no: {orderForm.orderFormNumber}</Text>
          </View>
        </View>

        {/* Customer, Billing, Shipping & Dates/Status */}
        <View style={styles.addressesGrid}>
          <View style={styles.addressColumn}>
            <Text style={styles.addressHeading}>ORDER FORM FOR:</Text>
            <Text style={styles.addressTextP}>{customerToDisplay.name}</Text>
            <Text style={styles.addressTextP}>{customerToDisplay.email}</Text>
            <Text style={styles.addressTextP}>{customerToDisplay.phone}</Text>
            <Text style={styles.addressTextP}>{customerToDisplay.company.name}</Text>
            {renderAddress(customerToDisplay.company)}
          </View>
          <View style={styles.addressColumn}>
            <Text style={styles.addressHeading}>BILL TO:</Text>
            {renderAddress(customerToDisplay.billingAddress)}
          </View>
          {hasShippingAddress && (
            <View style={styles.addressColumn}>
              <Text style={styles.addressHeading}>SHIP TO:</Text>
              {renderAddress(customerToDisplay.shippingAddress)}
            </View>
          )}
          <View style={styles.dateStatusColumn}>
            <Text style={styles.dateStatusText}><Text style={{ fontWeight: 'bold' }}>Issue Date:</Text> {orderForm.issueDate ? format(new Date(orderForm.issueDate), 'PPP') : 'N/A'}</Text>
            <Text style={styles.dateStatusText}><Text style={{ fontWeight: 'bold' }}>Valid Until:</Text> {orderForm.validUntilDate ? format(new Date(orderForm.validUntilDate), 'PPP') : 'N/A'}</Text>
            <Text style={styles.dateStatusText}><Text style={{ fontWeight: 'bold' }}>Currency:</Text> {customerToDisplay.currency}</Text>
            {orderForm.purchaseOrderNumber && <Text style={styles.dateStatusText}><Text style={{ fontWeight: 'bold' }}>PO Number:</Text> {orderForm.purchaseOrderNumber}</Text>}
            <View style={[styles.statusBadge, 
              orderForm.status === 'Accepted' ? styles.statusAccepted : 
              (orderForm.status === 'Declined' || orderForm.status === 'Expired' ? styles.statusDeclinedExpired : styles.statusDraft)
            ]}>
              <Text style={{ fontSize: 8 }}>{orderForm.status}</Text>
            </View>
          </View>
        </View>

        {/* Service & Payment Overview */}
        {(paymentTermsText || commitmentPeriodText || paymentFrequencyText || orderForm.serviceStartDate || orderForm.serviceEndDate || orderForm.notes) && (
          <View style={styles.overviewSection}>
            <Text style={styles.overviewHeading}>Service & Payment Overview</Text>
            <View style={styles.overviewGrid}>
              {paymentTermsText && paymentTermsText !== "N/A" && <Text style={styles.overviewItem}><Text style={styles.overviewLabel}>Payment Terms:</Text> {paymentTermsText}</Text>}
              {commitmentPeriodText && commitmentPeriodText !== "N/A" && <Text style={styles.overviewItem}><Text style={styles.overviewLabel}>Commitment Period:</Text> {commitmentPeriodText}</Text>}
              {paymentFrequencyText && paymentFrequencyText !== "N/A" && <Text style={styles.overviewItem}><Text style={styles.overviewLabel}>Payment Frequency:</Text> {paymentFrequencyText}</Text>}
              {orderForm.serviceStartDate && <Text style={styles.overviewItem}><Text style={styles.overviewLabel}>Service Start:</Text> {format(new Date(orderForm.serviceStartDate), 'PPP')}</Text>}
              {orderForm.serviceEndDate && <Text style={styles.overviewItem}><Text style={styles.overviewLabel}>Service End:</Text> {format(new Date(orderForm.serviceEndDate), 'PPP')}</Text>}
              {orderForm.notes && <Text style={[styles.overviewItem, { width: '100%' }]}><Text style={styles.overviewLabel}>Notes:</Text> {orderForm.notes}</Text>}
            </View>
          </View>
        )}

     
        {/* Order Form Items Table */}
        {(Array.isArray(parsedItems) && parsedItems.length > 0) && ( // Use parsedItems here
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableCellDescription]}>Description</Text>
              <Text style={[styles.tableCell, styles.tableCellDetails]}>Details</Text>
              <Text style={[styles.tableCell, styles.tableCellQuantity]}>Qty</Text>
              <Text style={[styles.tableCell, styles.tableCellRateAmount]}>Rate ({currencySymbol})</Text>
              <Text style={[styles.tableCell, styles.tableCellRateAmount, styles.lastTableCell]}>Amount ({currencySymbol})</Text>
            </View>
            {parsedItems.map((item, index) => ( // Use parsedItems here
              <View key={item.id || index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableCellDescription]}>{String(item.description)}</Text>
                <Text style={[styles.tableCell, styles.tableCellDetails, { fontSize: 8, color: '#777' }]}>{String(item.details || 'N/A')}</Text>
                <Text style={[styles.tableCell, styles.tableCellQuantity]}>{String(item.quantity)}</Text>
                <Text style={[styles.tableCell, styles.tableCellRateAmount]}>{(item.rate ?? 0).toFixed(2)}</Text>
                <Text style={[styles.tableCell, styles.tableCellRateAmount, styles.lastTableCell]}>{(item.amount ?? 0).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Additional Charges Table */}
        {(Array.isArray(parsedAdditionalCharges) && parsedAdditionalCharges.length > 0) && ( // Use parsedAdditionalCharges here
          <View style={styles.chargesTable}>
            <View style={[styles.tableHeader, { backgroundColor: '#f9f9f9' }]}>
              <Text style={[styles.chargesDescription, { fontWeight: 'bold' }]}>Additional Charges</Text>
              <Text style={[styles.chargesAmount, { fontWeight: 'bold' }]}>Amount ({currencySymbol})</Text>
            </View>
            {parsedAdditionalCharges.map((charge, index) => ( // Use parsedAdditionalCharges here
              <View key={charge.id || index} style={styles.chargesRow}>
                <Text style={styles.chargesDescription}>
                  {String(charge.description)}
                  {charge.valueType === 'percentage' && ` (${String(charge.value)}%)`}
                </Text>
                <Text style={styles.chargesAmount}>{currencySymbol}{(charge.calculatedAmount ?? 0).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}


        {/* Totals Section */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{currencySymbol}{(orderForm.subtotal || 0).toFixed(2)}</Text>
          </View>
          {orderForm.discountType && orderForm.discountValue !== undefined && orderForm.discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount ({orderForm.discountType === 'percentage' ? `${String(orderForm.discountValue)}%` : currencySymbol}):</Text>
              <Text style={styles.totalValue}>-{currencySymbol}{(orderForm.discountAmount || 0).toFixed(2)}</Text>
            </View>
          )}
          {totalAdditionalChargesValue > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Additional Charges:</Text>
              <Text style={styles.totalValue}>{currencySymbol}{(totalAdditionalChargesValue).toFixed(2)}</Text>
            </View>
          )}
          {orderForm.taxRate !== undefined && orderForm.taxRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({String(orderForm.taxRate)}%):</Text>
              <Text style={styles.totalValue}>{currencySymbol}{(orderForm.taxAmount || 0).toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text>Total:</Text>
            <Text>{currencySymbol}{(orderForm.total || 0).toFixed(2)}</Text>
          </View>
        </View>

        {/* Additional Information / Footer Details */}
        {(orderForm.internalNotes || companyBranding.additionalFooterText) && (
          <View style={styles.overviewSection}> {/* Reusing overviewSection style for similar appearance */}
            <Text style={styles.overviewHeading}>Additional Information</Text>
            {orderForm.internalNotes && <Text style={styles.addressTextP}><Text style={styles.overviewLabel}>Internal Notes:</Text> {String(orderForm.internalNotes)}</Text>}
            {companyBranding.additionalFooterText && (
              <Text style={styles.addressTextP}>
                {/* React-PDF does not render HTML/Markdown directly, so strip tags */}
                <Text style={styles.overviewLabel}>Footer Text:</Text> {stripHtmlTags(companyBranding.additionalFooterText)}
              </Text>
            )}
          </View>
        )}
      
        {/* Page break hint - useful if MSA/Terms content follows or for multi-page documents */}
        {(orderForm.msaContent || orderForm.termsAndConditions) && <View style={styles.pageBreak} break />}
        
        {/* MSA Content (stripped of HTML for PDF rendering) */}
        {orderForm.msaContent && (
          <View style={styles.section}>
            <Text style={styles.markdownHeading}>Master Service Agreement</Text>
            <Text style={styles.markdownContent}>{stripHtmlTags(orderForm.msaContent)}</Text>
          </View>
        )}

        {/* Terms and Conditions (stripped of HTML for PDF rendering) */}
        {orderForm.termsAndConditions && (
          <View style={styles.section}>
            <Text style={styles.markdownHeading}>Terms and Conditions</Text>
            <Text style={styles.markdownContent}>{stripHtmlTags(orderForm.termsAndConditions)}</Text>
          </View>
        )}

        {/* Final Signatures */}
        <View style={styles.footerSection} break> {/* break added to ensure signatures are on a new page if previous content is long */}
          <View style={styles.signatureBlock}>
            <Text style={styles.overviewLabel}>For {companyBranding.name}:</Text>
            {companyBranding.signatureUrl ? (
              <Image src={companyBranding.signatureUrl} style={styles.signatureImage} />
            ) : (
              <View style={[styles.signatureImage, { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 8, color: '#999' }}>Signature Area</Text>
              </View>
            )}
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatoryText}>Authorized Signature</Text>
            {companyBranding.authorisedSignatoryName && <Text style={styles.signatoryText}>{companyBranding.authorisedSignatoryName}</Text>}
            {companyBranding.authorisedSignatoryTitle && <Text style={styles.signatoryText}>{companyBranding.authorisedSignatoryTitle}</Text>}
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.overviewLabel}>For Customer:</Text>
            <View style={[styles.signatureImage, { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ fontSize: 8, color: '#999' }}>Customer Signature Area</Text>
            </View>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatoryText}>Client Signature</Text>
            {customerToDisplay.contactPerson && <Text style={styles.signatoryText}>{customerToDisplay.contactPerson}</Text>}
            {customerToDisplay.contactTitle && <Text style={styles.signatoryText}>{customerToDisplay.contactTitle}</Text>}
          </View>
        </View>

      </Page>
    </Document>
  );
};

export default OrderFormPDF;
