// InvoicesPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppHeader } from '../../components/ui/layout/app-header';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DataTable } from '../../components/ui/DataTable';
import { DeleteConfirmationDialog } from '../../components/delete-confirmation-dialog';
import { Badge } from '../../components/ui/badge';
import { PlusCircle, Edit, Eye, Trash2, Download, ChevronDown, FileText, PackageSearch } from 'lucide-react'; // Changed FileSignature to FileText for invoices
import { useToast } from '../../hooks/use-toast';
import { format } from 'date-fns';
import { InvoicePreviewDialog } from '../../components/invoice-preview-dialog'; // Changed to InvoicePreviewDialog
import { Skeleton } from '../../components/ui/skeleton';
import { Input } from '../../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { getCurrencySymbol } from '../../lib/currency-utils';
import axiosInstance from '../../lib/axiosInstance';

// --- API Functions for Invoices ---
async function fetchCoverPageTemplateApi(id) {
  if (!id) return null;
  try {
    const response = await axiosInstance.get(`/cover-page-templates/${id}`);
    return response.data;
  } catch (error) {
    console.error(`API Error: Failed to fetch cover page template ${id}:`, error.response?.data || error.message);
    return null;
  }
}

async function fetchCompanyBrandingApi() {
  try {
    const response = await axiosInstance.get('/branding-settings');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch company branding settings:", error);
    throw error;
  }
}

async function getAllInvoicesApi() { // Changed from getAllOrderFormsApi
  const response = await axiosInstance.get('/invoices'); // Endpoint changed to /invoices
  return response.data;
}

async function getAllCustomersApi() {
  const response = await axiosInstance.get('/customers');
  return response.data;
}

async function removeInvoiceApi(id) { // Changed from removeOrderFormApi
  const response = await axiosInstance.delete(`/invoices/${id}`); // Endpoint changed to /invoices
  return response.data;
}

// NOTE: Bulk conversion to invoices doesn't make sense if this is already an invoice list.
// If you need a bulk action for invoices (e.g., sending, marking paid, etc.), you'd add a new API call here.
// For now, I'm removing convertMultipleOrderFormsToInvoicesApi as it's not applicable.

// --- End of API Functions ---

