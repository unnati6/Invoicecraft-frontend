'use client'; // This directive is typically for Next.js app router, can be removed if not using Next.js

import * as React from 'react';
import { AppHeader } from '../../../components/ui/layout/app-header';
import { InvoiceForm } from '../../../components/invoice-form';
// Removed: import type { OrderFormFormData } from '@/lib/schemas';
// Removed: import { saveOrderForm } from '@/lib/actions';
import { useToast } from '../../../hooks/use-toast';
import axiosInstance from '../../../lib/axiosInstance';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const NO_MSA_TEMPLATE_SELECTED = "_no_msa_template_";


// This is your main React component, equivalent to NewOrderFormPage
export default function NewInvoicePage() {
  const router = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // The data parameter will be a plain JavaScript object now, no TypeScript type
  const handleSubmit = async (data) => {
  setIsSubmitting(true);
  try {
     const payload = {
        ...data, // Spread all existing form data
        // Conditionally set linkedMsaTemplateId to null if it matches the "no MSA" placeholder
        linkedMsaTemplateId: data.linkedMsaTemplateId === NO_MSA_TEMPLATE_SELECTED
                              ? null
                              : data.linkedMsaTemplateId,
            };

    console.log('Submitting data to backend:', payload);

    // Use axiosInstance if it's already set up with baseURL
    const response = await axiosInstance.post('/invoices', payload);

    const newOrderForm = response.data;

    if (newOrderForm) {
      toast({ title: "Success", description: "Invoice created successfully." });
      router(`/invoices`);
    } else {
      toast({
        title: "Error",
        description: "Failed to create Invoice. Please try again.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Failed to create Invoice:", error);
    toast({
      title: "Error",
      description: `An error occurred: ${error.response?.data?.message || error.message}`,
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <>
      {/* AppHeader component path remains the same */}
      <AppHeader title="Create Invoice" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <InvoiceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}