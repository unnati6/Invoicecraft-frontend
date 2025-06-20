
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/layout/app-header';
import { PurchaseOrderForm } from '../../../components/purchase-order-form';
import { useToast } from '../../../hooks/use-toast';
import { Skeleton } from '../../../components/ui/skeleton';
import axiosInstance from '../../../lib/axiosInstance';
export default function NewPurchaseOrderPage() {
  const router = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingPoNumber, setIsLoadingPoNumber] = React.useState(true); // Re-add
  const [poNumber, setPoNumber] = React.useState(''); // Re-add

  // Re-add the useEffect to fetch the next PO number
  React.useEffect(() => {
    async function loadNextPoNumber() {
      setIsLoadingPoNumber(true);
      try {
        // Fetch the next PO number from your new backend endpoint
        const response = await axiosInstance.get('/Purchaseorder/next-po-number'); // <--- Call your new backend endpoint
        setPoNumber(response.data.nextPoNumber);
      } catch (error) {
        console.error("Failed to fetch next PO number", error);
        toast({
          title: "Error",
          description: `Could not fetch next PO number: ${error.response?.data?.message || error.message}`,
          variant: "destructive"
        });
        setPoNumber('PO-ERROR'); // Fallback in case of error
      } finally {
        setIsLoadingPoNumber(false);
      }
    }
    loadNextPoNumber();
  }, [toast]); // Dependency array includes toast

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // For new POs, 'data' should NOT contain poNumber, as backend generates it.
      // The PurchaseOrderForm should already be handling this if `initialData` is not present.
      // However, it's good practice to ensure it's not sent if present by mistake.
      const { poNumber: clientPoNumber, ...dataToSend } = data; // Destructure to exclude poNumber if it somehow got in
      
      const response = await axiosInstance.post('/Purchaseorder', dataToSend);

      const newPurchaseOrder = response.data;

      if (newPurchaseOrder) {
        toast({ title: "Success", description: "Purchase Order created successfully." });
        router(`/purchaseorder`);
      } else {
        toast({
          title: "Error",
          description: "Failed to create Purchase Order. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to create Purchase Order:", error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.response?.data?.message || error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPoNumber) {
    return (
      <>
        <AppHeader title="Create New Purchase Order" showBackButton />
        <main className="flex-1 p-4 md:p-6">
          <Skeleton className="h-96 w-full" />
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Create New Purchase Order" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <PurchaseOrderForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          poNumber={poNumber} // Pass the fetched PO number to the form
        />
      </main>
    </>
  );
}