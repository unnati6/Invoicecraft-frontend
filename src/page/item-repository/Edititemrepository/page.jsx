import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/layout/app-header';
import { RepositoryItemForm } from '../../../components/RepositoryItemForm';
import { useToast } from '../../../hooks/use-toast';
import { Skeleton } from '../../../components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '../../../components/ui/card';
import axios from 'axios';
import { BASE_URL } from '../../../lib/Api';
const API_URL = `${BASE_URL}/item-route`;

const fetchRepositoryItemById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

const saveRepositoryItem = async (data, id) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export default function EditRepositoryItemPage() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const itemId = params.id;
  const { toast } = useToast();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemId) {
      async function loadItem() {
        setLoading(true);
        try {
          const data = await fetchRepositoryItemById(itemId);
          if (data) {
            setItem(data);
          } else {
            toast({
              title: "Error",
              description: "Repository Item not found.",
              variant: "destructive",
            });
            navigate('/item-repository');
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to fetch repository item details.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
      loadItem();
    }
  }, [itemId, navigate, toast, location.pathname]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const updatedItem = await saveRepositoryItem(data, itemId);
      if (updatedItem) {
        toast({
          title: "Success",
          description: "Repository Item updated successfully.",
        });
        navigate('/item-repository');
      } else {
        toast({
          title: "Error",
          description: "Failed to update repository item.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update repository item:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Edit Repository Item" showBackButton />
        <main className="flex-1 p-4 md:p-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-28" />
            </CardFooter>
          </Card>
        </main>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <AppHeader title="Error" showBackButton />
        <main className="flex-1 p-4 md:p-6 text-center">
          Repository Item not found.
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Edit Repository Item" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <RepositoryItemForm
          onSubmit={handleSubmit}
          initialData={item}
          isSubmitting={isSubmitting}
        />
      </main>
    </>
  );
}
