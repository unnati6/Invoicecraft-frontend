import React, { useEffect, useState,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/layout/app-header';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { DataTable } from '../../../components/ui/DataTable';
import { DeleteConfirmationDialog } from '../../../components/delete-confirmation-dialog';
import { PlusCircle, Edit, Trash2, FileText, LayoutGrid, ListFilter, Eye } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { Skeleton } from '../../../components/ui/skeleton';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { TermsTemplatePreviewDialog } from '../../../components/terms-template-preview-dialog';
import axios from 'axios'; // Keep axios import for axios.isAxiosError
import axiosInstance from '../../../lib/axiosInstance'; // ✅ Import axiosInstance

export default function TermsTemplatesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('card');
  // Use useCallback for memoizing fetch function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ Use axiosInstance for authenticated GET request
      const res = await axiosInstance.get(`/terms-templates`);
      setTemplates(res.data || []); // Axios returns data in .data, add fallback to empty array
    } catch (error) {
      console.error('Fetch error:', error);
      let errorMessage = "Failed to fetch T&C templates.";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      setTemplates([]); // Ensure state is an array on error
    } finally {
      setLoading(false);
    }
  }, [toast]); // Dependencies for useCallback
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
    fetchData();
  }, [fetchData]); // Dependency array for useEffect

  // Use useCallback for memoizing delete function
  const handleDeleteTemplate = useCallback(async (id) => {
    try {
      // ✅ Use axiosInstance for authenticated DELETE request
      await axiosInstance.delete(`/terms-templates/${id}`);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast({ title: "Success", description: "Template deleted successfully." });
    } catch (error) {
      console.error('Delete failed:', error);
      let errorMessage = "Failed to delete template.";
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          errorMessage = 'Terms & Conditions Template not found.';
        } else if (error.response?.status === 409) {
          errorMessage = error.response?.data?.error || 'Template is linked with other records.';
        } else {
          errorMessage = error.response?.data?.message || error.message || errorMessage;
        }
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  }, [toast]); // Dependencies for useCallback


  const isValidDate = (date) => {
    return date && !isNaN(new Date(date).getTime());
  };

  const columns = [
    { accessorKey: 'name', header: 'Name', cell: (row) => row.name },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: (row) =>
        typeof row.createdAt === 'string' && isValidDate(row.createdAt)
          ? format(new Date(row.createdAt), 'PP')
          : 'N/A',
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-1">
          <TermsTemplatePreviewDialog
            template={row}
            trigger={
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Preview Template">
                <Eye className="h-4 w-4" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/term&condtion/${row.id}/edit`);
            }}
            title="Edit Template"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteConfirmationDialog
            onConfirm={() => handleDeleteTemplate(row.id)}
            itemName={`template "${row.name}"`}
            trigger={
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Delete Template">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
          />
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <>
        <AppHeader title="T&C Templates">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-10 w-36" />
          </div>
        </AppHeader>
        <main className="flex-1 p-4 md:p-6">
          <div className={`grid grid-cols-1 ${viewMode === 'card' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''} gap-6`}>
            {[...Array(viewMode === 'card' ? 3 : 5)].map((_, i) =>
              viewMode === 'card' ? (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                  </CardFooter>
                </Card>
              ) : (
                <Skeleton key={i} className="h-12 w-full" />
              )
            )}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="T&C Templates">
        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('card')} title="Card View">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} title="List View">
            <ListFilter className="h-4 w-4" />
          </Button>
          <Button onClick={() => navigate('/Addtermstemplate')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Template
          </Button>
        </div>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Templates Yet</h2>
            <p className="text-muted-foreground mb-4">Get started by creating your first reusable terms and conditions template.</p>
            <Button onClick={() => navigate('/templates/terms/new')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Template
            </Button>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="truncate" title={template.name}>{template.name}</CardTitle>
                  <CardDescription>
                    Created: {template.createdAt && typeof template.createdAt === 'string' ? format(new Date(template.createdAt), 'PP') : 'N/A'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow relative">
                  <ScrollArea className="h-48 w-full rounded-md border bg-muted/20 p-3 relative">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {template.content || "*No content*"}
                      </ReactMarkdown>
                    </div>
                  
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
                  <TermsTemplatePreviewDialog
                    template={template}
                    trigger={
                      <Button variant="ghost" size="icon" title="Preview Template" onClick={(e) => e.stopPropagation()}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/term&condtion/${template.id}/edit`)} title="Edit Template">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <DeleteConfirmationDialog
                    onConfirm={() => handleDeleteTemplate(template.id)}
                    itemName={`template "${template.name}"`}
                    trigger={
                      <Button variant="ghost" size="icon" title="Delete Template">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    }
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader><CardTitle>All T&C Templates</CardTitle></CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={templates}
                onRowClick={(row) => navigate(`/templates/terms/${row.id}/edit`)}
                noResultsMessage="No T&C templates found."
              />
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
