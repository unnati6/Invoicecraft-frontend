import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AppHeader } from '../../../../components/ui/layout/app-header';
import { CoverPageTemplateForm } from '../../../../components/coverpage-template-form';
import { useToast } from '../../../../hooks/use-toast';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '../../../../components/ui/card';
import axios from 'axios'; // Keep axios import for axios.isAxiosError
import axiosInstance from '../../../../lib/axiosInstance'; // ✅ Import axiosInstance


export default function EditCoverPageTemplatePage() {
  const navigate = useNavigate();
  const { id: templateId } = useParams();
  const { pathname } = useLocation();
  const { toast } = useToast();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) {
        window.location.replace('/');
      }
    };
  }, []);
  useEffect(() => {
    if (!templateId) { // Added check for templateId
      navigate('/coverpage'); // Redirect if no ID
      return;
    }

    const fetchTemplate = async () => {
      setLoading(true);
      try {
        // ✅ Use axiosInstance for authenticated GET request
        const response = await axiosInstance.get(`/cover-page-templates/${templateId}`);
        if (response.data) {
          setTemplate(response.data);
        } else {
          // If data is null/undefined but no error, means template might not exist
          toast({ title: 'Error', description: 'Cover Page Template not found.', variant: 'destructive' });
          navigate('/coverpage');
        }
      } catch (error) { // Changed 'err' to 'error' for consistency
        console.error('Failed to fetch template:', error);
        let errorMessage = 'Failed to fetch template.';
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            errorMessage = 'Cover Page Template not found or not accessible.';
          } else {
            errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || errorMessage;
          }
        }
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        navigate('/coverpage'); // Navigate on error
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId, pathname, navigate, toast]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // ✅ Use axiosInstance for authenticated PUT request
      const response = await axiosInstance.put(`/cover-page-templates/${templateId}`, data);
      if (response.data) {
        toast({ title: 'Success', description: 'Template updated successfully.' });
        navigate('/coverpage');
      } else {
        toast({ title: 'Error', description: 'Failed to update template. No valid data returned.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Update failed:', error);
      let errorMessage = 'An unexpected error occurred.';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || errorMessage;
      }
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (loading) {
    return (
      <>
        <AppHeader title="Edit Cover Page Template" showBackButton />
        <main className="flex-1 p-4 md:p-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-1/4 mb-2" />
              <Skeleton className="h-6 w-1/4 mb-2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-28" />
            </CardFooter>
          </Card>
        </main>
      </>
    );
  }

  if (!template) {
    return (
      <>
        <AppHeader title="Error" showBackButton />
        <main className="flex-1 p-4 md:p-6 text-center">Cover Page Template not found.</main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Edit Cover Page Template" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <CoverPageTemplateForm
          onSubmit={handleSubmit}
          initialData={template}
          isSubmitting={isSubmitting}
        />
      </main>
    </>
  );
}
