

import * as React from 'react';
// import { zodResolver } from '@hookform/resolvers/zod'; // Removed
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from './ui/form';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription as CardDesc } from './ui/card';

import { Save, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
export function CoverPageTemplateForm({ onSubmit, initialData, isSubmitting = false }) {
  
  console.log({ Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription });
console.log({ Input, Checkbox });
console.log({ Card, CardContent, CardFooter, CardHeader, CardTitle, CardDesc });
console.log({ useToast });
    const { toast } = useToast(); // Initialize useToast

  const form = useForm({
    // Removed: resolver: zodResolver(coverPageTemplateSchema),
    defaultValues: {
      name: initialData?.name || '',
      title: initialData?.title || 'Master Service Agreement',
      companyLogoEnabled: initialData?.companyLogoEnabled ?? true,
      companyLogoUrl: initialData?.companyLogoUrl || 'https://placehold.co/200x60.png',
      clientLogoEnabled: initialData?.clientLogoEnabled ?? true,
      clientLogoUrl: initialData?.clientLogoUrl || 'https://placehold.co/150x50.png',
      additionalImage1Enabled: initialData?.additionalImage1Enabled ?? false,
      additionalImage1Url: initialData?.additionalImage1Url || 'https://placehold.co/300x200.png',
      additionalImage2Enabled: initialData?.additionalImage2Enabled ?? false,
      additionalImage2Url: initialData?.additionalImage2Url || 'https://placehold.co/300x200.png',
    },
  });

  const watchCompanyLogoEnabled = form.watch('companyLogoEnabled');
  const watchClientLogoEnabled = form.watch('clientLogoEnabled');
  const watchAdditionalImage1Enabled = form.watch('additionalImage1Enabled');
  const watchAdditionalImage2Enabled = form.watch('additionalImage2Enabled');

  // Custom validation function
  const validateForm = (data) => {
    let isValid = true;
    form.clearErrors(); // Clear previous errors

    if (!data.name || data.name.trim() === '') {
      form.setError('name', { type: 'manual', message: 'Template name is required.' });
      isValid = false;
    }

    // Basic URL validation (you might want a more robust regex)
    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    };

    if (data.companyLogoEnabled && (!data.companyLogoUrl || !isValidUrl(data.companyLogoUrl))) {
      form.setError('companyLogoUrl', { type: 'manual', message: 'Valid Company Logo URL is required if enabled.' });
      isValid = false;
    }

    if (data.clientLogoEnabled && (!data.clientLogoUrl || !isValidUrl(data.clientLogoUrl))) {
      form.setError('clientLogoUrl', { type: 'manual', message: 'Valid Client Logo URL is required if enabled.' });
      isValid = false;
    }

    if (data.additionalImage1Enabled && (!data.additionalImage1Url || !isValidUrl(data.additionalImage1Url))) {
      form.setError('additionalImage1Url', { type: 'manual', message: 'Valid Additional Image 1 URL is required if enabled.' });
      isValid = false;
    }

    if (data.additionalImage2Enabled && (!data.additionalImage2Url || !isValidUrl(data.additionalImage2Url))) {
      form.setError('additionalImage2Url', { type: 'manual', message: 'Valid Additional Image 2 URL is required if enabled.' });
      isValid = false;
    }

    if (!isValid) {
        toast({
            title: "Validation Error",
            description: "Please correct the highlighted fields.",
            variant: "destructive",
        });
    }

    return isValid;
  };

  // Custom handleSubmit wrapper
  const handleFormSubmit = async (data) => {
    if (validateForm(data)) {
      await onSubmit(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}> {/* Use custom handler */}
        <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit Cover Page Template' : 'Create New Cover Page Template'}</CardTitle>
            <CardDesc>
              Design a reusable cover page. You can specify a title and URLs for logos/images.
            </CardDesc>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Standard MSA Cover" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage /> {/* This will display errors set by form.setError */}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Page Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Master Service Agreement" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormDescription>This title will appear prominently on the cover page.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Image Configuration</h3>
              {/* Company Logo */}
              <FormField
                control={form.control}
                name="companyLogoEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
                    <FormLabel>Show Company Logo</FormLabel>
                  </FormItem>
                )}
              />
              {watchCompanyLogoEnabled && (
                <FormField
                  control={form.control}
                  name="companyLogoUrl"
                  render={({ field }) => (
                    <FormItem className="pl-7">
                      <FormLabel>Company Logo URL</FormLabel>
                      <FormControl><Input placeholder="https://placehold.co/200x60.png" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Client Logo */}
              <FormField
                control={form.control}
                name="clientLogoEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
                    <FormLabel>Show Client Logo</FormLabel>
                  </FormItem>
                )}
              />
              {watchClientLogoEnabled && (
                <FormField
                  control={form.control}
                  name="clientLogoUrl"
                  render={({ field }) => (
                    <FormItem className="pl-7">
                      <FormLabel>Client Logo URL</FormLabel>
                      <FormControl><Input placeholder="https://placehold.co/150x50.png" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {/* Additional Image 1 */}
                <FormField
                    control={form.control}
                    name="additionalImage1Enabled"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
                        <FormLabel>Show Additional Image 1</FormLabel>
                    </FormItem>
                    )}
                />
                {watchAdditionalImage1Enabled && (
                    <FormField
                    control={form.control}
                    name="additionalImage1Url"
                    render={({ field }) => (
                        <FormItem className="pl-7">
                        <FormLabel>Additional Image 1 URL</FormLabel>
                        <FormControl><Input placeholder="https://placehold.co/300x200.png" {...field} disabled={isSubmitting} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                {/* Additional Image 2 */}
                <FormField
                    control={form.control}
                    name="additionalImage2Enabled"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
                        <FormLabel>Show Additional Image 2</FormLabel>
                    </FormItem>
                    )}
                />
                {watchAdditionalImage2Enabled && (
                    <FormField
                    control={form.control}
                    name="additionalImage2Url"
                    render={({ field }) => (
                        <FormItem className="pl-7">
                        <FormLabel>Additional Image 2 URL</FormLabel>
                        <FormControl><Input placeholder="https://placehold.co/300x200.png" {...field} disabled={isSubmitting} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Template')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

CoverPageTemplateForm.displayName = "CoverPageTemplateForm";