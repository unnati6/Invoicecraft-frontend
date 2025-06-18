import * as React from 'react';
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
import { Label } from './ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription as CardDesc } from './ui/card';

import { Save, Image as ImageIcon, UploadCloud, Trash2 } from 'lucide-react'; // Added UploadCloud, Trash2
import { useToast } from '../hooks/use-toast';

export function CoverPageTemplateForm({ onSubmit, initialData, isSubmitting = false }) {
  const { toast } = useToast();

  // State to hold actual File objects for new uploads
  const [companyLogoFile, setCompanyLogoFile] = React.useState(null);
  const [clientLogoFile, setClientLogoFile] = React.useState(null);
  const [additionalImage1File, setAdditionalImage1File] = React.useState(null);
  const [additionalImage2File, setAdditionalImage2File] = React.useState(null);

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      title: initialData?.title || 'Master Service Agreement',
      companyLogoEnabled: initialData?.companyLogoEnabled ?? true,
      companyLogoUrl: initialData?.companyLogoUrl || null, // Changed default to null
      clientLogoEnabled: initialData?.clientLogoEnabled ?? true,
      clientLogoUrl: initialData?.clientLogoUrl || null, // Changed default to null
      additionalImage1Enabled: initialData?.additionalImage1Enabled ?? false,
      additionalImage1Url: initialData?.additionalImage1Url || null, // Changed default to null
      additionalImage2Enabled: initialData?.additionalImage2Enabled ?? false,
      additionalImage2Url: initialData?.additionalImage2Url || null, // Changed default to null
    },
  });

  React.useEffect(() => {
    // Set initial URLs for display when data loads
    if (initialData) {
      form.reset({
        ...initialData,
        companyLogoUrl: initialData.companyLogoUrl || null,
        clientLogoUrl: initialData.clientLogoUrl || null,
        additionalImage1Url: initialData.additionalImage1Url || null,
        additionalImage2Url: initialData.additionalImage2Url || null,
      });
      // Clear file inputs on initial load or reset
      setCompanyLogoFile(null);
      setClientLogoFile(null);
      setAdditionalImage1File(null);
      setAdditionalImage2File(null);
    }
  }, [initialData, form]);

  // React.useEffect(() => {
  //   window.history.pushState(null, '', window.location.href);
  //   const handlePopState = () => {
  //     const token = localStorage.getItem('supabase.auth.token');
  //     if (!token) {
  //       window.location.replace('/');
  //     }
  //   };
  //   window.onpopstate = handlePopState;
  //   return () => {
  //     window.onpopstate = null; // Clean up the listener
  //   };
  // }, []);

  const watchCompanyLogoEnabled = form.watch('companyLogoEnabled');
  const watchCompanyLogoUrl = form.watch('companyLogoUrl');
  const watchClientLogoEnabled = form.watch('clientLogoEnabled');
  const watchClientLogoUrl = form.watch('clientLogoUrl');
  const watchAdditionalImage1Enabled = form.watch('additionalImage1Enabled');
  const watchAdditionalImage1Url = form.watch('additionalImage1Url');
  const watchAdditionalImage2Enabled = form.watch('additionalImage2Enabled');
  const watchAdditionalImage2Url = form.watch('additionalImage2Url');

  // Helper function for file change
  const handleFileChange = (event, setFileState, setFormValueName) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB for images (adjust as needed)
        toast({ title: 'File too large', description: 'Image must be smaller than 2MB.', variant: 'destructive' });
        event.target.value = ''; // Clear the input
        setFileState(null);
        form.setValue(setFormValueName, null, { shouldDirty: true });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'].includes(file.type)) {
        toast({ title: 'Invalid file type', description: 'Image must be JPG, PNG, SVG, or WebP.', variant: 'destructive' });
        event.target.value = ''; // Clear the input
        setFileState(null);
        form.setValue(setFormValueName, null, { shouldDirty: true });
        return;
      }
      setFileState(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue(setFormValueName, reader.result, { shouldDirty: true }); // Update form state for preview
      };
      reader.readAsDataURL(file);
    } else {
      setFileState(null);
      form.setValue(setFormValueName, null, { shouldDirty: true });
    }
  };

  // Helper function to remove an asset
  const handleRemoveAsset = (setFileState, setFormValueName, inputId, assetName) => {
    setFileState(null);
    form.setValue(setFormValueName, null, { shouldDirty: true });
    const fileInput = document.getElementById(inputId);
    if (fileInput) fileInput.value = '';
    toast({ title: 'Success', description: `${assetName} will be removed upon saving.` });
  };

  // Custom validation function
  const validateForm = (data) => {
    let isValid = true;
    form.clearErrors(); // Clear previous errors

    if (!data.name || data.name.trim() === '') {
      form.setError('name', { type: 'manual', message: 'Template name is required.' });
      isValid = false;
    }

    if (data.companyLogoEnabled && !watchCompanyLogoUrl) { // Check the URL in form state
      form.setError('companyLogoUrl', { type: 'manual', message: 'Company Logo is required if enabled.' });
      isValid = false;
    }

    if (data.clientLogoEnabled && !watchClientLogoUrl) { // Check the URL in form state
      form.setError('clientLogoUrl', { type: 'manual', message: 'Client Logo is required if enabled.' });
      isValid = false;
    }

    if (data.additionalImage1Enabled && !data.additionalImage1Url) { // Check the URL in form state
      form.setError('additionalImage1Url', { type: 'manual', message: 'Additional Image 1 is required if enabled.' });
      isValid = false;
    }

    if (data.additionalImage2Enabled && !watchAdditionalImage2Url) { // Check the URL in form state
      form.setError('additionalImage2Url', { type: 'manual', message: 'Additional Image 2 is required if enabled.' });
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

  const handleFormSubmit = async (data) => {
    if (validateForm(data)) {
      const formData = new FormData();

      // Append all form fields (excluding URL fields, as they are for display/preview)
      Object.keys(data).forEach(key => {
        if (!key.endsWith('Url') && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      // Conditionally append image files or deletion flags
      if (companyLogoFile) {
        formData.append('companyLogo', companyLogoFile);
      } else if (data.companyLogoUrl === null && form.formState.dirtyFields.companyLogoUrl) {
        formData.append('companyLogo', 'null_company_logo');
      }

      if (clientLogoFile) {
        formData.append('clientLogo', clientLogoFile);
      } else if (data.clientLogoUrl === null && form.formState.dirtyFields.clientLogoUrl) {
        formData.append('clientLogo', 'null_client_logo');
      }

      if (additionalImage1File) {
        formData.append('additionalImage1', additionalImage1File);
      } else if (data.additionalImage1Url === null && form.formState.dirtyFields.additionalImage1Url) {
        formData.append('additionalImage1', 'null_additional_image1');
      }

      if (additionalImage2File) {
        formData.append('additionalImage2', additionalImage2File);
      } else if (data.additionalImage2Url === null && form.formState.dirtyFields.additionalImage2Url) {
        formData.append('additionalImage2', 'null_additional_image2');
      }

      await onSubmit(formData); // Pass FormData to the parent onSubmit handler

      // Reset file states after successful submission (parent will handle form.reset)
      setCompanyLogoFile(null);
      setClientLogoFile(null);
      setAdditionalImage1File(null);
      setAdditionalImage2File(null);
    }
  };

  const ImageUploadSection = ({ label, enabledField, urlField, fileState, setFileState, inputId, assetName }) => (
    <>
      <FormField
        control={form.control}
        name={enabledField}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
            <FormLabel>{label}</FormLabel>
          </FormItem>
        )}
      />
      {form.watch(enabledField) && (
        <FormItem className="pl-7">
          <FormLabel htmlFor={inputId}>{assetName} Image File</FormLabel>
          <div className="flex items-center gap-4">
            <Input
              id={inputId}
              type="file"
              accept="image/png, image/jpeg, image/svg+xml, image/webp"
              onChange={(e) => handleFileChange(e, setFileState, urlField)}
              className="flex-1"
              disabled={isSubmitting}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => document.getElementById(inputId)?.click()}
              disabled={isSubmitting}
            >
              <UploadCloud className="h-5 w-5" />
              <span className="sr-only">Upload {assetName}</span>
            </Button>
          </div>
          <FormDescription>Upload a JPG, PNG, SVG, or WebP file. Max 2MB.</FormDescription>
          <FormMessage />
          {form.watch(urlField) && (
            <div className="space-y-2 pt-2">
              <Label>Current {assetName}</Label>
              <div className="border rounded-md p-4 flex justify-center items-center bg-muted/30 min-h-[80px]">
                <img src={form.watch(urlField)} alt={`${assetName} Preview`} style={{ objectFit: 'contain', maxHeight: '100px', maxWidth: '100%' }} />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveAsset(setFileState, urlField, inputId, assetName)} disabled={isSubmitting}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear {assetName}
              </Button>
            </div>
          )}
        </FormItem>
      )}
    </>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit Cover Page Template' : 'Create New Cover Page Template'}</CardTitle>
            <CardDesc>
              Design a reusable cover page. Configure display settings for your company logo, client logo, and additional images.
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
                  <FormMessage />
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

              <ImageUploadSection
                label="Show Company Logo"
                enabledField="companyLogoEnabled"
                urlField="companyLogoUrl"
                fileState={companyLogoFile}
                setFileState={setCompanyLogoFile}
                inputId="company-logo-upload"
                assetName="Company Logo"
              />

              <ImageUploadSection
                label="Show Client Logo"
                enabledField="clientLogoEnabled"
                urlField="clientLogoUrl"
                fileState={clientLogoFile}
                setFileState={setClientLogoFile}
                inputId="client-logo-upload"
                assetName="Client Logo"
              />

              <ImageUploadSection
                label="Show Additional Image 1"
                enabledField="additionalImage1Enabled"
                urlField="additionalImage1Url"
                fileState={additionalImage1File}
                setFileState={setAdditionalImage1File}
                inputId="additional-image1-upload"
                assetName="Additional Image 1"
              />

              <ImageUploadSection
                label="Show Additional Image 2"
                enabledField="additionalImage2Enabled"
                urlField="additionalImage2Url"
                fileState={additionalImage2File}
                setFileState={setAdditionalImage2File}
                inputId="additional-image2-upload"
                assetName="Additional Image 2"
              />
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