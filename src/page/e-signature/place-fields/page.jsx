'use client';

import * as React from 'react';
import { useParams, useRouter } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/layout/app-header';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useToast } from '../../../hooks/use-toast';
import { Signature, CalendarDays, User, Mail, Building, Briefcase, Send, ListChecks, XCircle } from 'lucide-react';
// import type { Invoice, OrderForm, Customer, CoverPageTemplate as CoverPageTemplateType, ESignatureRecipient, ESignatureProcess, PlacedField } from '@/types'; // TypeScript types removed
// import { fetchInvoiceById, fetchOrderFormById, fetchCustomerById, fetchCoverPageTemplateById } from '@/lib/actions'; // Actions removed
import { Skeleton } from '../../../components/ui/skeleton';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { InvoicePreviewContent } from '../../../components/invoice-preview-content';
import { OrderFormPreviewContent } from '../../../components/orderform-preview-content';
import { cn } from '../../../lib/utils';
import axiosInstance from '../../../lib/axiosInstance';

// PlacedField, ESignatureRecipient, ESignatureProcess प्रकारों को सीधे यहाँ परिभाषित करें (JSDoc के माध्यम से)
/**
 * @typedef {'SIGNER' | 'CC'} ESignatureRecipientRole
 */

/**
 * @typedef {Object} ESignatureRecipient
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {ESignatureRecipientRole} role
 * @property {number} [signingOrder]
 * @property {string} [color]
 * @property {string} [status]
 */

/**
 * @typedef {Object} PlacedField
 * @property {string} id
 * @property {string} type
 * @property {string} fieldTypeName
 * @property {string} recipientId
 * @property {string} recipientName
 * @property {string} recipientColor
 * @property {number} pageNumber
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {Object} ESignatureProcess
 * @property {string} documentId
 * @property {'invoice' | 'orderform'} documentType
 * @property {ESignatureRecipient[]} recipients
 * @property {string} emailSubject
 * @property {string} emailMessage
 * @property {string} status
 * @property {string} [sentAt]
 */

/**
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} invoiceNumber
 * @property {string} customerId
 * @property {string} [msaContent]
 * @property {string} [msaCoverPageTemplateId]
 * // Add other invoice properties as needed
 */

/**
 * @typedef {Object} OrderForm
 * @property {string} id
 * @property {string} orderFormNumber
 * @property {string} customerId
 * @property {string} [msaContent]
 * @property {string} [msaCoverPageTemplateId]
 * // Add other order form properties as needed
 */

/**
 * @typedef {Object} Customer
 * @property {string} id
 * @property {string} name
 * // Add other customer properties as needed
 */

/**
 * @typedef {Object} CoverPageTemplate
 * @property {string} id
 * @property {string} name
 * // Add other cover page template properties as needed
 */


const APPROX_NEW_FIELD_WIDTH = 150;
const APPROX_NEW_FIELD_HEIGHT = 50;

const fieldTypes = [
  { id: 'signature', name: 'Signature', icon: Signature },
  { id: 'dateSigned', name: 'Date Signed', icon: CalendarDays },
  { id: 'fullName', name: 'Full Name', icon: User },
  { id: 'email', name: 'Email Address', icon: Mail },
  { id: 'company', name: 'Company', icon: Building },
  { id: 'title', name: 'Title', icon: Briefcase },
];

const recipientColors = [ // Same as on configure page for consistency if data were passed
  'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300',
  'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
  'bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300',
  'bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300',
];

