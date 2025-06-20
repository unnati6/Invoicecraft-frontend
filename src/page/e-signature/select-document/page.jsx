'use client';

import * as React from 'react';
import { Link } from 'react-router-dom'; // Keep this if you are using react-router-dom
// import Link from 'next/link'; // Use this if you are in Next.js App Router and want Next.js Link

import { AppHeader } from '../../../components/ui/layout/app-header';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { FileText, FileSignature as OrderFormIcon, ArrowRight, LayoutGrid, ListFilter, FolderOpen, Filter, Circle, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react'; // Added Loader2
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import axiosInstance from '../../../lib/axiosInstance'; // Make sure this path is correct

// JSDoc types (as defined previously)
/**
 * @typedef {'Draft' | 'SentForSignature' | 'ViewedByRecipient' | 'PartiallySigned' | 'Completed' | 'Declined'} ESignatureProcessStatus
 */

/**
 * @typedef {Object} ESignatureRecipient
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'SIGNER' | 'CC'} role
 * @property {number} [signingOrder]
 * @property {string} [color]
 * @property {string} [status] // e.g., 'Pending', 'Signed', 'Declined', 'Viewed'
 */

/**
 * @typedef {Object} ESignatureProcess
 * @property {string} documentId
 * @property {'invoice' | 'orderform'} documentType
 * @property {ESignatureRecipient[]} recipients
 * @property {string} emailSubject
 * @property {string} emailMessage
 * @property {ESignatureProcessStatus} status
 * @property {string} [sentAt] // ISO date string
 * @property {PlacedField[]} [placedFields] // Optional, if you decide to store them here
 */

/**
 * @typedef {Object} DocumentFromBackend // Represents a document as it might come from your backend
 * @property {string} id
 * @property {'invoice' | 'orderform'} type
 * @property {string} number
 * @property {string} customer
 * @property {string} date // Assuming date comes as a string (ISO format) from backend
 * @property {ESignatureProcessStatus | 'Not Sent'} [eSignatureStatus] // Optional, if backend provides this
 */

/**
 * @typedef {Object} DocumentWithStatus
 * @property {string} id
 * @property {'invoice' | 'orderform'} type
 * @property {string} number
 * @property {string} customer
 * @property {Date} date // Now explicitly a Date object
 * @property {ESignatureProcessStatus | 'Not Sent'} eSignatureStatus
 */


// --- ESignatureStatusVisualizer Component (unchanged) ---
/**
 * @param {object} props
 * @param {ESignatureProcessStatus | 'Not Sent'} props.status
 */
const ESignatureStatusVisualizer = ({ status }) => {
  const stages = [
    { label: 'Draft', key: 'Draft' },
    { label: 'Sent', key: 'SentForSignature' },
    { label: 'Finalized', key: 'Finalized' },
  ];

  let activeStageIndex = -1;
  let isCompleted = false;
  let isDeclined = false;

  switch (status) {
    case 'Draft':
      activeStageIndex = 0;
      break;
    case 'SentForSignature':
    case 'ViewedByRecipient':
    case 'PartiallySigned':
      activeStageIndex = 1;
      break;
    case 'Completed':
      activeStageIndex = 2;
      isCompleted = true;
      break;
    case 'Declined':
      activeStageIndex = 2;
      isDeclined = true;
      break;
    case 'Not Sent':
    default:
      activeStageIndex = -1; // All gray
      break;
  }

  return (
    <div className="flex items-center space-x-2">
      {stages.map((stage, index) => {
        const isActive = index <= activeStageIndex;
        const isCurrentStage = index === activeStageIndex;
        let textColorClass = 'text-muted-foreground/70';
        let IconComponent = Circle;

        if (isActive) {
          textColorClass = 'text-foreground';
          if (stage.key === 'Draft') {
             IconComponent = Circle;
          } else if (stage.key === 'SentForSignature') {
             IconComponent = AlertTriangle;
          }
        }

        if (stage.key === 'Finalized') {
          if (isCompleted) {
            textColorClass = 'text-green-600 dark:text-green-400';
            IconComponent = CheckCircle2;
          } else if (isDeclined) {
            textColorClass = 'text-red-600 dark:text-red-400';
            IconComponent = XCircle;
          } else if (activeStageIndex < 2) {
            textColorClass = 'text-muted-foreground/70';
            IconComponent = Circle;
          }
        }
        if (isCurrentStage && stage.key !== 'Finalized' && !isCompleted && !isDeclined) {
          textColorClass = 'font-semibold ' + (stage.key === 'Draft' ? 'text-sky-600 dark:text-sky-400' : 'text-amber-600 dark:text-amber-400');
        } else if (isActive && stage.key !== 'Finalized' && !isCompleted && !isDeclined) {
            textColorClass = (stage.key === 'Draft' ? 'text-sky-600 dark:text-sky-400' : 'text-amber-600 dark:text-amber-400');
        }

        return (
          <React.Fragment key={stage.key}>
            <div className="flex flex-col items-center">
              <IconComponent className={cn("h-5 w-5",
                stage.key === 'Finalized' && isCompleted ? "text-green-500" :
                stage.key === 'Finalized' && isDeclined ? "text-red-500" :
                isActive && stage.key === 'Draft' ? "text-sky-500" :
                isActive && stage.key === 'SentForSignature' ? "text-amber-500" :
                "text-muted-foreground/30",
                (isActive || isCompleted || isDeclined) ? "fill-current" : ""
              )} />
              <span className={cn("text-xs mt-1", textColorClass)}>{stage.label}</span>
            </div>
            {index < stages.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5",
                index < activeStageIndex ? ( (stages[index+1].key === 'Finalized' && (isCompleted || isDeclined)) ? (isCompleted ? 'bg-green-500' : 'bg-red-500') : (stages[index+1].key === 'SentForSignature' ? 'bg-amber-500' : 'bg-sky-500') ) : 'bg-muted-foreground/30'
              )} style={{minWidth: '20px'}}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default function SelectDocumentForSignaturePage() {
  const [viewMode, setViewMode] = React.useState('card');
  const [selectedDocumentType, setSelectedDocumentType] = React.useState('all');
  /** @type {React.useState<DocumentWithStatus[]>} */
  const [documentsWithStatus, setDocumentsWithStatus] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const getESignatureStatus = (docType, docId) => {
      if (typeof window === 'undefined') return 'Not Sent';
      try {
        const storageKey = `eSignatureProcess_${docType}_${docId}`;
        const eSigProcessString = localStorage.getItem(storageKey);
        if (eSigProcessString) {
          const eSigProcessData = JSON.parse(eSigProcessString);
          return eSigProcessData.status;
        }
      } catch (e) {
        console.error(`Error reading eSignature status for ${docType} ${docId}:`, e);
      }
      return 'Not Sent';
    };

    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const invoiceResponse = await axiosInstance.get('/invoices'); // Adjust this endpoint
        const invoices = invoiceResponse.data.map(doc => ({ ...doc, type: 'invoice' }));

        const orderFormResponse = await axiosInstance.get('/order-forms'); // Adjust this endpoint
        const orderForms = orderFormResponse.data.map(doc => ({ ...doc, type: 'orderform' }));

        const allDocuments = [...invoices, ...orderForms];

        const processedDocuments = allDocuments
          .filter(doc => selectedDocumentType === 'all' || doc.type === selectedDocumentType)
          .map(doc => {
            // Validate the date string before creating a Date object
            let parsedDate;
            if (doc.date && typeof doc.date === 'string' && !isNaN(new Date(doc.date).getTime())) {
              parsedDate = new Date(doc.date);
            } else {
              console.warn(`Invalid or missing date for document ${doc.id}. Using current date as fallback.`);
              parsedDate = new Date(); // Fallback to current date
            }

            return {
              ...doc,
              date: parsedDate,
              eSignatureStatus: doc.eSignatureStatus || getESignatureStatus(doc.type, doc.id),
            };
          });
        setDocumentsWithStatus(processedDocuments);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
        setError("Failed to load documents. Please check your network or try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [selectedDocumentType]);

  return (
    <>
      <AppHeader title="Select Document for E-Signature">
        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('card')} title="Card View">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} title="List View">
            <ListFilter className="h-4 w-4" />
          </Button>
        </div>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle>Choose a Document</CardTitle>
                    <CardDescription>
                    Select an existing Invoice or Order Form to prepare for e-signature.
                    <br />
                    <span className="text-xs text-muted-foreground">
                        (E-Signature status is currently read from browser storage, but documents are fetched from backend.)
                    </span>
                    </CardDescription>
                </div>
                <div className="w-full sm:w-auto min-w-[200px]">
                    <Label htmlFor="docTypeFilter" className="text-xs font-medium">Filter by Type</Label>
                    <Select value={selectedDocumentType} onValueChange={(value) => setSelectedDocumentType(value)}>
                        <SelectTrigger id="docTypeFilter" className="w-full">
                             <div className="flex items-center gap-2">
                                 <Filter className="h-4 w-4 text-muted-foreground" />
                                 <SelectValue placeholder="Filter by type" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Documents</SelectItem>
                            <SelectItem value="invoice">Invoices Only</SelectItem>
                            <SelectItem value="orderform">Order Forms Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[30vh] text-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                <h2 className="text-xl font-semibold">Loading Documents...</h2>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-[30vh] text-center text-red-500">
                <XCircle className="w-16 h-16 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Error</h2>
                <p>{error}</p>
              </div>
            ) : documentsWithStatus.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[30vh] text-center">
                <FolderOpen className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Documents Found</h2>
                <p className="text-muted-foreground">
                  {selectedDocumentType === 'all' ? 'No documents available from the backend.' : `No ${selectedDocumentType}s match the current filter from the backend.`}
                </p>
              </div>
            ) : viewMode === 'card' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {documentsWithStatus.map((doc) => (
                  <Card key={`${doc.type}-${doc.id}`} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {doc.type === 'invoice' ? <FileText className="h-5 w-5 text-primary" /> : <OrderFormIcon className="h-5 w-5 text-primary" />}
                        <span className="truncate" title={doc.invoiceNumber}>{doc.invoiceNumber}</span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        For: {doc.customerActualName} <br />
                        Date: {format(doc.issueDate, 'PP')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       <p className="text-sm text-muted-foreground">
                         Type: <span className="font-medium text-foreground">{doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}</span>
                      </p>
                      <div className="mt-2">
                        <ESignatureStatusVisualizer status={doc.eSignatureStatus} />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to={`/e-signature/configure/${doc.type}/${doc.id}`}>
                          <span>
                            Configure <ArrowRight className="ml-2 h-4 w-4" />
                          </span>
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : ( // List View
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>E-Signature Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentsWithStatus.map((doc) => (
                      <TableRow key={`${doc.type}-${doc.id}`}>
                        <TableCell>
                          <span className="flex items-center">
                            {doc.type === 'invoice' ? <FileText className="mr-2 h-4 w-4 text-primary" /> : <OrderFormIcon className="mr-2 h-4 w-4 text-primary" />}
                            {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{doc.number}</TableCell>
                        <TableCell>{doc.customer}</TableCell>
                        <TableCell>{format(doc.date, 'PP')}</TableCell>
                        <TableCell>
                          <ESignatureStatusVisualizer status={doc.eSignatureStatus} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/e-signature/configure/${doc.type}/${doc.id}`}>
                              <span>
                                Configure <ArrowRight className="ml-2 h-4 w-4" />
                              </span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

SelectDocumentForSignaturePage.displayName = "SelectDocumentForSignaturePage";