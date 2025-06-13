import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/layout/app-header';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { DataTable } from '../../../components/ui/DataTable';
import { DeleteConfirmationDialog } from '../../../components/delete-confirmation-dialog';
import { PlusCircle, Edit, Trash2, FileCheck2, LayoutGrid, ListFilter, Link2, Link2Off, Eye } from 'lucide-react';
import { Skeleton } from '../../../components/ui/skeleton';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import { MsaTemplatePreviewDialog } from '../../../components/msa-template-preview-dialog';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import axios from 'axios';
import { BASE_URL } from '../../../lib/Api';
import { useToast } from '../../../hooks/use-toast';
export default function MsaTemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [coverPages, setCoverPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('card');
  const [linkingCoverPage, setLinkingCoverPage] = useState(null);
    const { toast } =useToast();
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [msaRes, coverPageRes] = await Promise.all([
          axios.get(`${BASE_URL}/msa-templates`),
          axios.get(`${BASE_URL}/cover-page-templates`)
        ]);
        setTemplates(msaRes.data);
        setCoverPages(coverPageRes.data);
      } catch (err) {
        console.error('Fetch error', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

const handleDeleteTemplate = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/msa-templates/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast({ title: "Success", description: "Template deleted successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete template.", variant: "destructive" });
    }
  };

//   const handleLinkCoverPage = async (id) => {
//     const msaId = id;
//     setLinkingCoverPage(msaId);
//     try {
//       const res = await axios.put(`/api/msa-templates/${msaId}`);
//       const updated = res.data;
//       setTemplates(prev => prev.map(t => t.id === msaId ? updated : t));
//     } catch (err) {
//       console.error('Link error', err);
//     } finally {
//       setLinkingCoverPage(null);
//     }
//   };

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
                coverPageTemplate={coverPages.find(cp => cp.id === template.coverPageTemplateId)}
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
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{template.content || '*No content*'}</ReactMarkdown>
      </div>
    </ScrollArea>
  </CardContent>
  <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
    {/* 👁 Preview Button */}
    <MsaTemplatePreviewDialog
      template={template}
      trigger={
        <Button variant="ghost" size="icon" title="Preview MSA" onClick={(e) => e.stopPropagation()}>
          <Eye className="h-4 w-4" />
        </Button>
      }
    />

    {/* ✏️ Edit */}
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

    {/* 🗑 Delete */}
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
</Card>                }
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
