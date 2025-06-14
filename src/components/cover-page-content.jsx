'use client';

import * as React from 'react'; // Changed _React to React
// import type { Invoice, OrderForm, Customer, CoverPageTemplate } from '@/types'; // Removed type import
import { format } from 'date-fns';
import { getCurrencySymbol } from '../lib/currency-utils'; // Assuming you have this

const LOGO_STORAGE_KEY = 'branding_company_logo_data_url';
const COMPANY_INFO_KEYS = {
  NAME: 'branding_company_name',
};

function replacePlaceholders(
  content, // Removed type annotation
  doc,     // Removed type annotation
  customer // Removed type annotation
) {
  if (!content) return '';
  let processedContent = content;
  // Removed type cast (doc as Invoice).currencyCode || (doc as OrderForm).currencyCode
  const currencySymbol = getCurrencySymbol(customer?.currency || doc.currencyCode); 

  
  const formatIssueDate = (date) => { // Removed type annotation
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return format(d, 'PPP');
  };

  const placeholders = { // Removed Record<string, () => string | undefined> type annotation
    '{{customerName}}': () => customer?.name || doc.customerName, // Removed (doc as any).customerName
    '{{issueDate}}': () => formatIssueDate(doc.issueDate),
    '{{documentNumber}}': () => 'invoiceNumber' in doc ? doc.invoiceNumber : doc.orderFormNumber,
    '{{totalAmount}}': () => `${currencySymbol}${(doc.total || 0).toFixed(2)}`,
    // Add more placeholders as needed
  };

  for (const placeholder in placeholders) {
    const tag = placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const value = placeholders[placeholder]();
    processedContent = processedContent.replace(new RegExp(tag, 'g'), value || '');
  }
  return processedContent;
}

export function CoverPageContent({ document: doc, customer, template }) { // Removed type annotations
  const [yourCompanyName, setYourCompanyName] = React.useState('Your Awesome Company LLC');
  const [brandingCompanyLogoUrl, setBrandingCompanyLogoUrl] = React.useState(null); // Removed <string | null> type annotation

  React.useEffect(() => {
    const isClient = typeof window !== 'undefined';
    if (isClient) {
      const name = localStorage.getItem(COMPANY_INFO_KEYS.NAME);
      if (name) setYourCompanyName(name);

      const storedBrandingLogo = localStorage.getItem(LOGO_STORAGE_KEY);
      if (storedBrandingLogo) {
        setBrandingCompanyLogoUrl(storedBrandingLogo);
      }
    }
  }, []);

  const pageTitle = template?.title ? replacePlaceholders(template.title, doc, customer) : "Service Agreement";
  const preparedFor = customer?.name || doc.customerName || 'Valued Client'; // Removed (doc as any).customerName
  
  const formatIssueDate = (date) => { // Removed type annotation
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return format(d, 'PPP');
  };
  const dateString = formatIssueDate(doc.issueDate);


  const getCompanyLogo = () => {
    if (template?.companyLogoEnabled && template.companyLogoUrl) return template.companyLogoUrl;
    if (brandingCompanyLogoUrl) return brandingCompanyLogoUrl;
    return '/images/revynox_logo_black.png'; // Default fallback
  };

  const getClientLogo = () => {
    if (template?.clientLogoEnabled && template.clientLogoUrl) return template.clientLogoUrl;
    return 'https://placehold.co/150x50.png'; // Default placeholder
  };

  const companyLogoToDisplay = getCompanyLogo();
  const clientLogoToDisplay = getClientLogo();

  return (
    <div 
        className="p-10 bg-card text-foreground font-sans text-sm"
        style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between', // Use space-between for better vertical distribution
            alignItems: 'center', 
            minHeight: '950px', // A bit less than 1000px to allow for PDF margins
            boxSizing: 'border-box',
            textAlign: 'center',
        }}
    >
      {/* Top Section: Company Logo & Additional Image 1 */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        {template?.companyLogoEnabled && companyLogoToDisplay && (
            <img
                src={companyLogoToDisplay} 
                alt={`${yourCompanyName} Logo`} 
                width={200} 
                height={60} 
                style={{ objectFit: 'contain', maxHeight: '60px', marginBottom: '1rem' }}
                data-ai-hint="company logo"
            />
        )}
          {template?.additionalImage1Enabled && template.additionalImage1Url && (
            <img 
                src={template.additionalImage1Url} 
                alt="Additional Image 1" 
                width={300} 
                height={150} 
                style={{ objectFit: 'contain', maxHeight: '150px', marginTop: '1rem' }}
                data-ai-hint="abstract design"
            />
        )}
      </div>

      {/* Middle Section: Title, Prepared For, Date */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'hsl(var(--primary))', marginBottom: '1.5rem' }}>
          {pageTitle}
        </h1>
        <div style={{ marginBottom: '3rem', fontSize: '1.1rem' }}>
          <p style={{ marginBottom: '0.5rem' }}>Prepared for:</p>
          <p style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>{replacePlaceholders('{{customerName}}', doc, customer)}</p>
        </div>
        <div style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
          <p>Date: {dateString}</p>
        </div>
      </div>
      
      {/* Bottom Section: Client Logo & Additional Image 2 */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
        {template?.additionalImage2Enabled && template.additionalImage2Url && (
            <img
                src={template.additionalImage2Url} 
                alt="Additional Image 2" 
                width={300} 
                height={150} 
                style={{ objectFit: 'contain', maxHeight: '150px', marginBottom: '1rem' }}
                data-ai-hint="corporate building"
            />
        )}
        {template?.clientLogoEnabled && clientLogoToDisplay && (
            <img
                src={clientLogoToDisplay} 
                alt="Client Logo" 
                width={150} 
                height={50} 
                style={{ objectFit: 'contain', maxHeight: '50px', marginTop: template?.additionalImage2Enabled && template.additionalImage2Url ? '1rem' : '0' }} 
                data-ai-hint="client logo" 
            />
        )}
      </div>
    </div>
  );
}

CoverPageContent.displayName = "CoverPageContent";