const PlacedFieldComponent = ({ field, onRemove, onDragStart, sidebarSelectedRecipientColor }) => { // React.FC type removed
  const initials = field.recipientName.split(' ').map(n => n[0]).join('').toUpperCase();
  const [isHovering, setIsHovering] = React.useState(false);

  const currentDisplayColor = isHovering && sidebarSelectedRecipientColor ? sidebarSelectedRecipientColor : field.recipientColor;
  const FieldIcon = fieldTypes.find(ft => ft.id === field.type)?.icon || Signature;

  return (
    <div
      id={field.id}
      draggable={true}
      onDragStart={(e) => onDragStart(e, field.id)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        position: 'absolute',
        left: `${field.x}px`,
        top: `${field.y}px`,
        zIndex: 10,
        cursor: 'grab',
      }}
      className={cn(
        "p-2 text-sm rounded shadow-md flex items-center gap-1.5",
        "min-w-[150px] min-h-[50px]",
        currentDisplayColor
      )}
      title={`${field.fieldTypeName} for ${field.recipientName} (Page ${field.pageNumber})`}
    >
      <FieldIcon className="h-5 w-5" />
      <span className="font-semibold">{initials}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(field.id); }}
        className="ml-auto text-xs leading-none hover:text-destructive-foreground"
        aria-label="Remove field"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
};

