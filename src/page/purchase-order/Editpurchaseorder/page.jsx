// This file is for a standard React.js application, not Next.js
// Make sure you have react-router-dom installed: npm install react-router-dom

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // useLocation removed as it's not needed for this logic
import { AppHeader } from '../../../components/ui/layout/app-header';
import { PurchaseOrderForm } from '../../../components/purchase-order-form';
import { useToast } from '../../../hooks/use-toast';
import { Skeleton } from '../../../components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as ShadCNDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Edit, Printer } from 'lucide-react';
import axiosInstance from '../../../lib/axiosInstance';
import { format } from 'date-fns';

// JSDoc type definitions for clarity, replacing TypeScript interfaces
/**
 * @typedef {Object} PurchaseOrderItem
 * @property {string} description
 * @property {number} quantity
 * @property {number} procurementPrice
 * @property {string} [id] // Optional, for existing items
 */

/**
 * @typedef {Object} PurchaseOrder
 * @property {string} id
 * @property {string} poNumber
 * @property {string} vendorName
 * @property {string} issueDate // Backend might return string, we convert to Date for form
 * @property {PurchaseOrderItem[]} items
 * @property {'Draft' | 'Issued' | 'Fulfilled' | 'Cancelled'} status
 * @property {string} currencyCode
 * @property {string | null} orderFormId
 * @property {string | null} orderFormNumber
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {number} totalAmount
 * @property {string} userId
 */

/**
 * @typedef {Object} PurchaseOrderFormData
 * @property {string} poNumber
 * @property {string} vendorName
 * @property {Date} issueDate
 * @property {PurchaseOrderItem[]} items
 * @property {string} status
 * @property {string} currencyCode
 * @property {string | null} orderFormId
 * @property {string | null} orderFormNumber
 */


export default function ViewEditPurchaseOrderPage() {
  const navigate = useNavigate();
  const { id: poId } = useParams();
  const { toast } = useToast();

  const [purchaseOrder, setPurchaseOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Set isEditMode to true by default to always open in edit mode
  const [isEditMode, setIsEditMode] = React.useState(true); // <-- Changed here

  React.useEffect(() => {
    if (poId) {
      async function loadPurchaseOrder() {
        setLoading(true);
        try {
          // Corrected API path based on previous discussions: `/api/purchase-orders`
          const response = await axiosInstance.get(`/Purchaseorder/${poId}`);
          const data = response.data;

          if (data) {
            const formattedData = {
              ...data,
              issueDate: new Date(data.issueDate),
              items: data.items.map(item => ({
                ...item,
                quantity: Number(item.quantity),
                procurementPrice: Number(item.procurementPrice)
              }))
            };
            setPurchaseOrder(formattedData);
            // Removed the conditional setting of isEditMode based on status.
            // This page will now ALWAYS be in edit mode.
            // if (formattedData.status === 'Draft') {
            //   setIsEditMode(true);
            // }
          } else {
            toast({ title: "Error", description: "Purchase Order not found.", variant: "destructive" });
            navigate('/purchaseorder');
          }
        } catch (error) {
          console.error("Failed to fetch purchase order details:", error);
          toast({
            title: "Error",
            description: `Failed to fetch purchase order details: ${error.response?.data?.message || error.message}`,
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      }
      loadPurchaseOrder();
    }
  }, [poId, navigate, toast]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const dataToSend = {
        ...data,
        issueDate: data.issueDate ? data.issueDate.toISOString() : null,
        items: data.items.map(item => ({
            ...item,
            quantity: Number(item.quantity),
            procurementPrice: Number(item.procurementPrice)
        }))
      };

      // Corrected API path based on previous discussions: `/api/purchase-orders`
      const response = await axiosInstance.put(`/Purchaseorder/${poId}`, dataToSend);
      const updatedPurchaseOrder = response.data;

      if (updatedPurchaseOrder) {
        setPurchaseOrder({
            ...updatedPurchaseOrder,
            issueDate: new Date(updatedPurchaseOrder.issueDate),
            items: updatedPurchaseOrder.items.map(item => ({
                ...item,
                quantity: Number(item.quantity),
                procurementPrice: Number(item.procurementPrice)
            }))
        });
        // After successful save, you can choose to stay on the edit page (setIsEditMode(true))
        // or navigate back to the list page.
        // As per your request, we navigate back to the list after saving.
        toast({ title: "Success", description: "Purchase Order updated successfully." });
        navigate('/purchaseorder');
      } else {
        toast({ title: "Error", description: "Failed to update Purchase Order.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update Purchase Order:", error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.response?.data?.message || error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    toast({ title: "Print (Prototype)", description: "Printing functionality is not yet implemented." });
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Loading Purchase Order..." showBackButton />
        <main className="flex-1 p-4 md:p-6">
          <Skeleton className="h-[500px] w-full" />
        </main>
      </>
    );
  }

  if (!purchaseOrder) {
    return (
      <>
        <AppHeader title="Error" showBackButton />
        <main className="flex-1 p-4 md:p-6 text-center">Purchase Order not found.</main>
      </>
    );
  }

  // Page title will always reflect 'Edit Purchase Order'
  const pageTitle = `Edit Purchase Order: ${purchaseOrder.poNumber}`;

  return (
    <>
      <AppHeader title={pageTitle} showBackButton>
        {/* The 'Edit PO' button that switches from view to edit mode is removed */}
        {/* because this page is now always in edit mode. */}
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Print PO
        </Button>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6">
        <PurchaseOrderForm
          onSubmit={handleSubmit}
          initialData={purchaseOrder}
          isSubmitting={isSubmitting}
          poNumber={purchaseOrder.poNumber}
          isViewMode={false} // <-- Always set to false, indicating it's an edit form
        />
      </main>
    </>
  );
}