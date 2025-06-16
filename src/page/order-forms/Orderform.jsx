// OrderFormsPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Next.js imports replaced
import { AppHeader } from '../../components/ui/layout/app-header';
import { Button } from '../../components/ui/button'; // Path adjusted
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'; // Path adjusted
import { DataTable } from '../../components/ui/DataTable';
import { DeleteConfirmationDialog } from '../../components/delete-confirmation-dialog'; // Path adjusted
import { Badge } from '../../components/ui/badge'; // Path adjusted
import { PlusCircle, Edit, Eye, Trash2, Download, ChevronDown, FileSignature, PackageSearch } from 'lucide-react';
// import type { OrderForm, Customer } from '@/types'; // Types removed
import { useToast } from '../../hooks/use-toast'; // Path adjusted
import { format } from 'date-fns';
import { OrderFormPreviewDialog } from '../../components/orderform-preview-dialog';
import { Skeleton } from '../../components/ui/skeleton'; // Path adjusted
import { Input } from '../../components/ui/input'; // Path adjusted
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"; // Path adjusted
//import { downloadPdfForDocument, downloadMultipleDocumentsAsSinglePdf } from '../../lib/pdf-utils'; // Path adjusted
import { getCurrencySymbol } from '../../lib/currency-utils'; // Path adjusted
// import { BrandingSettingsFormData as BrandingSettings } from '@/lib/schemas'; // Type import removed

// Backend interactions will now use axiosInstance
import axiosInstance from '../../lib/axiosInstance'; // Path adjusted

// --- New: Function to fetch BrandingSettings using axiosInstance ---
async function fetchCompanyBrandingApi() {
  try {
    const response = await axiosInstance.get('/branding-settings');
    return response.data; // Axios automatically parses JSON
  } catch (error) {
    console.error("Failed to fetch company branding settings:", error);
    throw error; // Re-throw to be caught by the calling useEffect
  }
}

// --- New: Functions to fetch data using axiosInstance ---
async function getAllOrderFormsApi() {
  const response = await axiosInstance.get('/order-forms');
  return response.data;
}

async function getAllCustomersApi() {
  const response = await axiosInstance.get('/customers');
  return response.data;
}

async function removeOrderFormApi(id) {
  const response = await axiosInstance.delete(`/order-forms/${id}`);
  return response.data; // Assuming backend returns success confirmation
}

async function fetchCustomerByIdApi(id) {
  const response = await axiosInstance.get(`/customers/${id}`);
  return response.data;
}

async function convertMultipleOrderFormsToInvoicesApi(orderFormIds) {
  const response = await axiosInstance.post('/invoices/bulk-convert', { orderFormIds });
  return response.data;
}
// --- End of New Functions ---


