'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/layout/app-header';
import { RepositoryItemForm } from '../../../components/RepositoryItemForm';
import { useToast } from '../../../hooks/use-toast';
import axios from 'axios';

// Example inline implementation of saveRepositoryItem (you can replace this logic as needed)
async function saveRepositoryItem(data) {
  try {
    const response = await axios.post('http://localhost:5000/api/item-route', data); // Replace URL if needed
    return response.data; // Axios returns the response data here
  } catch (error) {
    console.error('Error saving repository item:', error);
    throw error; // rethrow to be caught in handleSubmit
  }
}

export default function NewRepositoryItemPage() {
 const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const newItem = await saveRepositoryItem(data); // create operation
      if (newItem) {
        toast({ title: 'Success', description: 'Repository Item created successfully.' });
        navigate('/item-repository');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create repository item. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to create repository item:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="Create New Repository Item" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <RepositoryItemForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}
