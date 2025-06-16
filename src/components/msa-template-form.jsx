
import React, { useEffect, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription as CardDesc } from './ui/card';
import { RichTextEditor } from './rich-text-editor';
import { Save } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '../hooks/use-toast';
import axiosInstance from '../lib/axiosInstance';

const NO_COVER_PAGE_VALUE = "_no_cover_page_";

export function MsaTemplateForm({
  onSubmit,
  initialData,
  isSubmitting = false,
  coverPageTemplates = [],
  isLoadingCoverPageTemplates = false,
}) {
  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      content: initialData?.content || '<p></p>',
      coverPageTemplateId: initialData?.coverPageTemplateId || NO_COVER_PAGE_VALUE,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        content: initialData.content || '<p></p>',
        coverPageTemplateId: initialData.coverPageTemplateId || NO_COVER_PAGE_VALUE,
      });
    }
  }, [initialData, form]);

  const handleFormSubmit = async (data) => {
    const dataToSubmit = {
      ...data,
      coverPageTemplateId:
        data.coverPageTemplateId === NO_COVER_PAGE_VALUE ? null : data.coverPageTemplateId,
    };
    onSubmit(dataToSubmit);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit MSA Template' : 'Create New MSA Template'}</CardTitle>
            <CardDesc>
              {initialData
                ? 'Modify the details of your Master Service Agreement template.'
                : 'Define a reusable Master Service Agreement template.'}
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
                    <Input placeholder="e.g. Standard MSA for Services" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Content *</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || '<p></p>'}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverPageTemplateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Page Template (Optional)</FormLabel>
                  {isLoadingCoverPageTemplates ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="None (No Cover Page)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_COVER_PAGE_VALUE}>None (No Cover Page)</SelectItem>
                        {coverPageTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormDescription>Select a pre-designed cover page to attach to this MSA.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || isLoadingCoverPageTemplates}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting
                ? initialData
                  ? 'Saving...'
                  : 'Creating...'
                : initialData
                  ? 'Save Changes'
                  : 'Create Template'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

MsaTemplateForm.displayName = "MsaTemplateForm";
