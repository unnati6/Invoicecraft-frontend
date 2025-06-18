'use client'; // This directive is typically for Next.js app router, can be removed if not using Next.js

import * as React from 'react';
import { AppHeader } from '../../../components/ui/layout/app-header';
import { OrderFormForm } from '../../../components/orderform-form';
// Removed: import type { OrderFormFormData } from '@/lib/schemas';
// Removed: import { saveOrderForm } from '@/lib/actions';
import { useToast } from '../../../hooks/use-toast';
import axiosInstance from '../../../lib/axiosInstance';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


// This is your main React component, equivalent to NewOrderFormPage
export default function NewOrderFormPage() {
  const router = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // The data parameter will be a plain JavaScript object now, no TypeScript type
  const handleSubmit = async (data) => {
  setIsSubmitting(true);
  try {
    console.log('Submitting data to backend:', data);

    // Use axiosInstance if it's already set up with baseURL
    const response = await axiosInstance.post('/order-forms', data);

    const newOrderForm = response.data;

    if (newOrderForm) {
      toast({ title: "Success", description: "Order Form created successfully." });
      router(`/order-forms`);
    } else {
      toast({
        title: "Error",
        description: "Failed to create order form. Please try again.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Failed to create order form:", error);
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
      <AppHeader title="Create New Order Form" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <OrderFormForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}