import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AppHeader } from '../../../../components/ui/layout/app-header';
import { TermsTemplateForm } from '../../../../components/terms-template-form';
import { useToast } from '../../../../hooks/use-toast';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '../../../../components/ui/card';
import axios from 'axios'; // Keep axios import for axios.isAxiosError
import axiosInstance from '../../../../lib/axiosInstance'; // ✅ Import axiosInstance
const fetchTermsTemplateById = async (id) => {
  try {
    const response = await axiosInstance.get(`/terms-templates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch Error:', error);
    let errorMessage = 'Failed to fetch T&C template.';
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        errorMessage = 'T&C Template not found.';
      } else {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      }
    }
    throw new Error(errorMessage); // Re-throw with user-friendly message
  }
};

const saveTermsTemplate = async (data, id) => {
  try {
    const response = await axiosInstance.put(`/terms-templates/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Save Error:', error);
    let errorMessage = 'Failed to update T&C template.';
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message || errorMessage;
      if (error.response?.status === 409) {
        errorMessage = "A Terms & Conditions template with this name might already exist.";
      }
    }
    throw new Error(errorMessage); // Re-throw with user-friendly message
  }
};

export default function EditTermsTemplatePage() {
  const navigate = useNavigate();
  const { id: templateId } = useParams();
  const location = useLocation();
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
    if (templateId) {
      const loadTemplate = async () => {
        setLoading(true);
        const data = await fetchTermsTemplateById(templateId);
        if (data) {
          setTemplate(data);
        } else {
          toast({
            title: 'Error',
            description: 'T&C Template not found.',
            variant: 'destructive',
          });
          navigate('/term&condition');
        }
        setLoading(false);
      };
      loadTemplate();
    }
  }, [templateId, navigate, toast, location.pathname]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    const updatedTemplate = await saveTermsTemplate(data, templateId);
    if (updatedTemplate) {
      toast({ title: 'Success', description: 'T&C Template updated successfully.' });
      navigate('/term&condition');
    } else {
      toast({ title: 'Error', description: 'Failed to update template.', variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Edit T&C Template" showBackButton />
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

  if (!template) {
    return (
      <>
        <AppHeader title="Error" showBackButton />
        <main className="flex-1 p-4 md:p-6 text-center">T&C Template not found.</main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Edit T&C Template" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <TermsTemplateForm
          onSubmit={handleSubmit}
          initialData={template}
          isSubmitting={isSubmitting}
        />
      </main>
    </>
  );
}
