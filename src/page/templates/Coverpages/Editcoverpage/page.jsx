import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AppHeader } from '../../../../components/ui/layout/app-header';
import { CoverPageTemplateForm } from '../../../../components/coverpage-template-form';
import { useToast } from '../../../../hooks/use-toast';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '../../../../components/ui/card';
import { BASE_URL } from '../../../../lib/Api';

export default function EditCoverPageTemplatePage() {
  const navigate = useNavigate();
  const { id: templateId } = useParams();
  const { pathname } = useLocation();
  const { toast } = useToast();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (templateId) {
      const fetchTemplate = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${BASE_URL}/cover-page-templates/${templateId}`);
          if (response.data) {
            setTemplate(response.data);
          } else {
            toast({ title: 'Error', description: 'Cover Page Template not found.', variant: 'destructive' });
            navigate('/templates/coverpages');
          }
        } catch (err) {
          toast({ title: 'Error', description: 'Failed to fetch template.', variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      };

      fetchTemplate();
    }
  }, [templateId, pathname, navigate, toast]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axios.put(`${BASE_URL}/cover-page-templates/${templateId}`, data);
      if (response.data) {
        toast({ title: 'Success', description: 'Template updated successfully.' });
        navigate('/coverpage');
      } else {
        toast({ title: 'Error', description: 'Failed to update template.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Update failed:', error);
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
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
