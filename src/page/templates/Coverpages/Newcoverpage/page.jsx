
import * as React from 'react';
// import { useRouter } from 'next/navigation'; // Removed: Replaced with useNavigate
import { useNavigate } from 'react-router-dom'; // Added: Import useNavigate from react-router-dom
import { AppHeader } from '../../../../components/ui/layout/app-header';
import { CoverPageTemplateForm } from '../../../../components/coverpage-template-form';
// import type { CoverPageTemplateFormData } from '@/lib/schemas'; // Removed: Schema and related types removed
import { useToast } from '../../../../hooks/use-toast';
import axios from 'axios'; // Keep axios import for axios.isAxiosError
import axiosInstance from '../../../../lib/axiosInstance'; // ✅ Import axiosInstance

export default function NewCoverPageTemplatePage() {
  const navigate = useNavigate(); // Replaced useRouter with useNavigate
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  React.useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) {
        window.location.replace('/');
      }
    };
  }, []);
  // The 'data' parameter will now be a plain JavaScript object from the form fields.
 const handleSubmit = async (data) => { // Removed type annotation for data
    setIsSubmitting(true);
    try {
      // Assuming your backend API endpoint for saving a new cover page template
      // is POST /api/cover-page-templates.
      // ✅ Use axiosInstance for authenticated POST request
      const response = await axiosInstance.post('/cover-page-templates', data);

      const newTemplate = response.data; // Axios returns the created template data directly

      if (newTemplate && newTemplate.id) { // Ensure newTemplate and its ID exist
        toast({ title: "Success", description: "Cover Page Template created successfully." });
        navigate('/coverpage'); // Replaced router.push with navigate
      } else {
        // This 'else' might be hit if API returns 200 OK but no data or unexpected data.
        toast({ title: "Error", description: "Failed to create template. No valid ID returned.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to create template:", error);
      // More specific error handling for Axios errors
      let errorMessage = "An unexpected error occurred.";
      if (axios.isAxiosError(error)) {
        // Check for specific backend messages first, then Axios message
        errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || errorMessage;
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="Create New Cover Page Template" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <CoverPageTemplateForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}