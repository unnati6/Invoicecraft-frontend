import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import { RichTextEditor } from './rich-text-editor';
import { Save } from 'lucide-react';

// Simple validation schema (replace Zod)
const validateTemplate = (data) => {
  const errors = {};
  if (!data.name.trim()) {
    errors.name = 'Template name is required';
  }
  if (!data.content.trim()) {
    errors.content = 'Template content is required';
  }
  return errors;
};

export function TermsTemplateForm({ onSubmit, initialData = null, isSubmitting = false }) {
  const [formErrors, setFormErrors] = useState({});
  
  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      content: initialData?.content || '<p></p>',
    },
  });

  const handleFormSubmit = async (data) => {
    const errors = validateTemplate(data);
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      await onSubmit(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit Template' : 'Create New Template'}</CardTitle>
            <CardDescription>
              {initialData
                ? 'Modify the details of your terms and conditions template.'
                : 'Define a reusable terms and conditions template.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Standard Service Agreement"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage>
                    {formErrors.name && <span className="text-red-500">{formErrors.name}</span>}
                  </FormMessage>
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
                  <FormMessage>
                    {formErrors.content && <span className="text-red-500">{formErrors.content}</span>}
                  </FormMessage>
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
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
