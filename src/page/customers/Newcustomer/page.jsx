

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/layout/app-header';
import { CustomerForm } from '../../../components/Customer-form';
import { useToast } from '../../../hooks/use-toast';
import axios from 'axios';
async function saveCustomer(data) {
  try {
    const response = await axios.post('http://localhost:5000/api/customers', data); // Replace URL if needed
    return response.data; // Axios returns the response data here
  } catch (error) {
    console.error('Error saving customer:', error);
    throw error; // rethrow to be caught in handleSubmit
  }
}

export default function NewCustomerPage() {
 const navigate = useNavigate();
  const { toast } = useToast();

  const formAction = async (data) => {
    console.log('FRONTEND DEBUG: formAction triggered from CustomerForm with data:', data);

    try {
      const result = await saveCustomer(data);

      if (result && result.id) {
        toast({ title: "Success", description: "Customer created successfully." });
        navigate(`/customers`);
        // router.push(`/customers/${result.id}/edit`);
      } else {
        toast({ title: "Error", description: "Failed to create customer. No valid ID returned.", variant: "destructive" });
      }
    }  catch (error) {
  console.error("FRONTEND ERROR: Error during form submission:", error);

  if (axios.isAxiosError(error)) {
    const backendMessage = error.response?.data?.error;

    if (error.response?.status === 409 && backendMessage?.includes("already exists")) {
      toast({
        title: "Duplicate Email",
        description: "A customer with this email already exists.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: backendMessage || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  } else {
    toast({
      title: "Error",
      description: "An unknown error occurred.",
      variant: "destructive",
    });
  }
}
  };

  return (
    <>
      <AppHeader title="Add New Customer" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <CustomerForm formAction={formAction} />
      </main>
    </>
  );
}
