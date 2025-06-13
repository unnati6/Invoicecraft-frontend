'use client';

import * as React from 'react';
// import type { ReactNode } from 'react'; // Removed: Type import
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
// import type { CoverPageTemplate, Invoice, Customer } from '@/types'; // Removed: Type import
import { CoverPageContent } from './cover-page-content';
import { format } from 'date-fns';

// Removed: interface CoverPageTemplatePreviewDialogProps { ... }

export function CoverPageTemplatePreviewDialog({ template, trigger }) { // Removed type annotations
  // Create minimal mock document and customer data for previewing the template
  const mockDocument = { // Removed Partial<Invoice> type annotation
    issueDate: new Date(),
    // Add any other fields CoverPageContent might expect from a 'document'
  };
  const mockCustomer = { // Removed Partial<Customer> type annotation
    name: 'Valued Client (Preview)',
    // Add any other fields CoverPageContent might expect from a 'customer'
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Cover Page Preview: {template.name}</DialogTitle>
          <DialogDescription>
            This is a preview of how the cover page template &quot;{template.title || template.name}&quot; might look.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-6 border rounded-md">
          <CoverPageContent
            document={mockDocument} // Removed type cast
            customer={mockCustomer} // Removed type cast
            template={template}
          />
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

CoverPageTemplatePreviewDialog.displayName = "CoverPageTemplatePreviewDialog";