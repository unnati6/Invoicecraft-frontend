import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AppHeader } from '../../../../components/ui/layout/app-header';
import { TermsTemplateForm } from '../../../../components/terms-template-form';
import { useToast } from '../../../../hooks/use-toast';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '../../../../components/ui/card';
import { BASE_URL } from '../../../../lib/Api';
// API CALLS (Replace with actual endpoints)
const fetchTermsTemplateById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/terms-templates/${id}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch (error) {
    console.error('Fetch Error:', error);
    return null;
  }
};

const saveTermsTemplate = async (data, id) => {
  try {
    const res = await fetch(`${BASE_URL}/terms-templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update');
    return await res.json();
  } catch (error) {
    console.error('Save Error:', error);
    return null;
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