export default function InvoicesPage() { // Component name changed
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState([]); // State name changed
  const [loading, setLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);
  // const [isBulkConverting, setIsBulkConverting] = useState(false); // Removed as no longer applicable
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);

  const [companyBranding, setCompanyBranding] = useState(null);
  const [loadingCompanyBranding, setLoadingCompanyBranding] = useState(true);
  const [companyBrandingError, setCompanyBrandingError] = useState(null);

  // Removed coverPageTemplate state as it's likely handled within the preview dialog for invoices
  const [authToken, setAuthToken] = useState(null);

  const filteredInvoices = useMemo(() => { // Filter logic changed
    if (!searchTerm.trim()) {
      return invoices;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return invoices.filter(inv =>
      (inv.customerName && inv.customerName.toLowerCase().includes(lowercasedFilter)) ||
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(lowercasedFilter))
    );
  }, [invoices, searchTerm]);

  useEffect(() => {
    // This useEffect ensures the axios interceptor has the token.
    // It's crucial that your login flow properly sets 'supabase_access_token' in localStorage.
    const token = localStorage.getItem('supabase_access_token'); // Corrected key here
    setAuthToken(token); // Set the state with the raw token if found

    const handleStorageChange = () => {
      const updatedToken = localStorage.getItem('supabase_access_token');
      setAuthToken(updatedToken);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllInvoicesApi(); // Changed to getAllInvoicesApi
        const customerdata = await getAllCustomersApi();
        setCustomers(customerdata);
        const enrichedInvoices = data.map(invoice => { // Changed to 'invoice'
          const customer = customerdata.find(cust => cust.id === invoice.customerId);
          return {
            ...invoice,
            customerName: customer ? customer.name : 'Unknown Customer',
          };
        });
        setInvoices(enrichedInvoices); // State updated to setInvoices
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch invoices.", variant: "destructive" }); // Message changed
      } finally {
        setLoading(false);
      }
    }

    async function getCompanyBranding() {
      try {
        const data = await fetchCompanyBrandingApi();
        setCompanyBranding(data);
      } catch (error) {
        console.error("Error fetching company branding:", error);
        setCompanyBrandingError("Failed to load company branding information.");
      } finally {
        setLoadingCompanyBranding(false);
      }
    }

    // Removed getCoverPageTemplate as it's not needed directly here anymore,
    // and should be handled by InvoicePreviewDialog if necessary.

    fetchData();
    getCompanyBranding();
  }, [toast]);

  const overallLoading = loading || loadingCompanyBranding; // Removed loadingCoverPageTemplate

  if (overallLoading) {
    return (
      <>
        <AppHeader title="Invoices"> {/* Title changed */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-44" />
          </div>
        </AppHeader>
        <main className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader><CardTitle>All Invoices</CardTitle></CardHeader> {/* Title changed */}
            <CardContent><div className="space-y-2">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div></CardContent>
          </Card>
        </main>
      </>
    );
  }

  if (companyBrandingError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-6">
        <h1 className="text-2xl font-bold text-destructive">Error Loading Page</h1>
        <p className="text-muted-foreground mt-2">{companyBrandingError}</p>
        <p className="text-muted-foreground">Please check your backend connection or refresh the page.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Reload Page</Button>
      </div>
    );
  }

  if (!companyBranding) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-6">
        <h1 className="text-2xl font-bold">Configuration Missing</h1>
        <p className="text-muted-foreground mt-2">Company branding information could not be loaded. This is required for previewing documents.</p>
        <p className="text-muted-foreground">Please ensure your branding settings are configured in the system.</p>
        <Button onClick={() => navigate('/branding-numbering')} className="mt-4">Go to Branding Settings</Button>
      </div>
    );
  }

  const handleDeleteInvoice = async (id) => { // Function name changed
    try {
      await removeInvoiceApi(id); // Changed to removeInvoiceApi
      setInvoices(prev => prev.filter(inv => inv.id !== id)); // State updated
      setRowSelection(prev => {
        const newSelection = {...prev};
        delete newSelection[id];
        return newSelection;
      });
      toast({ title: "Success", description: "Invoice deleted successfully." }); // Message changed
    } catch (error) {
      console.error("Error deleting invoice:", error); // Message changed
      let errorMessage = "Failed to delete invoice. An unexpected error occurred."; // Message changed
      if (axiosInstance.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const getSelectedInvoices = () => { // Function name changed
    return Object.entries(rowSelection)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => invoices.find(inv => inv.id === id)) // Changed to invoices
      .filter(inv => !!inv);
  };

  // Removed handleBulkConvertToInvoices as it's not directly applicable for an Invoice list.
  // If you need a bulk action, create a new one (e.g., bulk send, bulk mark paid).

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Paid': return 'default'; // New status for invoices
      case 'Sent': return 'secondary';
      case 'Overdue':
      case 'Cancelled': return 'destructive'; // New statuses
      case 'Draft': return 'outline';
      default: return 'outline';
    }
  };
  const paidBadgeClass = "bg-primary text-primary-foreground hover:bg-primary/80"; // New badge class for 'Paid'

  const columns = [
    { accessorKey: 'invoiceNumber', header: 'Number', cell: (row) => row.invoiceNumber, size: 120 }, // Changed accessorKey and header
    { accessorKey: 'customerName', header: 'Customer', cell: (row) => row.customerName || 'N/A', size: 200 },
    {
      accessorKey: 'issueDate',
      header: 'Issue Date',
      cell: (row) => {
        const date = new Date(row.issueDate);
        return isNaN(date.getTime()) ? 'N/A' : format(date, 'PP');
      },
      size: 120,
    },
    {
      accessorKey: 'validUntilDate', // Changed from validUntilDate to dueDate
      header: 'Due Date', // Header changed
      cell: (row) => {
        const date = new Date(row.validUntilDate);
        return isNaN(date.getTime()) ? 'N/A' : format(date, 'PP');
      },
      size: 120,
    },
    { accessorKey: 'total', header: 'Total', cell: (row) => `${getCurrencySymbol(row.currencyCode)}${row.total !== undefined && row.total !== null ? row.total.toFixed(2) : 'N/A'}`, size: 100 },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={getStatusVariant(row.status)} className={row.status === 'Paid' ? paidBadgeClass : ''}> {/* Changed check to 'Paid' */}
          {row.status}
        </Badge>
      ),
      size: 100
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
          {companyBranding && (
            <InvoicePreviewDialog // Changed to InvoicePreviewDialog
              invoiceId={row.id} // Changed prop to invoiceId
              companyBranding={companyBranding}
              authToken={authToken} // Pass the authToken
              trigger={
                <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); console.log("Preview clicked for Invoice ID:", row.id);}}>
                  <Eye className="h-4 w-4" />
                </Button>
              }
            />
          )}
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/Editinvoice/${row.id}/edit`); }} title="Edit Invoice"> {/* Link changed */}
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteConfirmationDialog
            onConfirm={() => handleDeleteInvoice(row.id)} // Changed function call
            itemName={`invoice ${row.invoiceNumber}`} // Message changed
            trigger={
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Delete Invoice">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
          />
        </div>
      ),
      size: 150
    },
  ];

  const numSelected = Object.values(rowSelection).filter(Boolean).length;

  return (
    <>
      <AppHeader title="Invoices"> {/* Title changed */}
        <Input
          type="text"
          placeholder="Filter by customer name or invoice number..." // Placeholder changed
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 w-64"
        />
          {numSelected > 0 && (
            <>
              {/* Removed bulk convert button as it doesn't apply directly to invoices.
                  Add new bulk actions here if needed for invoices. */}
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isDownloading}>
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? `Processing ${numSelected}...` : `Download ${numSelected} Selected`}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                  {/* <DropdownMenuItem onSelect={handleDownloadIndividualPdfs} disabled={isDownloading}>Download as Individual PDFs</DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleDownloadCombinedPdf} disabled={isDownloading}>Download as Single PDF</DropdownMenuItem>
                  */}
                  </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        <Link to="/Addinvoice"> {/* Link changed to Addinvoice */}
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Invoice {/* Button text changed */}
          </Button>
        </Link>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader><CardTitle>All Invoices</CardTitle></CardHeader> {/* Title changed */}
          <CardContent>
            {filteredInvoices.length === 0 && !overallLoading ? ( // Changed to filteredInvoices
                <div className="flex flex-col items-center justify-center h-[30vh] text-center">
                <PackageSearch className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  {searchTerm ? "No Matching Invoices" : "No Invoices Yet"} {/* Message changed */}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? `Your search for "${searchTerm}" did not match any invoices.` : "Create your first invoice to get started!"} {/* Message changed */}
                </p>
                <Link to="/Addinvoice"> {/* Link changed */}
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Create Your First Invoice</Button> {/* Button text changed */}
                </Link>
              </div>
            ) : (
            <DataTable
              columns={columns}
              data={filteredInvoices} // Data changed to filteredInvoices
              onRowClick={(row) => navigate(`/Editinvoice/${row.id}/edit`)} // Link changed
              noResultsMessage={searchTerm ? `No invoices match your filter "${searchTerm}".` : "No invoices found. Create your first invoice!"} // Message changed
              isSelectable={true}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
            />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}