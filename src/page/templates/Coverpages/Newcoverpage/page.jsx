
import * as React from 'react';
// import { useRouter } from 'next/navigation'; // Removed: Replaced with useNavigate
import { useNavigate } from 'react-router-dom'; // Added: Import useNavigate from react-router-dom
import { AppHeader } from '../../../../components/ui/layout/app-header';
import { CoverPageTemplateForm } from '../../../../components/coverpage-template-form';
// import type { CoverPageTemplateFormData } from '@/lib/schemas'; // Removed: Schema and related types removed
import { useToast } from '../../../../hooks/use-toast';
import axios from 'axios'; // Added: Import axios for API calls
import { BASE_URL } from '../../../../lib/Api'; // Assuming BASE_URL is defined here

export default function NewCoverPageTemplatePage() {
  const navigate = useNavigate(); // Replaced useRouter with useNavigate
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // The 'data' parameter will now be a plain JavaScript object from the form fields.
  const handleSubmit = async (data) => { // Removed type annotation for data
    setIsSubmitting(true);
    try {
      // Assuming your backend API endpoint for saving a new cover page template
      // is POST /api/cover-page-templates.
      const response = await axios.post(`${BASE_URL}/cover-page-templates`, data);

      const newTemplate = response.data; // Assuming your backend returns the created template

      if (newTemplate) {
        toast({ title: "Success", description: "Cover Page Template created successfully." });
        navigate('/coverpage'); // Replaced router.push with navigate
      } else {
        // This 'else' might be hit if API returns 200 OK but no data or unexpected data.
        // It's good practice to ensure backend always returns a useful response on success.
        toast({ title: "Error", description: "Failed to create template. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to create template:", error);
      // More specific error handling for Axios errors
      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
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