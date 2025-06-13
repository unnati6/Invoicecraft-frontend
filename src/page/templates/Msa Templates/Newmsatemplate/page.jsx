'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../../components/ui/layout/app-header';
import { MsaTemplateForm } from '../../../../components/msa-template-form';
import { useToast } from '../../../../hooks/use-toast';
import { BASE_URL } from '../../../../lib/Api'; // Make sure this points to your backend base URL

export default function NewMsaTemplatePage() {
const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL}/msa-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "MSA Template created successfully.",
        });
        navigate('/msatemplate')
      } else {
        toast({
          title: "Error",
          description: "Failed to create MSA template. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to create MSA template:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="Create New MSA Template" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <MsaTemplateForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}
