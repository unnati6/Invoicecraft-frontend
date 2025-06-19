// components/invoice-preview-dialog.js
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { InvoicePreviewContent } from './invoice-preview-content';// Changed to InvoicePreviewContent
import axiosInstance from '../lib/axiosInstance';
import { useToast } from '../hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';

// API call functions
async function getInvoiceByIdApi(id) { // Changed function name
  try {
    const response = await axiosInstance.get(`/invoices/${id}`); // Changed endpoint
    return response.data;
  } catch (error) {
    console.error(`API Error: Failed to fetch invoice ${id}:`, error.response?.data || error.message); // Message changed
    throw new Error(error.response?.data?.message || "Failed to fetch invoice from server."); // Message changed
  }
}

async function fetchCustomerByIdApi(id) {
  try {
    const response = await axiosInstance.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`API Error: Failed to fetch customer ${id}:`, error.response?.data || error.message);
    return null;
  }
}

// NOTE: The `coverPageTemplate` prop passed from OrderFormsPage might not be directly relevant for Invoices unless you also have
// a cover page concept for invoices. If not, consider removing it from the props and usage in InvoicePreviewContent.
export function InvoicePreviewDialog({ invoiceId, trigger, companyBranding, coverPageTemplate, authToken }) { // Changed component name and prop name
  const { toast } = useToast();
  const [invoice, setInvoice] = useState(null); // Changed state name
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isDialogOpen && invoiceId) { // Changed prop name
      async function fetchData() {
        setLoading(true);
        setError(null);
        setInvoice(null); // Clear previous data
        setCustomer(null); // Clear previous data

        try {
          // Fetch Invoice
          const fetchedInvoice = await getInvoiceByIdApi(invoiceId); // Changed function call and prop name
          console.log("[InvoicePreviewDialog] Fetched Invoice:", fetchedInvoice); // Debug log and message changed
          setInvoice(fetchedInvoice); // State updated

          // Fetch Customer if customerId exists in the invoice
          if (fetchedInvoice && fetchedInvoice.customerId) {
            const fetchedCustomer = await fetchCustomerByIdApi(fetchedInvoice.customerId);
            console.log("[InvoicePreviewDialog] Fetched Customer:", fetchedCustomer); // Debug log and message changed
            setCustomer(fetchedCustomer);
          } else {
            console.log("[InvoicePreviewDialog] No customerId found for invoice, or customer not fetched."); // Message changed
          }

          // If invoice is null after fetching, it indicates a problem
          if (!fetchedInvoice) {
            setError("Invoice data could not be retrieved from the server."); // Message changed
            toast({
              title: "Error",
              description: "Invoice data is empty. Please check the invoice ID.", // Message changed
              variant: "destructive",
            });
          }

        } catch (err) {
          console.error("Caught error in InvoicePreviewDialog fetchData:", err); // Debug log and message changed
          setError(err.message || "Failed to load invoice details. Please check your network and try again."); // Message changed
          toast({
            title: "Error",
            description: err.message || "Could not load invoice details for preview.", // Message changed
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }
  }, [isDialogOpen, invoiceId, toast]); // Changed prop name in dependency array

  return (
    <Dialog onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="min-w-[80vw] max-w-[90vw] max-h-[90vh] overflow-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            <h3 className="text-xl font-semibold mb-4">Loading Invoice Preview...</h3> {/* Message changed */}
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h3 className="text-xl font-semibold text-destructive">Error Loading Invoice</h3> {/* Message changed */}
            <p className="text-muted-foreground mt-2">{error}</p>
            <p className="text-muted-foreground">Please check your network connection and the invoice's existence.</p> {/* Message changed */}
            <Button onClick={() => setIsDialogOpen(false)} className="mt-4">Close</Button>
          </div>
        ) : invoice ? ( // Only render content if invoice data is available
          <InvoicePreviewContent // Changed to InvoicePreviewContent
            document={invoice} // Changed prop
            customer={customer}
            companyBranding={companyBranding}
            coverPageTemplate={coverPageTemplate} // Keep if invoices can have cover pages
            authToken={localStorage.getItem('supabase_access_token')} // Pass the authToken
          />
        ) : ( // Fallback if invoice is null/undefined after loading completes without explicit error
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h3 className="text-xl font-semibold">No Invoice Data Available</h3> {/* Message changed */}
            <p className="text-muted-foreground mt-2">Could not retrieve invoice details. It might have been deleted or does not exist.</p> {/* Message changed */}
            <Button onClick={() => setIsDialogOpen(false)} className="mt-4">Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}