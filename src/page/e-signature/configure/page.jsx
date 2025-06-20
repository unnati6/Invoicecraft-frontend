'use client';

import * as React from 'react';
import { useParams , useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/layout/app-header';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useToast } from '../../../hooks/use-toast';
import { PlusCircle, Trash2, Users, Mail, FilePenLine, ArrowRight } from 'lucide-react';
// import type { Invoice, OrderForm, Customer, ESignatureRecipient, ESignatureRecipientRole, ESignatureProcess } from '@/types'; // TypeScript types removed
// import { fetchInvoiceById, fetchOrderFormById, fetchCustomerById } from '@/lib/actions'; // Actions removed
import { Skeleton } from '../../../components/ui/skeleton';
import { cn } from '../../../lib/utils';
import axiosInstance from '../../../lib/axiosInstance';// axiosInstance को इम्पोर्ट करें

// ESignatureRecipientRole और ESignatureRecipient प्रकारों को सीधे यहाँ परिभाषित करें (या Typescript फ़ाइल से हटा दें)
// यदि आप अभी भी एक केंद्रीय प्रकार की फ़ाइल चाहते हैं, तो बस 'type' कीवर्ड हटा दें
// और फ़ाइल को .js/.jsx के रूप में सहेजें (हालांकि यह TypeScript का मुख्य लाभ खो देता है)

// JavaScript में टाइप एनोटेशन नहीं होते, लेकिन आप स्ट्रक्चर को JSDoc के माध्यम से दस्तावेज़ित कर सकते हैं।
// यहाँ एक सरल प्रतिनिधित्व है:
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
 * @typedef {Object} ESignatureProcess
 * @property {string} documentId
 * @property {'invoice' | 'orderform'} documentType
 * @property {ESignatureRecipient[]} recipients
 * @property {string} emailSubject
 * @property {string} emailMessage
 * @property {string} status
 */


const recipientColors = [
  'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300',
  'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
  'bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300',
  'bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300',
  'bg-pink-100 border-pink-300 text-pink-700 dark:bg-pink-900/30 dark:border-pink-700 dark:text-pink-300',
  'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300',
  'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
  'bg-teal-100 border-teal-300 text-teal-700 dark:bg-teal-900/30 dark:border-teal-700 dark:text-teal-300',
];


export default function ConfigureSignatureRequestPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  // TypeScript प्रकार एनोटेशन हटाए गए
  const documentType = params.documentType; // as 'invoice' | 'orderform' removed
  const documentId = params.documentId; // as string removed

  const [documentInfo, setDocumentInfo] = React.useState(null);
  const [isLoadingDocument, setIsLoadingDocument] = React.useState(true);

  const [recipients, setRecipients] = React.useState([]); // ESignatureRecipient[] removed
  const [currentRecipientName, setCurrentRecipientName] = React.useState('');
  const [currentRecipientEmail, setCurrentRecipientEmail] = React.useState('');
  const [currentRecipientRole, setCurrentRecipientRole] = React.useState('SIGNER'); // ESignatureRecipientRole removed
  const [currentRecipientSigningOrder, setCurrentRecipientSigningOrder] = React.useState(undefined); // number | undefined removed

  const [emailSubject, setEmailSubject] = React.useState('');
  const [emailMessage, setEmailMessage] = React.useState('');

  React.useEffect(() => {
    async function loadDocumentInfo() {
      setIsLoadingDocument(true);
      let docNumber = '';
      let customerName = 'N/A';
      console.log(`[ConfigurePage] Loading document. Type: ${documentType}, ID: ${documentId}`);

      // Get authentication token (assuming it's stored in localStorage or context)
      // आप इसे अपने AuthContext से प्राप्त कर सकते हैं यदि आपके पास है
      const authToken = localStorage.getItem('authToken'); // Adjust this based on how you store your token

      if (!authToken) {
        toast({ title: "Authentication Error", description: "No authentication token found. Please log in.", variant: "destructive" });
        setIsLoadingDocument(false);
        return;
      }

      try {
        let documentResponse;
        let customerResponse;

        if (documentType === 'invoice' && documentId) {
          documentResponse = await axiosInstance.get(`/api/invoices/${documentId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          const invoice = documentResponse.data;
          if (invoice) {
            docNumber = invoice.invoiceNumber;
            if (invoice.customerId) {
              customerResponse = await axiosInstance.get(`/api/customers/${invoice.customerId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });
              customerName = customerResponse.data?.name || 'N/A';
            }
          }
        } else if (documentType === 'orderform' && documentId) {
          documentResponse = await axiosInstance.get(`/api/order-forms/${documentId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          const orderForm = documentResponse.data;
          if (orderForm) {
            docNumber = orderForm.orderFormNumber;
            if (orderForm.customerId) {
              customerResponse = await axiosInstance.get(`/api/customers/${orderForm.customerId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
              });
              customerName = customerResponse.data?.name || 'N/A';
            }
          }
        }

        if (docNumber) {
          setDocumentInfo(`${documentType === 'invoice' ? 'Invoice' : 'Order Form'} #${docNumber} for ${customerName}`);
          // Load existing draft from localStorage if any, or set defaults
          const storageKey = `eSignatureProcess_${documentType}_${documentId}`;
          const existingDraftString = localStorage.getItem(storageKey);
          if (existingDraftString) {
            try {
              const draftData = JSON.parse(existingDraftString); // ESignatureProcess removed
              setRecipients(draftData.recipients || []);
              setEmailSubject(draftData.emailSubject || `Signature Request for ${documentType === 'invoice' ? 'Invoice' : 'Order Form'} #${docNumber}`);
              setEmailMessage(draftData.emailMessage || `Please review and sign the attached document: ${docNumber}.\n\nThank you!`);
              toast({title: "Draft Loaded", description: "Previous e-signature configuration loaded.", variant: "warning"});
            } catch (e) {
              console.error("Error parsing e-signature draft from localStorage", e);
              // Set default subject and message if parsing fails but draft existed
              setEmailSubject(`Signature Request for ${documentType === 'invoice' ? 'Invoice' : 'Order Form'} #${docNumber}`);
              setEmailMessage(`Please review and sign the attached document: ${docNumber}.\n\nThank you!`);
            }
          } else {
            // No draft found, set default subject and message
            setEmailSubject(`Signature Request for ${documentType === 'invoice' ? 'Invoice' : 'Order Form'} #${docNumber}`);
            setEmailMessage(`Please review and sign the attached document: ${docNumber}.\n\nThank you!`);
          }
        } else {
          setDocumentInfo('Document not found.');
          toast({ title: "Error", description: "Could not load document details.", variant: "destructive" });
        }
      } catch (error) {
        setDocumentInfo('Error loading document.');
        console.error("Failed to fetch document/customer data:", error);
        toast({ title: "Error", description: "Failed to fetch document information.", variant: "destructive" });
      } finally {
        setIsLoadingDocument(false);
      }
    }

    if (documentType && documentId) {
      loadDocumentInfo();
    }
  }, [documentType, documentId, toast]);


  const handleAddRecipient = () => {
    if (!currentRecipientName.trim() || !currentRecipientEmail.trim()) {
      toast({ title: "Missing Information", description: "Please enter name and email for the recipient.", variant: "destructive" });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(currentRecipientEmail)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (currentRecipientRole === 'SIGNER' && (currentRecipientSigningOrder === undefined || currentRecipientSigningOrder <= 0)) {
        toast({ title: "Invalid Signing Order", description: "Signers must have a positive signing order number.", variant: "destructive"});
        return;
    }
    if (currentRecipientRole === 'SIGNER' && recipients.some(r => r.role === 'SIGNER' && r.signingOrder === currentRecipientSigningOrder)) {
        toast({ title: "Duplicate Signing Order", description: "Each signer must have a unique signing order.", variant: "destructive"});
        return;
    }

    // ESignatureRecipient removed
    const newRecipient = {
      id: Date.now().toString(),
      name: currentRecipientName.trim(),
      email: currentRecipientEmail.trim(),
      role: currentRecipientRole,
      signingOrder: currentRecipientRole === 'SIGNER' ? currentRecipientSigningOrder : undefined,
      color: recipientColors[recipients.length % recipientColors.length],
      status: 'Pending',
    };
    setRecipients(prevRecipients => [...prevRecipients, newRecipient].sort((a, b) => (a.signingOrder || Infinity) - (b.signingOrder || Infinity)));

    setCurrentRecipientName('');
    setCurrentRecipientEmail('');
    setCurrentRecipientRole('SIGNER');
    setCurrentRecipientSigningOrder(undefined);
  };

  const handleRemoveRecipient = (id) => { // id: string removed
    setRecipients(recipients.filter(r => r.id !== id));
  };

  const handleNext = () => {
    if (recipients.length === 0) {
      toast({ title: "No Recipients", description: "Please add at least one recipient.", variant: "destructive" });
      return;
    }
    if (!emailSubject.trim() || !emailMessage.trim()) {
        toast({ title: "Missing Email Details", description: "Please provide an email subject and message.", variant: "destructive" });
      return;
    }
    if (!recipients.some(r => r.role === 'SIGNER')) {
      toast({ title: "No Signers", description: "Please add at least one recipient with the 'Signer' role.", variant: "destructive" });
      return;
    }

    // ESignatureProcess removed
    const eSignatureProcessData = {
      documentId,
      documentType,
      recipients,
      emailSubject,
      emailMessage,
      status: 'Draft',
    };
    const storageKey = `eSignatureProcess_${documentType}_${documentId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(eSignatureProcessData));
      console.log("[ConfigurePage DEBUG] E-Signature Draft Saved to localStorage. Key:", storageKey, "Data:", eSignatureProcessData);
      const verifySaved = localStorage.getItem(storageKey);
      console.log("[ConfigurePage DEBUG] Value from localStorage immediately after set:", verifySaved ? JSON.parse(verifySaved) : null);

      toast({ title: "Configuration Saved", description: "Recipients and message saved as draft.", variant: "warning" });
      console.log(`[ConfigurePage DEBUG] Attempting to navigate from Configure Page: /e-signature/place-fields/${documentType}/${documentId}`);
      router.push(`/e-signature/place-fields/${documentType}/${documentId}`);
    } catch (e) {
      console.error("Error saving e-signature draft to localStorage", e);
      toast({title: "Storage Error", description: "Could not save configuration.", variant: "destructive"});
    }
  };

  const pageTitle = isLoadingDocument
    ? "Loading Document..."
    : documentInfo || "Configure E-Signature Request";

  return (
    <>
      <AppHeader title={pageTitle} showBackButton />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {isLoadingDocument ? (
          <Card><CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        ) : !documentInfo || documentInfo === 'Document not found.' || documentInfo === 'Error loading document.' ? (
           <Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p>{documentInfo}</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Recipients</CardTitle>
                  <CardDescription>Add who needs to sign or receive a copy of this document. Assign roles and signing order for signers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div className="space-y-1">
                      <Label htmlFor="recipientName">Recipient Name</Label>
                      <Input
                        id="recipientName"
                        placeholder="e.g. Jane Doe"
                        value={currentRecipientName}
                        onChange={(e) => setCurrentRecipientName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="recipientEmail">Recipient Email</Label>
                      <Input
                        id="recipientEmail"
                        type="email"
                        placeholder="e.g. jane.doe@example.com"
                        value={currentRecipientEmail}
                        onChange={(e) => setCurrentRecipientEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="recipientRole">Role</Label>
                      <Select value={currentRecipientRole} onValueChange={(value) => setCurrentRecipientRole(value)}> // Type cast removed
                        <SelectTrigger id="recipientRole"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SIGNER">Signer</SelectItem>
                          <SelectItem value="CC">Receives a copy (CC)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {currentRecipientRole === 'SIGNER' && (
                        <div className="space-y-1">
                        <Label htmlFor="signingOrder">Signing Order</Label>
                        <Input
                            id="signingOrder"
                            type="number"
                            placeholder="e.g. 1"
                            value={currentRecipientSigningOrder || ''}
                            onChange={(e) => setCurrentRecipientSigningOrder(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                            min="1"
                        />
                        </div>
                    )}
                  </div>
                   <div className="pt-2">
                    <Button onClick={handleAddRecipient}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Recipient
                    </Button>
                  </div>
                  {recipients.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="text-sm font-medium text-muted-foreground">Added Recipients (Sorted by Signing Order):</h4>
                      <ul className="space-y-2">
                        {recipients.map(r => (
                          <li key={r.id} className={cn("flex justify-between items-center p-3 border rounded-md", r.color?.replace('bg-', 'border-').replace('-100', '-400') || 'border-border', r.color || 'bg-muted/30' )}>
                            <div className="flex items-center">
                               <div className={cn("w-3 h-3 rounded-full mr-3", r.color ? r.color.split(' ')[0].replace('text-','bg-') : 'bg-gray-400')}></div>
                               <div>
                                 <p className="font-medium text-sm">{r.name}</p>
                                 <p className="text-xs text-muted-foreground">{r.email}</p>
                               </div>
                            </div>
                            <div className="text-right">
                                 <p className="text-xs font-medium">
                                     {r.role === 'SIGNER' ? `Signer (Order: ${r.signingOrder || 'N/A'})` : 'CC'}
                                 </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveRecipient(r.id)} title="Remove recipient">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Mail className="mr-2 h-5 w-5 text-primary" /> Email Message</CardTitle>
                  <CardDescription>Customize the email sent to recipients with the document.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="emailSubject">Subject</Label>
                    <Input
                      id="emailSubject"
                      placeholder="e.g. Signature Request for Agreement #123"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailMessage">Message</Label>
                    <Textarea
                      id="emailMessage"
                      placeholder="Enter your message to the recipients..."
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={5}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center"><FilePenLine className="mr-2 h-5 w-5 text-primary"/> Document Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{documentInfo}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Signers: {recipients.filter(r => r.role === 'SIGNER').length}, CC: {recipients.filter(r => r.role === 'CC').length}
                  </p>
                    <p className="text-xs text-muted-foreground mt-2">
                    This is a prototype. No actual emails will be sent. Signing order is conceptual. Configuration is saved to browser storage.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleNext} className="w-full">
                    Next: Define Fields (Prototype) <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </>
  );
}