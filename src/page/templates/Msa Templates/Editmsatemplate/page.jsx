'use client';

import React, { useEffect, useState  } from 'react';
import { useNavigate ,useParams,useLocation } from 'react-router-dom';
import { AppHeader } from '../../../../components/ui/layout/app-header';
import { MsaTemplateForm } from '../../../../components/msa-template-form';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '../../../../components/ui/card';
import { useToast } from '../../../../hooks/use-toast';
import { BASE_URL } from '../../../../lib/Api';
export default function EditMsaTemplatePage() {
  const navigate = useNavigate();
  const params = useParams();
  const pathname = useLocation();
  const { toast } = useToast();

  const templateId = params.id;

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (templateId) {
      const loadTemplate = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${BASE_URL}/msa-templates/${templateId}`);
          if (!res.ok) throw new Error('Not found');
          const data = await res.json();
          setTemplate(data);
        } catch (error) {
          toast({ title: 'Error', description: 'MSA Template not found.', variant: 'destructive' });
          navigate('/msatemplate');
        } finally {
          setLoading(false);
        }
      };
      loadTemplate();
    }
  }, [templateId, navigate, toast, pathname]);

  const handleSubmit = async (data) => {
  setIsSubmitting(true);
  try {
    const sanitizedData = {
      ...data,
      coverPageTemplateId: data.coverPageTemplateId || null, // Explicitly null for None
    };

    const res = await fetch(`${BASE_URL}/msa-templates/${templateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedData),
    });

    if (!res.ok) throw new Error('Failed to update');
    toast({ title: 'Success', description: 'MSA Template updated successfully.' });
    navigate('/msatemplate');
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to update MSA template.',
      variant: 'destructive',
    });
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
        <MsaTemplateForm onSubmit={handleSubmit} initialData={template} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}
