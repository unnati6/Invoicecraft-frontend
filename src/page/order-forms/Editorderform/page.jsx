
import * as React from 'react';
import { useParams,useNavigate } from 'react-router-dom';

import { AppHeader } from '../../../components/ui/layout/app-header';
import { OrderFormForm } from '../../../components/orderform-form';
// REMOVED: type { OrderFormFormData } from '@/lib/schemas'; // Schema for validation, will be replaced by React's validation
// REMOVED: import { fetchOrderFormById, saveOrderForm, fetchCustomerById, convertOrderFormToInvoice } from '@/lib/actions'; // These actions will be replaced by backend calls
import { useToast } from '../../../hooks/use-toast';
// REMOVED: type { OrderForm, Customer } from '@/types'; // Types removed
import { Button } from '../../../components/ui/button';
import { OrderFormPreviewDialog } from '../../../components/orderform-preview-dialog';
import { Eye, FileEdit, FileSignature } from 'lucide-react';
import { Skeleton } from '../../../components/ui/skeleton';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../lib/axiosInstance';
import axios from 'axios';


// REMOVED: import { BrandingSettingsFormData as BrandingSettings } from '@/lib/schemas'; // Schema for branding, types removed
// REMOVED: import { getBrandingSettings } from '@/lib/actions'; // Branding action, will be replaced by backend call

export default function EditOrderFormPage() {
  const router = useNavigate();
  const params = useParams();

  const orderFormId = params.id; // Type assertion removed
  const { toast } = useToast();

  const [orderForm, setOrderForm] = React.useState(null); // Type removed
  const [customer, setCustomer] = React.useState(undefined); // Type removed
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isConverting, setIsConverting] = React.useState(false);

  const [companyBranding, setCompanyBranding] = React.useState(null); // Type removed
  const [loadingCompanyBranding, setLoadingCompanyBranding] = React.useState(true);
  const [companyBrandingError, setCompanyBrandingError] = React.useState(null);

  React.useEffect(() => {
    if (orderFormId) {
      async function loadOrderFormAndBranding() {
        setLoading(true);
        setLoadingCompanyBranding(true);

        let fetchedOrderForm = null;
        let fetchedCustomer = undefined;
        let fetchedCompanyBranding = null;

        try {
          console.log("Simulating fetching Order Form Data from backend...");
          fetchedOrderForm = (await axiosInstance.get(`/order-forms/${orderFormId}`)).data;
        console.log("Fetched Order Form Data:", fetchedOrderForm);

          if (fetchedOrderForm) {
            if (fetchedOrderForm.customerId) {
              // Placeholder for fetching Customer Data from backend
              console.log("Simulating fetching Customer Data from backend...");
             fetchedCustomer = fetchedOrderForm.customerId
  ? (await axiosInstance.get(`/customers/${fetchedOrderForm.customerId}`)).data
  : undefined;

            }
          } else {
            toast({ title: "Error", description: "Order Form not found.", variant: "destructive" });
            router('/order-forms');
            return;
          }

          // Placeholder for fetching Company Branding Data from backend
          console.log("Simulating fetching Company Branding Data from backend...");
          try {
            fetchedCompanyBranding =  (await axiosInstance.get('/branding-settings')).data;
              
            console.log("Fetched Branding Data:", fetchedCompanyBranding);
          } catch (brandingErr) {
            console.error("Error fetching company branding:", brandingErr);
            setCompanyBrandingError("Failed to load company branding information.");
            toast({ title: "Error", description: "Failed to load company branding.", variant: "destructive" });
          }
          // --- END BACKEND DATA REPLACEMENT ---

        } catch (error) {
          console.error("Failed to fetch order form details:", error);
          toast({ title: "Error", description: "Failed to fetch order form details.", variant: "destructive" });
        } finally {
         setOrderForm({
  ...fetchedOrderForm,
  items: JSON.parse(fetchedOrderForm.items || '[]'),
  additionalCharges: JSON.parse(fetchedOrderForm.additionalCharges || '[]'),
});
          setCustomer(fetchedCustomer);
          setCompanyBranding(fetchedCompanyBranding);
          setLoading(false);
          setLoadingCompanyBranding(false);
        }
      }
      loadOrderFormAndBranding();
    }
  }, [orderFormId, router, toast]);

