'use client';

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../../components/ui/layout/app-header';
import { TermsTemplateForm } from '../../../../components/terms-template-form';
import { useToast } from '../../../../hooks/use-toast';
import axios from 'axios'; // Keep axios import for axios.isAxiosError
import axiosInstance from '../../../../lib/axiosInstance'; // ✅ Import axiosInstance

export default function NewTermsTemplatePage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
    const navigate = useNavigate();
    React.useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        window.onpopstate = () => {
          const token = localStorage.getItem('supabase.auth.token');
          if (!token) {
            window.location.replace('/');
          }
        };
      }, []);
   const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // ✅ Use axiosInstance for authenticated POST request
      const response = await axiosInstance.post('/terms-templates', data);

      // Axios automatically parses JSON and throws an error for non-2xx responses.
      const newTemplate = response.data; // The created template object

      if (newTemplate && newTemplate.id) { // Ensure the new template and its ID exist
        toast({ title: "Success", description: "T&C Template created successfully." });
        navigate('/term&condition'); // Navigate to the list page after success
      } else {
        // This case might occur if the backend returns a 2xx status but with unexpected data
        toast({
          title: "Error",
          description: "Failed to create template. No valid template ID returned.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to create template:", error);
      let errorMessage = "An unexpected error occurred.";
      if (axios.isAxiosError(error)) {
        // Use backend's error message if available, otherwise a generic one
        errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || errorMessage;
        // Optionally, handle specific HTTP status codes if needed
        if (error.response?.status === 409) {
          errorMessage = "A Terms & Conditions template with this name might already exist.";
        }
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
 return (
    <>
      <AppHeader title="Create New T&C Template" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <TermsTemplateForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}