export default function PlaceSignatureFieldsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const documentType = params.documentType; // as 'invoice' | 'orderform' removed
  const documentId = params.documentId; // as string removed

  const [documentData, setDocumentData] = React.useState(null); // Invoice | OrderForm | null removed
  const [customerData, setCustomerData] = React.useState(undefined); // Customer | undefined removed
  const [coverPageTemplateData, setCoverPageTemplateData] = React.useState(undefined); // CoverPageTemplateType | undefined removed
  const [isLoadingDocument, setIsLoadingDocument] = React.useState(true);

  const [eSignatureProcess, setESignatureProcess] = React.useState(null); // ESignatureProcess | null removed
  const [availableRecipients, setAvailableRecipients] = React.useState([]); // ESignatureRecipient[] removed
  const [selectedRecipientId, setSelectedRecipientId] = React.useState(''); // string removed

  const [placedFields, setPlacedFields] = React.useState([]); // PlacedField[] removed
  const documentPreviewRef = React.useRef(null); // HTMLDivElement removed

  React.useEffect(() => {
    async function loadData() {
      setIsLoadingDocument(true);
      setDocumentData(null); setCustomerData(undefined); setCoverPageTemplateData(undefined);
      setESignatureProcess(null); setAvailableRecipients([]); setSelectedRecipientId('');

      const storageKey = `eSignatureProcess_${documentType}_${documentId}`;
      const eSignatureDataString = localStorage.getItem(storageKey);
      console.log(`[PlaceFieldsPage DEBUG] Attempting to load from localStorage. Key: ${storageKey}, Found string:`, eSignatureDataString ? eSignatureDataString.substring(0,100) + "..." : "null");

      let loadedRecipients = []; // ESignatureRecipient[] removed

      if (eSignatureDataString) {
        try {
          const processData = JSON.parse(eSignatureDataString); // ESignatureProcess removed
          console.log("[PlaceFieldsPage DEBUG] Successfully parsed eSignatureProcess data:", processData);
          setESignatureProcess(processData);
          loadedRecipients = processData.recipients
            .filter(r => r.role === 'SIGNER')
            .map((r, index) => ({ ...r, color: r.color || recipientColors[index % recipientColors.length] })); // Ensure color
          setAvailableRecipients(loadedRecipients);
          if (loadedRecipients.length > 0) {
            setSelectedRecipientId(loadedRecipients[0].id);
          }
        } catch (e) {
          console.error("[PlaceFieldsPage DEBUG] Error parsing eSignatureProcess data from localStorage", e);
          toast({ title: "Error", description: "Could not load e-signature configuration. Data might be corrupt.", variant: "destructive" });
          setESignatureProcess(null);
        }
      } else {
        toast({ title: "Configuration Missing", description: "E-signature configuration not found. Please ensure recipients were added on the previous page.", variant: "destructive" });
        setESignatureProcess(null);
      }

      // Get authentication token (assuming it's stored in localStorage or context)
      const authToken = localStorage.getItem('authToken'); // Adjust this based on how you store your token

      if (!authToken) {
        toast({ title: "Authentication Error", description: "No authentication token found. Please log in.", variant: "destructive" });
        setIsLoadingDocument(false);
        return;
      }

      try {
        let doc = null; // Invoice | OrderForm | undefined | null removed
        let customer = undefined; // Customer | undefined removed
        let coverPageTemplate = undefined; // CoverPageTemplateType | undefined removed

        if (documentType === 'invoice' && documentId) {
          const response = await axiosInstance.get(`/api/invoices/${documentId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          doc = response.data;
        } else if (documentType === 'orderform' && documentId) {
          const response = await axiosInstance.get(`/api/order-forms/${documentId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          doc = response.data;
        }

        if (doc) {
          console.log("[PlaceFieldsPage DEBUG] Successfully fetched document:", doc);
          setDocumentData(doc);

          if (doc.customerId) {
            const customerResponse = await axiosInstance.get(`/api/customers/${doc.customerId}`, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });
            customer = customerResponse.data;
            setCustomerData(customer);
          }

          if (doc.msaContent && doc.msaCoverPageTemplateId) {
            const coverPageResponse = await axiosInstance.get(`/api/cover-page-templates/${doc.msaCoverPageTemplateId}`, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });
            coverPageTemplate = coverPageResponse.data;
            setCoverPageTemplateData(coverPageTemplate);
          }
        } else {
          console.error("[PlaceFieldsPage DEBUG] Document not found after fetch.");
          toast({ title: "Error", description: "Could not load document details.", variant: "destructive" });
        }
      } catch (error) {
        console.error("[PlaceFieldsPage DEBUG] Error fetching document information:", error);
        toast({ title: "Error", description: "Failed to fetch document information.", variant: "destructive" });
      } finally {
        setIsLoadingDocument(false);
      }
    }
    if (documentType && documentId) {
        console.log(`[PlaceFieldsPage DEBUG] Initializing. Document Type: ${documentType}, Document ID: ${documentId}`);
        loadData();
    }
  }, [documentType, documentId, toast]);

  const updateFieldPosition = (fieldId, newX, newY) => { // fieldId: string, newX: number, newY: number removed
    console.log(`[DragDropDebug] updateFieldPosition called for ${fieldId} to x: ${newX}, y: ${newY}`);
    setPlacedFields(prevFields =>
      prevFields.map(f => (f.id === fieldId ? { ...f, x: newX, y: newY } : f))
    );
  };

  const handlePaletteDragStart = (e, fieldTypeId) => { // e: React.DragEvent<HTMLDivElement>, fieldTypeId: string removed
    console.log(`[DragDropDebug] handlePaletteDragStart: Dragging from palette, fieldTypeId: ${fieldTypeId}`);
    const data = JSON.stringify({ fieldTypeId });
    e.dataTransfer.setData('application/json', data);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleFieldDragStart = (e, fieldId) => { // e: React.DragEvent<HTMLDivElement>, fieldId: string removed
    console.log(`[DragDropDebug] handleFieldDragStart: Dragging existing field ${fieldId}`);
    e.dataTransfer.setData('text/plain', fieldId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => { // e: React.DragEvent<HTMLDivElement> removed
    e.preventDefault();
    if (e.dataTransfer.types.includes('application/json')) {
        e.dataTransfer.dropEffect = "copy";
    } else if (e.dataTransfer.types.includes('text/plain')) {
        e.dataTransfer.dropEffect = "move";
    }
    // console.log("[DragDropDebug] handleDragOver firing. Drop Effect:", e.dataTransfer.dropEffect);
  };

  const handleDrop = (e) => { // e: React.DragEvent<HTMLDivElement> removed
    e.preventDefault();
    if (!documentPreviewRef.current) return;
    const targetRect = documentPreviewRef.current.getBoundingClientRect();
    let x = e.clientX - targetRect.left + documentPreviewRef.current.scrollLeft;
    let y = e.clientY - targetRect.top + documentPreviewRef.current.scrollTop;
    console.log(`[DragDropDebug] handleDrop: clientX=${e.clientX}, clientY=${e.clientY}, targetRectLeft=${targetRect.left}, targetRectTop=${targetRect.top}, scrollLeft=${documentPreviewRef.current.scrollLeft}, scrollTop=${documentPreviewRef.current.scrollTop}`);
    console.log(`[DragDropDebug] handleDrop: Initial coords x: ${x}, y: ${y}`);


    const paletteDataString = e.dataTransfer.getData('application/json');
    const existingFieldId = e.dataTransfer.getData('text/plain');
    console.log(`[DragDropDebug] handleDrop: paletteDataString='${paletteDataString}', existingFieldId='${existingFieldId}'`);

    if (paletteDataString) {
        console.log("[DragDropDebug] handleDrop: Processing new field from palette.");
      try {
        const paletteData = JSON.parse(paletteDataString);
        const fieldTypeId = paletteData.fieldTypeId;
        const recipient = availableRecipients.find(r => r.id === selectedRecipientId);
        if (!recipient) {
          toast({ title: "No Recipient", description: "Please select a recipient signer before placing a field.", variant: "destructive" });
          return;
        }
        if (recipient.role !== 'SIGNER') {
              toast({ title: "Invalid Recipient", description: "Fields can only be assigned to Signers.", variant: "destructive" });
              return;
        }
        const fieldTypeName = fieldTypes.find(ft => ft.id === fieldTypeId)?.name || fieldTypeId;

        const fieldWidth = APPROX_NEW_FIELD_WIDTH;
        const fieldHeight = APPROX_NEW_FIELD_HEIGHT;

        const finalX = Math.max(0, Math.min(x - (fieldWidth / 2) , documentPreviewRef.current.scrollWidth - fieldWidth));
        const finalY = Math.max(0, Math.min(y - (fieldHeight / 2), documentPreviewRef.current.scrollHeight - fieldHeight));
        console.log(`[DragDropDebug] handleDrop (New Field): finalX=${finalX}, finalY=${finalY}`);

        const newField = { // PlacedField removed
          id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          type: fieldTypeId, fieldTypeName: fieldTypeName, recipientId: recipient.id,
          recipientName: recipient.name, recipientColor: recipient.color || 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300', pageNumber: 1,
          x: finalX, y: finalY, width: fieldWidth, height: fieldHeight,
        };
        setPlacedFields(prev => [...prev, newField]);
        toast({
          title: "Field Added",
          description: `${fieldTypeName} field added for ${recipient.name}. You can drag it to reposition.`,
          duration: 4000,
        });
      } catch (error) {
        console.error("[DragDropDebug] Error processing new field drop:", error);
        toast({ title: "Error", description: "Could not place field from palette.", variant: "destructive"});
      }
    } else if (existingFieldId && existingFieldId.startsWith('field_')) {
        console.log(`[DragDropDebug] handleDrop: Processing move for existing field ${existingFieldId}`);
        const fieldElement = document.getElementById(existingFieldId);
        let fieldWidth = APPROX_NEW_FIELD_WIDTH;
        let fieldHeight = APPROX_NEW_FIELD_HEIGHT;
        if (fieldElement) { fieldWidth = fieldElement.offsetWidth; fieldHeight = fieldElement.offsetHeight; console.log(`[DragDropDebug] handleDrop (Existing Field): Found fieldElement with offsetWidth=${fieldWidth}, offsetHeight=${fieldHeight}`); }
        else { console.warn(`[DragDropDebug] handleDrop (Existing Field): Could not find fieldElement by ID ${existingFieldId}`); }


        const finalX = Math.max(0, Math.min(x - (fieldWidth / 2), documentPreviewRef.current.scrollWidth - fieldWidth));
        const finalY = Math.max(0, Math.min(y - (fieldHeight / 2), documentPreviewRef.current.scrollHeight - fieldHeight));
        console.log(`[DragDropDebug] handleDrop (Existing Field): finalX=${finalX}, finalY=${finalY}`);
        updateFieldPosition(existingFieldId, finalX, finalY);
    } else {
        console.log("[DragDropDebug] handleDrop: No valid data found in dataTransfer for palette or existing field.");
    }
  };

  const handleRemoveField = (fieldId) => { // fieldId: string removed
    setPlacedFields(prev => prev.filter(f => f.id !== fieldId));
  };

  const handleSendForSignature = () => {
    if (placedFields.length === 0) {
      toast({ title: "No Fields Placed", description: "Please add at least one signature field for a signer.", variant: "destructive" });
      return;
    }
    const hasSignerField = placedFields.some(pf => availableRecipients.find(r => r.id === pf.recipientId)?.role === 'SIGNER' && (pf.type === 'signature' || pf.type === 'dateSigned'));
    if (!hasSignerField) {
      toast({ title: "No Signature Fields", description: "Please add at least one 'Signature' or 'Date Signed' field for a signer.", variant: "destructive" });
      return;
    }

    const storageKey = `eSignatureProcess_${documentType}_${documentId}`;
    const currentProcessDataString = localStorage.getItem(storageKey);
    if (currentProcessDataString && eSignatureProcess) {
      const updatedProcessData = { // ESignatureProcess removed
        ...eSignatureProcess,
        status: 'SentForSignature',
        sentAt: new Date().toISOString(),
        recipients: eSignatureProcess.recipients.map(r => ({...r, status: 'Pending'})),
      };
      localStorage.setItem(storageKey, JSON.stringify(updatedProcessData));
      toast({ title: "Document Sent (Simulated)", description: "Recipients would now receive an email to sign.", variant: "warning", duration: 5000 });
      router.push(documentType === 'invoice' ? `/invoices/${documentId}` : `/orderforms/${documentId}`);
    } else {
      toast({ title: "Error", description: "Could not find e-signature process data to finalize.", variant: "destructive"});
    }
  };

  const pageTitle = isLoadingDocument ? "Loading Document..." : documentData ? `Place Fields: ${'invoiceNumber' in documentData ? documentData.invoiceNumber : documentData.orderFormNumber}` : "Place Signature Fields";
  const currentSelectedRecipientColor = availableRecipients.find(r => r.id === selectedRecipientId)?.color;

  if (isLoadingDocument) {
    return (
      <>
        <AppHeader title="Loading Document..." showBackButton />
        <main className="flex flex-1 flex-col p-4 md:p-6">
          <div className="grid flex-1 grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-muted/30 rounded-lg border flex items-center justify-center overflow-hidden min-h-[calc(100vh-12rem)]"><Skeleton className="w-[600px] h-[825px]"/></div>
            <div className="lg:col-span-1"><Skeleton className="w-full h-[70vh]" /></div>
          </div>
        </main>
      </>
    );
  }

  if (!documentData && !eSignatureProcess) {
    return (
      <>
        <AppHeader title="Error Loading Data" showBackButton />
        <main className="flex-1 p-4 md:p-6"><Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p>Could not load either the document details or the e-signature configuration. Please ensure recipients were configured on the previous step and try again.</p></CardContent></Card></main>
      </>
    );
  }
  if (!documentData) {
      return (
        <>
            <AppHeader title="Error Loading Document" showBackButton />
            <main className="flex-1 p-4 md:p-6"><Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p>Could not load the document details. The document might not exist or the ID is incorrect.</p></CardContent></Card></main>
        </>
    );
  }
   if (!eSignatureProcess) {
      return (
        <>
            <AppHeader title="E-Signature Configuration Missing" showBackButton />
            <main className="flex-1 p-4 md:p-6"><Card><CardHeader><CardTitle>Configuration Error</CardTitle></CardHeader><CardContent><p>The e-signature configuration for this document was not found. Please go back and ensure recipients and message details are set up on the 'Configure Signature Request' page.</p></CardContent></Card></main>
        </>
    );
  }


  return (
    <>
      <AppHeader title={pageTitle} showBackButton />
      <main className="flex flex-1 flex-col p-4 md:p-6">
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-muted/30 rounded-lg border flex items-center justify-center overflow-hidden min-h-[calc(100vh-12rem)]">
            <ScrollArea className="w-full h-full max-w-[800px] max-h-[calc(100vh-14rem)] bg-white shadow-lg">
              <div
                ref={documentPreviewRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative min-h-[1056px]"
              >
                {placedFields.map(field => (
                  <PlacedFieldComponent
                    key={field.id}
                    field={field}
                    onRemove={handleRemoveField}
                    onDragStart={handleFieldDragStart}
                    sidebarSelectedRecipientColor={currentSelectedRecipientColor}
                  />
                ))}
                {documentType === 'invoice' && documentData ? (
                  <InvoicePreviewContent document={documentData} customer={customerData} coverPageTemplate={coverPageTemplateData} />
                ) : documentType === 'orderform' && documentData ? (
                  <OrderFormPreviewContent document={documentData} customer={customerData} coverPageTemplate={coverPageTemplateData} />
                ) : (
                  <p>Error: Document type not supported or data missing.</p>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Assign Fields</CardTitle>
                <CardDescription>
                  Select a recipient signer, then drag a field type from the palette below onto the document preview on the left.
                  Click and drag already placed fields to move them.
                  <strong className="block mt-1 text-destructive">Note: Interactive resizing of placed fields is NOT implemented in this prototype.</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[calc(100vh-22rem)] overflow-y-auto pr-2">
                <div className="space-y-1">
                  <label htmlFor="recipient" className="text-sm font-medium">Recipient (Signer)</label>
                  <Select value={selectedRecipientId} onValueChange={setSelectedRecipientId} disabled={availableRecipients.length === 0}>
                    <SelectTrigger id="recipient"><SelectValue placeholder={availableRecipients.length > 0 ? "Select recipient signer" : "No signers configured"} /></SelectTrigger>
                    <SelectContent>
                      {availableRecipients.map(r => (
                        <SelectItem key={r.id} value={r.id}>
                           <span className={cn("inline-block w-2.5 h-2.5 rounded-full mr-2", r.color?.split(' ')[0].replace('text-','bg-') )}></span>
                           {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 border-t pt-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Field Palette (Drag from here)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {fieldTypes.map(field => (
                      <div
                        key={field.id}
                        className="flex flex-col h-auto p-3 items-center justify-center space-y-1 text-xs cursor-grab border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground"
                        draggable={true}
                        onDragStart={(e) => handlePaletteDragStart(e, field.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { /* Placeholder */ } }}
                      >
                        <field.icon className="h-5 w-5 mb-1 text-primary" />
                        <span>{field.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {placedFields.length > 0 && (
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center"><ListChecks className="mr-2 h-4 w-4"/> Placed Fields ({placedFields.length})</h4>
                    <ScrollArea className="h-32">
                      <ul className="space-y-1 text-xs pl-2">
                        {placedFields.map(pf => (
                          <li key={pf.id} className={cn("flex items-center justify-between p-1.5 rounded", pf.recipientColor)}>
                            <span>{pf.fieldTypeName} for {pf.recipientName} (P{pf.pageNumber})</span>
                            <button onClick={() => handleRemoveField(pf.id)} className="hover:text-destructive" title="Remove"><XCircle className="h-3.5 w-3.5"/></button>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSendForSignature}
                  className="w-full"
                  disabled={placedFields.length === 0 || !placedFields.some(pf => availableRecipients.find(r => r.id === pf.recipientId)?.role === 'SIGNER' && (pf.type === 'signature' || pf.type === 'dateSigned')) || !selectedRecipientId }
                >
                  <Send className="mr-2 h-4 w-4" /> Send for Signature (Simulated)
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}