const handleSubmit = async (data) => {
  setIsSubmitting(true);
  try {
    const response = await axiosInstance.put(`/order-forms/${orderFormId}`, data);
    const updatedOrderForm = response.data;

    setOrderForm(updatedOrderForm);

    if (updatedOrderForm.customerId && updatedOrderForm.customerId !== customer?.id) {
      const customerResponse = await axiosInstance.get(`/customers/${updatedOrderForm.customerId}`);
      setCustomer(customerResponse.data);
    }

    toast({ title: "Success", description: "Order Form updated successfully." });
    router('/order-forms');
  } catch (error) {
    console.error("Failed to update order form:", error);
    toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
  } finally {
    setIsSubmitting(false);
  }
};

  const handleConvertToInvoice = async () => {
    if (!orderForm) return;
    setIsConverting(true);
    try {
      // --- BEGIN BACKEND CONVERSION REPLACEMENT ---
      console.log("Simulating converting Order Form to Invoice on backend for ID:", orderForm.id);
      const newInvoice = await new Promise(resolve => setTimeout(() => {
        // Replace this with actual backend call (e.g., POST /api/invoices/convert-from-orderform)
        console.log("Backend conversion successful, returning new invoice mock.");
        resolve({ id: 'invoice123', invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`, orderFormId: orderForm.id }); // Mock return
      }, 2000));
      // --- END BACKEND CONVERSION REPLACEMENT ---

      if (newInvoice) {
        toast({ title: "Success", description: `Invoice ${newInvoice.invoiceNumber} created from order form.` });
        router(`/invoices/${newInvoice.id}`);
      } else {
        toast({ title: "Error", description: "Failed to convert order form to invoice.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to convert order form:", error);
      toast({ title: "Error", description: "An unexpected error occurred during conversion.", variant: "destructive" });
    } finally {
      setIsConverting(false);
    }
  };

  // Combine loading states
  const overallLoading = loading || loadingCompanyBranding;

  if (overallLoading) {
    return (
      <>
        <AppHeader title="Loading Order Form..." showBackButton>
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

  if (!orderForm) {
    return (
      <>
        <AppHeader title="Error" showBackButton />
        <main className="flex-1 p-4 md:p-6 text-center">Order Form not found or failed to load.</main>
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
      <AppHeader title={`Order Form ${orderForm.orderFormNumber}`} showBackButton>
        <OrderFormPreviewDialog
          orderFormId={orderForm.id}
          companyBranding={companyBranding}
          trigger={
            <Button variant="outline" disabled={isConverting || isSubmitting}>
              <Eye className="mr-2 h-4 w-4" /> Preview
            </Button>
          }
        />
        {/* Placeholder for Convert to Invoice button if it was needed */}
        {/* <Button
          onClick={handleConvertToInvoice}
          disabled={isConverting || isSubmitting}
          className="ml-2"
        >
          <FileSignature className="mr-2 h-4 w-4" /> Convert to Invoice
        </Button> */}
        <Button variant="outline" asChild disabled={isConverting || isSubmitting}>
          <Link href={`/orderforms/${orderForm.id}/terms`}>
            <FileEdit className="mr-2 h-4 w-4" /> T&C
          </Link>
        </Button>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6">
  <OrderFormForm initialData={{
  ...orderForm,
  items: Array.isArray(orderForm?.items) ? orderForm.items : [],
  additionalCharges: Array.isArray(orderForm?.additionalCharges) ? orderForm.additionalCharges : [],
}} 
 onSubmit={handleSubmit}
 />
      </main>
    </>
  );
}

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