export default function OrderFormsPage() {
  const navigate = useNavigate(); // Replaced useRouter
  const location = useLocation(); // Replaced usePathname (though not strictly used in the original logic, good to have)
  const { toast } = useToast();
  const [orderForms, setOrderForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [isBulkConverting, setIsBulkConverting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);

  // --- State for company branding ---
  const [companyBranding, setCompanyBranding] = useState(null); // No type annotation
  const [loadingCompanyBranding, setLoadingCompanyBranding] = useState(true);
  const [companyBrandingError, setCompanyBrandingError] = useState(null);
  // --- End of New State ---

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllOrderFormsApi();
        const customerdata = await getAllCustomersApi();
        setCustomers(customerdata);
        const enrichedOrderForms = data.map(form => {
          const customer = customerdata.find(cust => cust.id === form.customerId);
          return {
            ...form,
            customerName: customer ? customer.name : 'Unknown Customer',
          };
        });
        setOrderForms(enrichedOrderForms);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch order forms.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }

    // --- Fetch company branding settings ---
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
    // --- End of New Fetch ---

    fetchData();
    getCompanyBranding();
  }, [toast]); // Added toast to dependency array as it's used inside

  const handleDeleteOrderForm = async (id) => {
    try {
      // Assuming removeOrderFormApi returns a success indicator or throws error on failure
      await removeOrderFormApi(id); // Changed to direct API call
      setOrderForms(prev => prev.filter(q => q.id !== id));
      setRowSelection(prev => {
        const newSelection = {...prev};
        delete newSelection[id];
        return newSelection;
      });
      toast({ title: "Success", description: "Order Form deleted successfully." });
    } catch (error) {
      console.error("Error deleting order form:", error);
      let errorMessage = "Failed to delete order form. An unexpected error occurred.";
      if (axiosInstance.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const getSelectedOrderForms = () => {
    return Object.entries(rowSelection)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => orderForms.find(q => q.id === id))
      .filter(q => !!q); // Filter out undefined/null entries
  };

//   const handleDownloadIndividualPdfs = async () => {
//     const selectedOrderForms = getSelectedOrderForms();
//     if (selectedOrderForms.length === 0) {
//       toast({ title: "No Selection", description: "Please select order forms to download.", variant: "destructive" });
//       return;
//     }

//     setIsDownloading(true);
//     toast({ title: "Processing PDFs...", description: `Preparing ${selectedOrderForms.length} order form(s) for download.` });

//     for (const orderForm of selectedOrderForms) {
//       try {
//         let customer = undefined;
//         if (orderForm.customerId) {
//           customer = await fetchCustomerByIdApi(orderForm.customerId); // Changed to direct API call
//         }
//         await downloadPdfForDocument(orderForm, customer, companyBranding || undefined);
//         if (selectedOrderForms.length > 1) await new Promise(resolve => setTimeout(resolve, 500));
//       } catch (error) {
//         console.error("Error downloading PDF for order form:", orderForm.orderFormNumber, error);
//         toast({ title: "Download Error", description: `Failed to download PDF for ${orderForm.orderFormNumber}.`, variant: "destructive" });
//       }
//     }
//     setIsDownloading(false);
//     setRowSelection({});
//   };

//   const handleDownloadCombinedPdf = async () => {
//     const selectedOrderForms = getSelectedOrderForms();
//     if (selectedOrderForms.length === 0) {
//       toast({ title: "No Selection", description: "Please select order forms for combined PDF.", variant: "destructive" });
//       return;
//     }
//     setIsDownloading(true);
//     const customersForPdf = await Promise.all(
//       selectedOrderForms.map(q => q.customerId ? fetchCustomerByIdApi(q.customerId) : Promise.resolve(undefined))
//     );
//     await downloadMultipleDocumentsAsSinglePdf(selectedOrderForms, customersForPdf, 'Combined_OrderForms.pdf', companyBranding || undefined);
//     setIsDownloading(false);
//     setRowSelection({});
//   };

  const handleBulkConvertToInvoices = async () => {
    const selectedOrderFormIds = Object.entries(rowSelection)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    if (selectedOrderFormIds.length === 0) {
      toast({ title: "No Selection", description: "Please select order forms to convert.", variant: "destructive" });
      return;
    }

    setIsBulkConverting(true);
    toast({ title: "Processing...", description: `Converting ${selectedOrderFormIds.length} order form(s) to invoices.` });

    try {
      const result = await convertMultipleOrderFormsToInvoicesApi(selectedOrderFormIds); // Changed to direct API call
      if (result.successCount > 0) {
        toast({ title: "Conversion Successful", description: `${result.successCount} order form(s) converted to invoices.` });
      }
      if (result.errorCount > 0) {
        toast({ title: "Conversion Partially Failed", description: `${result.errorCount} order form(s) could not be converted.`, variant: "destructive" });
      }
      // Refresh current page by filtering out converted ones or re-fetch
      setOrderForms(prev => prev.filter(q => !selectedOrderFormIds.includes(q.id)));
      navigate('/invoices'); // Replaced router.push
    } catch (error) {
      console.error("Error converting multiple order forms:", error);
      let errorMessage = "An unexpected error occurred during bulk conversion.";
      if (axiosInstance.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast({ title: "Bulk Conversion Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsBulkConverting(false);
      setRowSelection({});
    }
  };


  const getStatusVariant = (status) => { // Removed type annotation
    switch (status) {
      case 'Accepted': return 'default';
      case 'Sent': return 'secondary';
      case 'Declined':
      case 'Expired': return 'destructive';
      case 'Draft': return 'outline';
      default: return 'outline';
    }
  };
  const acceptedBadgeClass = "bg-primary text-primary-foreground hover:bg-primary/80";


  const columns = [ // Removed type annotation
    { accessorKey: 'orderFormNumber', header: 'Number', cell: (row) => row.orderFormNumber, size: 120 },
    { accessorKey: 'customerName', header: 'Customer', cell: (row) => row.customerName || 'N/A', size: 200 },
    { accessorKey: 'issueDate', header: 'Issue Date', cell: (row) => format(new Date(row.issueDate || 'N/A'), 'PP'), size: 120 },
    { accessorKey: 'validUntilDate', header: 'Valid Until', cell: (row) => format(new Date(row.validUntilDate || 'N/A'), 'PP'), size: 120 },
    { accessorKey: 'total', header: 'Total', cell: (row) => `${getCurrencySymbol(row.currencyCode)}${row.total !== undefined && row.total !== null ? row.total.toFixed(2) : 'N/A'}`, size: 100 },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={getStatusVariant(row.status)} className={row.status === 'Accepted' ? acceptedBadgeClass : ''}>
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
          {/* Ensure companyBranding is available before rendering OrderFormPreviewDialog */}
          {companyBranding && (
            <OrderFormPreviewDialog
              orderFormId={row.id}
              companyBranding={companyBranding} // Pass the fetched companyBranding prop
              trigger={
                <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); console.log("Preview clicked for OrderForm ID:", row.id);}}>
                  <Eye className="h-4 w-4" />
                </Button>
              }
            />
          )}
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/orderforms/${row.id}`); }} title="Edit Order Form"> {/* Replaced router.push */}
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteConfirmationDialog
            onConfirm={() => handleDeleteOrderForm(row.id)}
            itemName={`order form ${row.orderFormNumber}`}
            trigger={
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Delete Order Form">
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

  const filteredOrderForms = useMemo(() => {
    if (!searchTerm.trim()) {
      return orderForms;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return orderForms.filter(of =>
      (of.customerName && of.customerName.toLowerCase().includes(lowercasedFilter))
    );
  }, [orderForms, searchTerm]);

  // Combine loading states
  const overallLoading = loading || loadingCompanyBranding;

  if (overallLoading) {
    return (
      <>
        <AppHeader title="Order Forms">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-64" /> {/* Skeleton for filter input */}
            <Skeleton className="h-10 w-44" /> {/* Skeleton for Create button */}
          </div>
        </AppHeader>
        <main className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader><CardTitle>All Order Forms</CardTitle></CardHeader>
            <CardContent><div className="space-y-2">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div></CardContent>
          </Card>
        </main>
      </>
    );
  }

  // Handle error specifically for company branding if it occurs
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

  // Fallback if companyBranding is still null after loading (shouldn't happen with error handling, but good for type safety)
  if (!companyBranding) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-6">
        <h1 className="text-2xl font-bold">Configuration Missing</h1>
        <p className="text-muted-foreground mt-2">Company branding information could not be loaded. This is required for previewing documents.</p>
        <p className="text-muted-foreground">Please ensure your branding settings are configured in the system.</p>
        <Button onClick={() => navigate('/branding-numbering')} className="mt-4">Go to Branding Settings</Button> {/* Changed to navigate */}
      </div>
    );
  }


  return (
    <>
      <AppHeader title="Order Forms">
        <Input
          type="text"
          placeholder="Filter by customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 w-64"
        />
          {numSelected > 0 && (
            <>
              <Button onClick={handleBulkConvertToInvoices} disabled={isBulkConverting || isDownloading} variant="outline">
                  <FileSignature className="mr-2 h-4 w-4" />
                  {isBulkConverting ? `Converting ${numSelected}...` : `Convert ${numSelected} to Invoice(s)`}
              </Button>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isDownloading || isBulkConverting}>
                      <Download className="mr-2 h-4 w-4" />
                      {isDownloading ? `Processing ${numSelected}...` : `Download ${numSelected} Selected`}
                      <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                  {/* <DropdownMenuItem onSelect={handleDownloadIndividualPdfs} disabled={isDownloading || isBulkConverting}>Download as Individual PDFs</DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleDownloadCombinedPdf} disabled={isDownloading || isBulkConverting}>Download as Single PDF</DropdownMenuItem>
                  */}
                  </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        <Link to="/orderforms/new"> {/* Replaced href with to */}
          <Button disabled={isBulkConverting || isDownloading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Order Form
          </Button>
        </Link>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader><CardTitle>All Order Forms</CardTitle></CardHeader>
          <CardContent>
            {filteredOrderForms.length === 0 && !overallLoading ? (
                <div className="flex flex-col items-center justify-center h-[30vh] text-center">
                <PackageSearch className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  {searchTerm ? "No Matching Order Forms" : "No Order Forms Yet"}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? `Your search for "${searchTerm}" did not match any order forms.` : "Create your first order form to get started!"}
                </p>
                <Link to="/orderforms/new"> {/* Replaced href with to */}
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Create Your First Order Form</Button>
                </Link>
              </div>
            ) : (
            <DataTable
              columns={columns}
              data={filteredOrderForms}
              onRowClick={(row) => navigate(`/orderforms/${row.id}`)} 
              noResultsMessage={searchTerm ? `No order forms match your filter "${searchTerm}".` : "No order forms found. Create your first order form!"}
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
