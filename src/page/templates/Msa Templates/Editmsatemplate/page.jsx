'use client';

import React, { useEffect, useState  } from 'react';
import { useNavigate ,useParams,useLocation } from 'react-router-dom';
import { AppHeader } from '../../../../components/ui/layout/app-header';
import { MsaTemplateForm } from '../../../../components/msa-template-form';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '../../../../components/ui/card';
import { useToast } from '../../../../hooks/use-toast';
import axiosInstance from '../../../../lib/axiosInstance';
export default function EditMsaTemplatePage() {
  const navigate = useNavigate();
  const params = useParams();
  const pathname = useLocation();
  const { toast } = useToast();

  const templateId = params.id;

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
   const [coverPageTemplates, setCoverPageTemplates] = useState([]); // Initialize as empty array
  const [fetchError, setFetchError] = useState(null); // Added to handle fetch errors more robustly
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) {
        window.location.replace('/');
      }
    };
  }, []);
  // useEffect for fetching template and cover page templates data
  useEffect(() => {
    if (!templateId) {
      toast({ title: 'Error', description: 'Invalid template ID.', variant: 'destructive' });
      navigate('/msatemplate');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setFetchError(null); // Clear previous errors
      try {
        // Use Promise.allSettled to handle individual fetch results
        const [templateRes, coverPageTemplatesRes] = await Promise.allSettled([
          axiosInstance.get(`/msa-templates/${templateId}`),
          axiosInstance.get(`/cover-page-templates`) // Assuming this is your endpoint for cover page templates
        ]);

        // Handle template response
        if (templateRes.status === 'fulfilled') {
          setTemplate(templateRes.value.data);
          // DEBUGGING: Log current MSA template's coverPageTemplateId
          console.log('Current MSA template coverPageTemplateId:', templateRes.value.data.coverPageTemplateId);
        } else {
          console.error("Error fetching MSA template:", templateRes.reason);
          setFetchError(templateRes.reason);
        }

        // Handle coverPageTemplates response
        if (coverPageTemplatesRes.status === 'fulfilled') {
          // DEBUGGING: Log the raw response data for cover page templates
          console.log('Raw coverPageTemplates API response:', coverPageTemplatesRes.value.data);

          let extractedCoverPageTemplates = [];
          if (Array.isArray(coverPageTemplatesRes.value.data)) {
            extractedCoverPageTemplates = coverPageTemplatesRes.value.data;
          } else if (Array.isArray(coverPageTemplatesRes.value.data?.data)) {
            extractedCoverPageTemplates = coverPageTemplatesRes.value.data.data;
          } else if (Array.isArray(coverPageTemplatesRes.value.data?.items)) {
            extractedCoverPageTemplates = coverPageTemplatesRes.value.data.items;
          }
          setCoverPageTemplates(extractedCoverPageTemplates);
          // DEBUGGING: Log coverPageTemplates array passed to form
          console.log('Cover Page Templates extracted and set:', extractedCoverPageTemplates);
        } else {
          console.error("Error fetching coverPageTemplates:", coverPageTemplatesRes.reason);
          setFetchError(coverPageTemplatesRes.reason);
        }

        // Consolidated Error Handling and Redirection
        if (templateRes.status === 'rejected' || coverPageTemplatesRes.status === 'rejected') {
          let error = templateRes.reason || coverPageTemplatesRes.reason; // Use the actual rejection reason
          if (error.response) {
            const { status, data } = error.response;
            const errorMessage = data.message || `Failed to load data.`;

            if (status === 401) {
              toast({ title: 'Unauthorized', description: 'Session expired or invalid. Please log in again.', variant: 'destructive' });
              navigate('/login');
            } else if (status === 404) {
              toast({ title: 'Error', description: 'One or more required templates not found.', variant: 'destructive' });
              navigate('/msatemplate');
            } else {
              toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
            }
          } else if (error.request) {
            toast({ title: 'Network Error', description: 'Could not connect to the server. Please check your internet connection.', variant: 'destructive' });
          } else {
            toast({ title: 'Error', description: 'An unexpected error occurred while loading data.', variant: 'destructive' });
          }
        }

      } catch (error) {
        console.error("An unhandled error occurred in loadData:", error);
        toast({ title: 'System Error', description: 'An unhandled error occurred while fetching data.', variant: 'destructive' });
        setFetchError(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [templateId, navigate, toast]);

  // handleSubmit for updating template data
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const sanitizedData = {
        ...data,
        coverPageTemplateId: data.coverPageTemplateId || null, // Explicitly null for None
      };

      const res = await axiosInstance.put(`/msa-templates/${templateId}`, sanitizedData);

      toast({ title: 'Success', description: 'MSA Template updated successfully.' });
      navigate('/msatemplate');
    } catch (error) {
      console.error("Error updating MSA template:", error);
      if (error.response) {
        const { status, data } = error.response;
        const errorMessage = data.message || 'Failed to update MSA template.';

        if (status === 401) {
          toast({ title: 'Unauthorized', description: 'Session expired or invalid. Please log in again.', variant: 'destructive' });
          navigate('/login');
        } else {
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      } else if (error.request) {
        toast({ title: 'Network Error', description: 'Could not connect to the server. Please check your internet connection.', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  if (loading) {
    return (
      <>
        <AppHeader title="Edit MSA Template" showBackButton />
        <main className="flex-1 p-4 md:p-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-28" />
            </CardFooter>
          </Card>
        </main>
      </>
    );
  }

  // Display specific error message if fetchError occurred
  if (fetchError) {
    return (
      <>
        <AppHeader title="Error" showBackButton />
        <main className="flex-1 p-4 md:p-6 text-center">
          Failed to load template data. Please try again.
          {/* You can add a retry button here if desired */}
        </main>
      </>
    );
  }

  if (!template) {
    return (
      <>
        <AppHeader title="Error" showBackButton />
        <main className="flex-1 p-4 md:p-6 text-center">MSA Template not found.</main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Edit MSA Template" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        {/* Pass coverPageTemplates and isLoadingCoverPageTemplates to MsaTemplateForm */}
        {template && Array.isArray(coverPageTemplates) && (
          <MsaTemplateForm
            onSubmit={handleSubmit}
            initialData={template}
            isSubmitting={isSubmitting}
            coverPageTemplates={coverPageTemplates} // Pass the fetched templates
            isLoadingCoverPageTemplates={loading} // Pass the loading state of this component
          />
        )}
      </main>
    </>
  );
}
