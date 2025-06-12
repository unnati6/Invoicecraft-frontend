'use client';

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../../components/ui/layout/app-header';
import { TermsTemplateForm } from '../../../../components/terms-template-form';
import { useToast } from '../../../../hooks/use-toast';
import { BASE_URL } from '../../../../lib/Api';
export default function NewTermsTemplatePage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
    const navigate = useNavigate();
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/terms-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast({ title: "Success", description: "T&C Template created successfully." });
        navigate('/term&condition');
      } else {
        const errorData = await res.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to create template.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to create template:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
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
