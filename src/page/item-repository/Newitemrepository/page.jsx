'use client';

import React, { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/layout/app-header';
import { RepositoryItemForm } from '../../../components/RepositoryItemForm';
import { useToast } from '../../../hooks/use-toast';
import axios from 'axios';
import axiosInstance from '../../../lib/axiosInstance';
async function saveRepositoryItem(data) {
  try {
    // ✅ Use axiosInstance instead of raw axios and BASE_URL
    const response = await axiosInstance.post('/item-route', data);
    return response.data; // Axios returns the response data here
  } catch (error) {
    console.error('Error saving repository item:', error);
    // Rethrow to be caught in handleSubmit with more detailed error
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to save repository item.';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while saving the item.');
  }
}


export default function NewRepositoryItemPage() {
 const navigate = useNavigate();
  const { toast } = useToast();
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
