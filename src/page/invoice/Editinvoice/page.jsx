import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { AppHeader } from '../../../components/ui/layout/app-header';
import { InvoiceForm } from '../../../components/invoice-form'; // Or OrderFormForm for that page
import { useToast } from '../../../hooks/use-toast';
import { Button } from '../../../components/ui/button';
import { InvoicePreviewDialog } from '../../../components/invoice-preview-dialog'; // Or OrderFormPreviewDialog
import { Eye, FileEdit, FileSignature } from 'lucide-react'; // Keep FileSignature if convert button is active
import { Skeleton } from '../../../components/ui/skeleton';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../lib/axiosInstance';


export default function EditInvoicePage() { // Or EditOrderFormPage
  const router = useNavigate();
  const params = useParams();

  const invoiceId = params.id; // Or orderFormId
  const { toast } = useToast();

  const [invoice, setInvoice] = React.useState(null); // Or orderForm, setOrderForm
  const [customer, setCustomer] = React.useState(undefined);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isConverting, setIsConverting] = React.useState(false); // Keep if needed for order form page

  const [companyBranding, setCompanyBranding] = React.useState(null);
  const [loadingCompanyBranding, setLoadingCompanyBranding] = React.useState(true);
  const [companyBrandingError, setCompanyBrandingError] = React.useState(null);

  // ... (rest of your useEffect and handleSubmit functions)
  // Ensure API endpoints are correct for invoice or order form as needed
  // Ensure state variable names like `invoice` or `orderForm` are used consistently

  // If you are troubleshooting EditInvoicePage:
  React.useEffect(() => {
    if (invoiceId) { // Check invoiceId
      async function loadInvoiceAndBranding() { // Function name matches
        setLoading(true);
        setLoadingCompanyBranding(true);

        let fetchedInvoice = null; // Variable name matches
        let fetchedCustomer = undefined;
        let fetchedCompanyBranding = null;

        try {
          console.log("Fetching Invoice Data from backend...");
          fetchedInvoice = (await axiosInstance.get(`/invoices/${invoiceId}`)).data; // Invoice API endpoint

          if (fetchedInvoice) {
            if (fetchedInvoice.customerId) {
              console.log("Fetching Customer Data from backend...");
              fetchedCustomer = fetchedInvoice.customerId
                ? (await axiosInstance.get(`/customers/${fetchedInvoice.customerId}`)).data
                : undefined;
            }
          } else {
            toast({ title: "Error", description: "Invoice not found.", variant: "destructive" });
            router('/invoices'); // Redirect to invoices list
            return;
          }

          console.log("Fetching Company Branding Data from backend...");
          try {
            fetchedCompanyBranding = (await axiosInstance.get('/branding-settings')).data;
          } catch (brandingErr) {
            console.error("Error fetching company branding:", brandingErr);
            setCompanyBrandingError("Failed to load company branding information.");
            toast({ title: "Error", description: "Failed to load company branding.", variant: "destructive" });
          }

        } catch (error) {
          console.error("Failed to fetch invoice details:", error);
          toast({ title: "Error", description: "Failed to fetch invoice details.", variant: "destructive" });
        } finally {
          setInvoice({ // Set invoice state
            ...fetchedInvoice,
            items: JSON.parse(fetchedInvoice?.items || '[]'),
            additionalCharges: JSON.parse(fetchedInvoice?.additionalCharges || '[]'),
          });
          setCustomer(fetchedCustomer);
          setCompanyBranding(fetchedCompanyBranding);
          setLoading(false);
          setLoadingCompanyBranding(false);
        }
      }
      loadInvoiceAndBranding();
    }
  }, [invoiceId, router, toast]); // Dependencies match invoiceId

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.put(`/invoices/${invoiceId}`, data); // Invoice API endpoint
      const updatedInvoice = response.data;

      setInvoice(updatedInvoice);

      if (updatedInvoice.customerId && updatedInvoice.customerId !== customer?.id) {
        const customerResponse = await axiosInstance.get(`/customers/${updatedInvoice.customerId}`);
        setCustomer(customerResponse.data);
      }

      toast({ title: "Success", description: "Invoice updated successfully." });
      router('/invoices'); // Redirect to invoices list
    } catch (error) {
      console.error("Failed to update invoice:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };


  // Remove handleConvertToInvoice for EditInvoicePage if it's not applicable
  // const handleConvertToInvoice = async () => { ... };

  const overallLoading = loading || loadingCompanyBranding;

  if (overallLoading) {
    return (
      <>
        <AppHeader title="Loading Invoice..." showBackButton> {/* Invoice title */}
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-24" />
        </AppHeader>
        <main className="flex-1 p-4 md:p-6">
          <FormSkeleton />
        </main>
      </>
    );
  }

  if (!invoice) { // Check invoice state
    return (
      <>
        <AppHeader title="Error" showBackButton />
        <main className="flex-1 p-4 md:p-6 text-center">Invoice not found or failed to load.</main>
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
      </div>
    );
  }

  return (
    <>
      {/* THIS IS THE FIX: Wrap all elements passed to AppHeader in a single div */}
      <AppHeader title={`Invoice ${invoice.invoiceNumber}`} showBackButton> {/* Invoice title */}
        <div className="flex items-center gap-2"> {/* This div is the single child */}
          <InvoicePreviewDialog // Use InvoicePreviewDialog
            invoiceId={invoice.id} // Pass invoice.id
            companyBranding={companyBranding}
            trigger={
              <Button variant="outline" disabled={isSubmitting}>
                <Eye className="mr-2 h-4 w-4" /> Preview
              </Button>
            }
          />
          {/* If the "Convert to Invoice" button existed on EditInvoicePage (which it usually wouldn't), it would also go here */}
          {/* <Button
            onClick={handleConvertToInvoice} // This button is typically only on Order Form pages
            disabled={isConverting || isSubmitting}
            className="ml-2"
          >
            <FileSignature className="mr-2 h-4 w-4" /> Convert to Invoice
          </Button> */}
          <Button variant="outline" asChild disabled={isSubmitting}>
            <Link to={`/invoices/${invoice.id}/terms`}> {/* Use Link 'to' prop and invoice path */}
              <FileEdit className="mr-2 h-4 w-4" /> T&C
            </Link>
          </Button>
        </div>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6">
        <InvoiceForm // Use InvoiceForm
          initialData={{
            ...invoice, // Use invoice data
            items: Array.isArray(invoice?.items) ? invoice.items : [],
            additionalCharges: Array.isArray(invoice?.additionalCharges) ? invoice.additionalCharges : [],
          }}
          onSubmit={handleSubmit}
        />
      </main>
    </>
  );
}

// FormSkeleton is generic and should be fine as is.
function FormSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-8 w-1/4 mb-4" />
          {[1, 2].map(i => (
            <div key={i} className="grid grid-cols-12 gap-x-4 gap-y-2 items-start p-3 border rounded-md">
              <Skeleton className="h-10 col-span-12 md:col-span-5" />
              <Skeleton className="h-10 col-span-4 md:col-span-2" />
              <Skeleton className="h-10 col-span-4 md:col-span-2" />
              <Skeleton className="h-10 col-span-4 md:col-span-2" />
              <Skeleton className="h-10 col-span-12 md:col-span-1" />
            </div>
          ))}
          <Skeleton className="h-10 w-32 mt-2" />
        </div>
      </div>
      <div className="lg:col-span-1 space-y-6">
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2 pt-2 border-t">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-8 w-full mt-2" />
          </div>
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      </div>
    </div>
  );
}