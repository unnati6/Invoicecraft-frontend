'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { CoverPageContent } from './cover-page-content';

export function MsaTemplatePreviewDialog({ template, coverPageTemplate, trigger }) {
  // Create mock document and customer data for previewing the cover page
  const mockDocument = {
    invoiceNumber: 'MSA-PREVIEW',
    issueDate: new Date(),
    // Add other fields if needed
  };

  const mockCustomer = {
    name: 'Valued Client (Preview)',
    // Add other fields if needed
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>MSA Template Preview: {template.name}</DialogTitle>
          <DialogDescription>
            This is a preview of the MSA template &quot;{template.name}&quot;.
            {coverPageTemplate && ` It includes the cover page "${coverPageTemplate.name}".`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] p-1 pr-6 border rounded-md">
          {coverPageTemplate && (
            <>
              <CoverPageContent
                document={mockDocument}
                customer={mockCustomer}
                template={coverPageTemplate}
              />
              <hr className="my-4 border-border" />
            </>
          )}
          <div className="prose prose-sm max-w-none p-4 bg-background">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {template.content || '*No content*'}
            </ReactMarkdown>
          </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

MsaTemplatePreviewDialog.displayName = 'MsaTemplatePreviewDialog';
