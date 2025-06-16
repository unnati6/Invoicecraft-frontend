import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/layout/app-header';
import { Button } from '../../../components/ui/button';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { PlusCircle, Edit, Trash2, FileCheck2, LayoutGrid, ListFilter, Eye } from 'lucide-react';
import { DeleteConfirmationDialog } from '../../../components/delete-confirmation-dialog';
import { MsaTemplatePreviewDialog } from '../../../components/msa-template-preview-dialog';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import axios from 'axios';
import axiosInstance from '../../../lib/axiosInstance';
import { useToast } from '../../../hooks/use-toast';

export default function MsaTemplatesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [coverPages, setCoverPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('card');
  const [linkingCoverPage, setLinkingCoverPage] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [msaRes, coverPageRes] = await Promise.all([
        axiosInstance.get(`/msa-templates`),
        axiosInstance.get(`/cover-page-templates`)
      ]);

     setTemplates(msaRes.data);
        setCoverPages(coverPageRes.data);
         } catch (error) {
      console.error('Fetch error:', error);
      let errorMessage = 'Failed to fetch MSA templates or Cover Pages.';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      }
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    
    } finally {
      setLoading(false);
    }
  }, [toast]);
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
  }, [fetchData]);

  const handleDeleteTemplate = async (id) => {
    try {
      await axiosInstance.delete(`/msa-templates/${id}`);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast({ title: "Success", description: "Template deleted successfully." });
    } catch (error) {
      console.error('Delete failed:', error);
      let errorMessage = 'Failed to delete template.';
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          errorMessage = 'MSA Template not found.';
        } else if (error.response?.status === 409) {
          errorMessage = error.response?.data?.error || 'Template is linked with other records.';
        } else {
          errorMessage = error.response?.data?.message || error.message || errorMessage;
        }
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  // const handleLinkCoverPage = useCallback(async (msaId, coverPageId) => {
  //   setLinkingCoverPage(msaId);
  //   try {
  //     const response = await axiosInstance.put(`/msa-templates/${msaId}`, { coverPageTemplateId: coverPageId });
  //     const updatedTemplate = response.data;

  //     setTemplates(prev => prev.map(t => t.id === msaId ? updatedTemplate : t));
  //     toast({ title: "Success", description: `Cover page linked to ${updatedTemplate.name}.` });
  //   } catch (error) {
  //     console.error('Link error', error);
  //     let errorMessage = 'Failed to link cover page.';
  //     if (axios.isAxiosError(error)) {
  //       errorMessage = error.response?.data?.message || error.message || errorMessage;
  //     }
  //     toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
  //   } finally {
  //     setLinkingCoverPage(null);
  //   }
  // }, [toast]);

 const getCoverPageName = (id) => {
    if (!id) return 'None';
    return coverPages.find(cp => cp.id === id)?.name || 'Unknown';
  };

  if (loading) {
    return (
      <>
        <AppHeader title="MSA Templates">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-10 w-44" />
          </div>
        </AppHeader>
        <main className="flex-1 p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-6 w-3/4 mb-1" /><Skeleton className="h-4 w-1/2" /></CardHeader>
                <CardContent><Skeleton className="h-32 w-full" /></CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="MSA Templates">
        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('card')} title="Card View"><LayoutGrid className="h-4 w-4" /></Button>
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} title="List View"><ListFilter className="h-4 w-4" /></Button>
          <Button onClick={() => navigate('/Addmsatemplate')}><PlusCircle className="mr-2 h-4 w-4" /> Create MSA Template</Button>
        </div>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <FileCheck2 className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No MSA Templates Yet</h2>
            <p className="text-muted-foreground mb-4">Create your first reusable Master Service Agreement template.</p>
            <Button onClick={() => navigate('/Addmsatemplate')}><PlusCircle className="mr-2 h-4 w-4" /> Create Your First MSA Template</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <MsaTemplatePreviewDialog
                key={template.id}
                template={template}
                coverPageTemplate={Array.isArray(coverPages) ? coverPages.find(cp => cp.id === template.coverPageTemplateId) : null}
                trigger={
                  <Card key={template.id} className="flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="truncate" title={template.name}>{template.name}</CardTitle>
                      <CardDescription>Created: {format(new Date(template.createdAt), 'PP')}</CardDescription>
                      <CardDescription>Cover Page: {getCoverPageName(template.coverPageTemplateId)}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow relative">
                      <ScrollArea className="h-48 w-full rounded-md border bg-muted/20 p-3 relative">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {template.content || '*No content*'}
                          </ReactMarkdown>
                        </div>
                      </ScrollArea>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
                      <MsaTemplatePreviewDialog
                        template={template}
                        trigger={
                          <Button variant="ghost" size="icon" title="Preview MSA" onClick={(e) => e.stopPropagation()}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/msatemp/${template.id}/edit`);
                        }}
                        title="Edit MSA Template"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeleteConfirmationDialog
                        onConfirm={() => handleDeleteTemplate(template.id)}
                        itemName={`MSA template "${template.name}"`}
                        trigger={
                          <Button variant="ghost" size="icon" title="Delete MSA Template" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        }
                      />
                    </CardFooter>
                  </Card>
                }
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
