'use client';

import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../../components/ui/layout/app-header';
import { MsaTemplateForm } from '../../../../components/msa-template-form';
import { useToast } from '../../../../hooks/use-toast';
import axios from 'axios'; // Keep axios import for axios.isAxiosError
import axiosInstance from '../../../../lib/axiosInstance'; // ✅ Import axiosInstance
import { Skeleton } from '../../../../components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '../../../../components/ui/card';

export default function NewMsaTemplatePage() {
const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [coverPageTemplates, setCoverPageTemplates] = useState([]);
  const [loadingCoverPages, setLoadingCoverPages] = useState(true);
  const [fetchError, setFetchError] = useState(null);
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
    const loadCoverPageTemplates = async () => {
      setLoadingCoverPages(true);
      setFetchError(null);
      try {
        const response = await axiosInstance.get(`/cover-page-templates`);
        
        let extractedCoverPageTemplates = [];
        if (Array.isArray(response.data)) {
          extractedCoverPageTemplates = response.data;
        } else if (Array.isArray(response.data?.data)) {
          extractedCoverPageTemplates = response.data.data;
        } else if (Array.isArray(response.data?.items)) {
          extractedCoverPageTemplates = response.data.items;
        }
        setCoverPageTemplates(extractedCoverPageTemplates);
        console.log('Cover Page Templates fetched for New MSA:', extractedCoverPageTemplates);
      } catch (error) {
        console.error("Failed to load cover page templates for New MSA:", error);
        setFetchError(error);
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.message || error.message || "Could not load cover page templates.";
          if (error.response?.status === 401) {
            toast({ title: 'Unauthorized', description: 'Session expired or invalid. Please log in again.', variant: 'destructive' });
            navigate('/login');
          } else {
            toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
          }
        } else {
          toast({ title: 'Error', description: 'An unexpected error occurred while loading cover page templates.', variant: 'destructive' });
        }
      } finally {
        setLoadingCoverPages(false);
      }
    };

    loadCoverPageTemplates();
  }, [toast, navigate]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post('/msa-templates', data);

      const newTemplate = response.data;

      if (newTemplate && newTemplate.id) {
        toast({
          title: "Success",
          description: "MSA Template created successfully.",
        });
        navigate('/msatemplate');
      } else {
        toast({
          title: "Error",
          description: "Failed to create MSA template. No valid ID returned.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to create MSA template:", error);
      let errorMessage = "An unexpected error occurred.";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || errorMessage;
        if (error.response?.status === 409) {
          errorMessage = "An MSA template with this name might already exist.";
        } else if (error.response?.status === 401) {
          toast({ title: 'Unauthorized', description: 'Session expired or invalid. Please log in again.', variant: 'destructive' });
          navigate('/login');
          return;
        }
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingCoverPages) {
    return (
      <>
        <AppHeader title="Create New MSA Template" showBackButton />
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

  if (fetchError) {
    return (
      <>
        <AppHeader title="Error" showBackButton />
        <main className="flex-1 p-4 md:p-6 text-center">
          Failed to load cover page templates. Please try again.
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Create New MSA Template" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <MsaTemplateForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          coverPageTemplates={coverPageTemplates}
          isLoadingCoverPageTemplates={loadingCoverPages}
        />
      </main>
    </>
  );
}
