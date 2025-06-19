'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { getCurrencySymbol } from '../lib/currency-utils';

const LOGO_STORAGE_KEY = 'branding_company_logo_data_url';
const COMPANY_INFO_KEYS = {
  NAME: 'branding_company_name',
};
const BASE_URL = 'https://invoicecraft-backend.onrender.com';
//const BASE_URL = 'http://localhost:5000';

function replacePlaceholders(
  content,
  doc,
  customer
) {
  if (!content) return '';
  let processedContent = content;
  const currencySymbol = getCurrencySymbol(customer?.currency || doc.currencyCode);

  const formatIssueDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return format(d, 'PPP');
  };

  const placeholders = {
    '{{customerName}}': () => customer?.name || doc.customerName,
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

export function CoverPageContent({ document: doc, customer, template }) {
  const [yourCompanyName, setYourCompanyName] = React.useState('Your Awesome Company LLC');
  const [brandingCompanyLogoUrl, setBrandingCompanyLogoUrl] = React.useState(null);
  
  // React.useEffect(() => {
  //   const isClient = typeof window !== 'undefined';
  //   if (isClient) {
  //     const name = localStorage.getItem(COMPANY_INFO_KEYS.NAME);
  //     if (name) setYourCompanyName(name);

  //     const storedBrandingLogo = localStorage.getItem(LOGO_STORAGE_KEY);
  //     if (storedBrandingLogo) {
  //       setBrandingCompanyLogoUrl(storedBrandingLogo);
  //     }
  //   }
  // }, []);

  const pageTitle = template?.title ? replacePlaceholders(template.title, doc, customer) : "Service Agreement";
  const preparedFor = customer?.name || doc.customerName || 'Valued Client';

  const formatIssueDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return format(d, 'PPP');
  };
  const dateString = formatIssueDate(doc.issueDate);
const getCompanyLogo = () => {
  if (template?.companyLogoEnabled && template.companyLogoUrl) {
    const url = `${BASE_URL}${template.companyLogoUrl.startsWith('/') ? '' : '/'}${template.companyLogoUrl}`;
    return url;
  }
  if (brandingCompanyLogoUrl) {
    return brandingCompanyLogoUrl;
  }
  return '/images/revynox_logo_black.png';
};

  const getClientLogo = () => {
    // Priority 1: Template's specific logo
    if (template?.clientLogoEnabled && template.clientLogoUrl) {
       const url = `${BASE_URL}${template.clientLogoUrl.startsWith('/') ? '' : '/'}${template.clientLogoUrl}`;
    return url;
    }
    // Priority 2: Default placeholder (if no template or template doesn't have it)
    return 'https://placehold.co/150x50.png'; // Default placeholder
  };
   const getAdditionalimage1 = () => {
    // Priority 1: Template's specific logo
    if (template?.additionalImage1Enabled && template.additionalImage1Url) {
       const url = `${BASE_URL}${template.additionalImage1Url.startsWith('/') ? '' : '/'}${template.additionalImage1Url}`;
    return url;
    }
    // Priority 2: Default placeholder (if no template or template doesn't have it)
    return 'https://placehold.co/150x50.png'; // Default placeholder
  };
   const getAdditionalimage2 = () => {
    // Priority 1: Template's specific logo
    if (template?.additionalImage2Enabled && template.additionalImage2Url) {
       const url = `${BASE_URL}${template.additionalImage2Url.startsWith('/') ? '' : '/'}${template.additionalImage2Url}`;
    return url;
    }
    // Priority 2: Default placeholder (if no template or template doesn't have it)
    return 'https://placehold.co/150x50.png'; // Default placeholder
  };


  const companyLogoToDisplay = getCompanyLogo();
  const clientLogoToDisplay = getClientLogo();

  // --- DEBUGGING LOGS ---
  console.log("CoverPageContent rendered with template:", template);
  console.log("Company Logo Enabled:", template?.companyLogoEnabled);
  console.log("Template Company Logo URL:", template?.companyLogoUrl);
  console.log("Branding Company Logo URL (from localStorage):", brandingCompanyLogoUrl);
  console.log("Final Company Logo to Display:", companyLogoToDisplay);
  console.log("Client Logo Enabled:", template?.clientLogoEnabled);
  console.log("Template Client Logo URL:", template?.clientLogoUrl);
  console.log("Final Client Logo to Display:", clientLogoToDisplay);
  console.log("Additional Image 1 Enabled:", template?.additionalImage1Enabled);
  console.log("Additional Image 1 URL:", template?.additionalImage1Url);
  console.log("Additional Image 2 Enabled:", template?.additionalImage2Enabled);
  console.log("Additional Image 2 URL:", template?.additionalImage2Url);
  // --- END DEBUGGING LOGS ---


  return (
    <div
        className="p-10 bg-card text-foreground font-sans text-sm"
        style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '950px',
            boxSizing: 'border-box',
            textAlign: 'center',
        }}
    >
      {/* Top Section: Company Logo & Additional Image 1 */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        {template?.companyLogoEnabled && companyLogoToDisplay ? ( // Ensure companyLogoToDisplay is not empty
            <img
                src={getCompanyLogo()}
                alt={`${yourCompanyName} Logo`}
                width={200}
                height={60}
                style={{ objectFit: 'contain', maxHeight: '60px', marginBottom: '1rem' }}
                data-ai-hint="company logo"
                onError={(e) => {
                  e.currentTarget.onerror = null; // Prevent looping
                  e.currentTarget.src = 'https://via.placeholder.com/200x60?text=Error+Loading+Logo'; // Fallback
                  console.error("Error loading Company Logo:", companyLogoToDisplay, e);
                }}
            />
        ) : (
          // Optionally show a textual placeholder or nothing if logo is not enabled/available
          template?.companyLogoEnabled && <div className="text-gray-400 text-lg font-semibold">Company Logo Missing/Disabled</div>
        )}
          {template?.additionalImage1Enabled && template.additionalImage1Url ? ( // Ensure URL is not empty
            <img
                src={getAdditionalimage1()}
                alt="Additional Image 1"
                width={300}
                height={150}
                style={{ objectFit: 'contain', maxHeight: '150px', marginTop: '1rem' }}
                data-ai-hint="abstract design"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://via.placeholder.com/300x150?text=Image+1+Error';
                  console.error("Error loading Additional Image 1:", template.additionalImage1Url, e);
                }}
            />
          ) : null}
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
        {template?.additionalImage2Enabled && template.additionalImage2Url ? ( // Ensure URL is not empty
            <img
                src={getAdditionalimage2()}
                alt="Additional Image 2"
                width={300}
                height={150}
                style={{ objectFit: 'contain', maxHeight: '150px', marginBottom: '1rem' }}
                data-ai-hint="corporate building"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://via.placeholder.com/300x150?text=Image+2+Error';
                  console.error("Error loading Additional Image 2:", template.additionalImage2Url, e);
                }}
            />
        ) : null}
        {template?.clientLogoEnabled && clientLogoToDisplay ? ( // Ensure clientLogoToDisplay is not empty
            <img
                src={getClientLogo()}
                alt="Client Logo"
                width={150}
                height={50}
                style={{ objectFit: 'contain', maxHeight: '50px', marginTop: template?.additionalImage2Enabled && template.additionalImage2Url ? '1rem' : '0' }}
                data-ai-hint="client logo"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://via.placeholder.com/150x50?text=Error+Loading+Client+Logo';
                  console.error("Error loading Client Logo:", clientLogoToDisplay, e);
                }}
            />
        ) : (
          // Optionally show a textual placeholder or nothing if client logo is not enabled/available
          template?.clientLogoEnabled && <div className="text-gray-400 text-sm">Client Logo Missing/Disabled</div>
        )}
      </div>
    </div>
  );
}

CoverPageContent.displayName = "CoverPageContent";