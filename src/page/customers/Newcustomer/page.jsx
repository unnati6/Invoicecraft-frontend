import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/layout/app-header';
import { CustomerForm } from '../../../components/Customer-form';
import { useToast } from '../../../hooks/use-toast';
import axios from 'axios'; 
import axiosInstance from '../../../lib/axiosInstance'; 
async function saveCustomer(data) {
  try {
    // ✅ Use axiosInstance instead of raw axios and BASE_URL
    const response = await axiosInstance.post('/customers', data);
    return response.data; // Axios returns the response data directly
  } catch (error) {
    console.error('Error saving customer:', error);
    // Rethrow to be caught in formAction
    throw error;
  }
}

export default function NewCustomerPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  React.useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) {
        window.location.replace('/');
      }
    };
  }, []);
  const formAction = async (data) => {
    console.log('FRONTEND DEBUG: formAction triggered from CustomerForm with data:', data);

    try {
      const result = await saveCustomer(data);

      if (result && result.id) {
        toast({ title: "Success", description: "Customer created successfully." });
        navigate(`/customers`);
      } else {
        toast({ title: "Error", description: "Failed to create customer. No valid ID returned.", variant: "destructive" });
      }
    } catch (error) {
      console.error("FRONTEND ERROR: Error during form submission:", error);

      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.error || error.response?.data?.message; // Check both 'error' and 'message' fields

        if (error.response?.status === 409 && backendMessage?.includes("already exists")) {
          toast({
            title: "Duplicate Email",
            description: "A customer with this email already exists for your account.", // Clarify it's for their account
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: backendMessage || "An unexpected error occurred during customer creation.",
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
