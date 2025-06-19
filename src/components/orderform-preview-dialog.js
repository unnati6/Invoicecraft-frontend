// components/orderform-preview-dialog.js
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { OrderFormPreviewContent } from './orderform-preview-content';
import axiosInstance from '../lib/axiosInstance';
import { useToast } from '../hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button'; // Re-added Button for error state

// API call functions
async function getOrderFormByIdApi(id) {
  try {
    const response = await axiosInstance.get(`/order-forms/${id}`);
    return response.data;
  } catch (error) {
    console.error(`API Error: Failed to fetch order form ${id}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch order form from server.");
  }
}

async function fetchCustomerByIdApi(id) {
  try {
    const response = await axiosInstance.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`API Error: Failed to fetch customer ${id}:`, error.response?.data || error.message);
    // If customer is optional or not found, we don't want to block the order form preview
    // So, we catch and return null instead of throwing, or re-throw if it's a critical error
    return null; // Return null if customer not found/error fetching
  }
}

export function OrderFormPreviewDialog({ orderFormId, trigger, companyBranding,coverPageTemplate,authToken }) {
  const { toast } = useToast();
  const [orderForm, setOrderForm] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isDialogOpen && orderFormId) {
      async function fetchData() {
        setLoading(true);
        setError(null);
        setOrderForm(null); // Clear previous data
        setCustomer(null); // Clear previous data

        try {
          // Fetch Order Form
          const fetchedOrderForm = await getOrderFormByIdApi(orderFormId);
          console.log("[OrderFormPreviewDialog] Fetched Order Form:", fetchedOrderForm); // Debug log
          setOrderForm(fetchedOrderForm);

          // Fetch Customer if customerId exists in the order form
          if (fetchedOrderForm && fetchedOrderForm.customerId) {
            const fetchedCustomer = await fetchCustomerByIdApi(fetchedOrderForm.customerId);
            console.log("[OrderFormPreviewDialog] Fetched Customer:", fetchedCustomer); // Debug log
            setCustomer(fetchedCustomer);
          } else {
            console.log("[OrderFormPreviewDialog] No customerId found for order form, or customer not fetched.");
          }

          // If orderForm is null after fetching, it indicates a problem
          if (!fetchedOrderForm) {
            setError("Order form data could not be retrieved from the server.");
            toast({
              title: "Error",
              description: "Order form data is empty. Please check the order form ID.",
              variant: "destructive",
            });
          }

        } catch (err) {
          console.error("Caught error in OrderFormPreviewDialog fetchData:", err); // Debug log
          setError(err.message || "Failed to load order form details. Please check your network and try again.");
          toast({
            title: "Error",
            description: err.message || "Could not load order form details for preview.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }
  }, [isDialogOpen, orderFormId, toast]);

  return (
    <Dialog onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="min-w-[80vw] max-w-[90vw] max-h-[90vh] overflow-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            <h3 className="text-xl font-semibold mb-4">Loading Order Form Preview...</h3>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h3 className="text-xl font-semibold text-destructive">Error Loading Order Form</h3>
            <p className="text-muted-foreground mt-2">{error}</p>
            <p className="text-muted-foreground">Please check your network connection and the order form's existence.</p>
            <Button onClick={() => setIsDialogOpen(false)} className="mt-4">Close</Button>
          </div>
        ) : orderForm ? ( // Only render content if orderForm data is available
          <OrderFormPreviewContent
            document={orderForm}
            customer={customer}
            companyBranding={companyBranding}
            coverPageTemplate={coverPageTemplate}
            authToken={localStorage.getItem('supabase_access_token')}
            // coverPageTemplate prop if applicable, you might need to fetch this here too
          />
        ) : ( // Fallback if orderForm is null/undefined after loading completes without explicit error
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h3 className="text-xl font-semibold">No Order Form Data Available</h3>
            <p className="text-muted-foreground mt-2">Could not retrieve order form details. It might have been deleted or does not exist.</p>
            <Button onClick={() => setIsDialogOpen(false)} className="mt-4">Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
    