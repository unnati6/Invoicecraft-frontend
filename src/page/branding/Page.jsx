
import React, { useState, useEffect } from 'react';
import { AppHeader } from '../../components/ui/layout/app-header';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { UploadCloud, Save, Trash2, Edit3, Image as ImageIconLucide, Building, Settings, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { SignaturePad } from '../../components/signature-pad';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage, FormLabel } from '../../components/ui/form';
import { Skeleton } from '../../components/ui/skeleton';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { BASE_URL } from '../../lib/Api';

export default function BrandingPage() {
  const { toast } = useToast();
  const [activeSignatureTab, setActiveSignatureTab] = useState('upload');
  const [isLoading, setIsLoading] = useState(true);
  // New state to hold actual File objects before submission
  const [logoFile, setLogoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  // Also track if the signature was drawn (as it's already a Data URL)
  const [isSignatureDrawn, setIsSignatureDrawn] = useState(false);


  const form = useForm({
    defaultValues: {
      invoicePrefix: "INV-",
      orderFormPrefix: "OF-",
      name: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      phone: "",
      email: "",
      logoUrl: null, // This will hold the URL for preview/display
      signatureUrl: null, // This will hold the URL for preview/display
    },
  });

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/branding-settings`);
        const settings = await response.json();
        if (settings) {
          form.reset({
            ...settings,
            logoUrl: settings.logoUrl || null,
            signatureUrl: settings.signatureUrl || null,
          });
          // Important: Clear file inputs on initial load if settings were loaded
          // This prevents sending old files if the user doesn't re-select them
          setLogoFile(null);
          setSignatureFile(null);
          setIsSignatureDrawn(false); // Reset drawn signature state
        }
      } catch (error) {
        console.error("Failed to load branding settings:", error);
        toast({ title: "Error", description: "Could not load branding settings. Using defaults.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [form, toast]);

  const handleLogoFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Logo image must be smaller than 1MB.', variant: 'destructive' });
        event.target.value = ''; // Clear the input
        setLogoFile(null);
        form.setValue('logoUrl', null, { shouldDirty: true });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
        toast({ title: 'Invalid file type', description: 'Logo must be JPG, PNG, or SVG.', variant: 'destructive' });
        event.target.value = ''; // Clear the input
        setLogoFile(null);
        form.setValue('logoUrl', null, { shouldDirty: true });
        return;
      }
      setLogoFile(file); // Store the actual File object
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('logoUrl', reader.result, { shouldDirty: true }); // Update form state for preview
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      form.setValue('logoUrl', null, { shouldDirty: true });
    }
  };

  const handleSignatureFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Signature image must be smaller than 1MB.', variant: 'destructive' });
        event.target.value = ''; // Clear the input
        setSignatureFile(null);
        form.setValue('signatureUrl', null, { shouldDirty: true });
        setIsSignatureDrawn(false);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
        toast({ title: 'Invalid file type', description: 'Signature must be JPG, PNG, or SVG.', variant: 'destructive' });
        event.target.value = ''; // Clear the input
        setSignatureFile(null);
        form.setValue('signatureUrl', null, { shouldDirty: true });
        setIsSignatureDrawn(false);
        return;
      }
      setSignatureFile(file); // Store the actual File object
      setIsSignatureDrawn(false); // If file uploaded, it's not a drawn signature
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('signatureUrl', reader.result, { shouldDirty: true }); // Update form state for preview
      };
      reader.readAsDataURL(file);
    } else {
      setSignatureFile(null);
      form.setValue('signatureUrl', null, { shouldDirty: true });
      setIsSignatureDrawn(false);
    }
  };

  const handleDrawnSignatureConfirm = (dataUrl) => {
    // Convert Data URL to a Blob (File-like object) to send as FormData
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        // Create a File object from the blob. Naming it 'signature.png'
        const drawnFile = new File([blob], "signature.png", { type: "image/png" });
        setSignatureFile(drawnFile); // Store the actual File object
        setIsSignatureDrawn(true); // Mark as drawn signature
        form.setValue('signatureUrl', dataUrl, { shouldDirty: true }); // Update form state for preview
        toast({ title: 'Signature Drawn', description: 'Click "Save All Branding Settings" to apply.' });
      })
      .catch(error => {
        console.error("Error converting drawn signature to file:", error);
        toast({ title: 'Error', description: 'Could not process drawn signature.', variant: 'destructive' });
      });
  };

  const handleRemoveAsset = (type) => {
    if (type === 'logoUrl') {
      setLogoFile(null);
      form.setValue('logoUrl', null, { shouldDirty: true });
      const fileInput = document.getElementById('logo-upload');
      if (fileInput) fileInput.value = '';
    } else if (type === 'signatureUrl') {
      setSignatureFile(null);
      setIsSignatureDrawn(false);
      form.setValue('signatureUrl', null, { shouldDirty: true });
      const fileInput = document.getElementById('signature-upload');
      if (fileInput) fileInput.value = '';
    }
    toast({ title: 'Success', description: `${type === 'logoUrl' ? 'Logo' : 'Signature'} will be removed upon saving.` });
  };

  const handleFormSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append all form fields (excluding logoUrl and signatureUrl for files)
      Object.keys(data).forEach(key => {
        // Skip logoUrl and signatureUrl which are for preview/display only or handled separately
        if (key !== 'logoUrl' && key !== 'signatureUrl' && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      // Conditionally append logo file
      if (logoFile) {
        formData.append('logoFile', logoFile); // Backend expects 'logoFile' based on Postman
      } else if (data.logoUrl === null) {
        // If logoUrl is explicitly null, it means the user cleared it.
        // Send a flag to the backend to indicate deletion.
        formData.append('logoFile', ''); // Send empty string for deletion, or a specific flag
      }

      // Conditionally append signature file
      if (signatureFile) {
        formData.append('signatureFile', signatureFile); // Backend expects 'signatureFile'
      } else if (data.signatureUrl === null) {
        // If signatureUrl is explicitly null, it means the user cleared it.
        formData.append('signatureFile', ''); // Send empty string for deletion, or a specific flag
      }

      // If existing logo/signature URLs are present and no new file is uploaded/drawn,
      // you might want to send the existing URLs separately or rely on backend to retain them
      // based on absence of new file data. For now, we assume if logoFile/signatureFile is null,
      // the backend keeps the existing one UNLESS data.logoUrl/signatureUrl is explicitly null (cleared).

      const response = await fetch(`${BASE_URL}/branding-settings`, {
        method: 'PUT',
        // DO NOT set 'Content-Type': 'multipart/form-data'. The browser will set it
        // automatically and correctly with the boundary when you provide a FormData object.
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save branding settings');
      }

      const updatedSettings = await response.json(); // Assuming your backend returns updated settings
      toast({ title: 'Success', description: 'Branding settings saved.' });
      // Reset form with potentially new URLs from the backend after successful upload
      form.reset({
        ...updatedSettings,
        logoUrl: updatedSettings.logoUrl || null,
        signatureUrl: updatedSettings.signatureUrl || null,
      });
      // Clear file states after successful submission
      setLogoFile(null);
      setSignatureFile(null);
      setIsSignatureDrawn(false);


    } catch (error) {
      console.error("Failed to save branding settings:", error);
      toast({ title: 'Error', description: error.message || 'Could not save branding settings.', variant: 'destructive' });
    }
  };

  const watchLogoUrl = form.watch('logoUrl');
  const watchSignatureUrl = form.watch('signatureUrl');

  if (isLoading) {
    return (
      <>
        <AppHeader title="Branding & Numbering Settings" />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <Skeleton className="h-[300px] w-full max-w-3xl mx-auto" />
          <Skeleton className="h-[200px] w-full max-w-3xl mx-auto" />
          <Skeleton className="h-[350px] w-full max-w-3xl mx-auto" />
          <Skeleton className="h-[400px] w-full max-w-3xl mx-auto" />
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Branding & Numbering Settings" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center"><Building className="mr-2 h-5 w-5" /> Company Information</CardTitle>
                <CardDescription>This information will appear on your documents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Company Name *</FormLabel><FormControl><Input placeholder="Your Company LLC" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="contact@yourcompany.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
                <FormField control={form.control} name="street" render={({ field }) => (
                  <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Anytown" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem><FormLabel>State / Province</FormLabel><FormControl><Input placeholder="CA" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="zip" render={({ field }) => (
                    <FormItem><FormLabel>ZIP / Postal Code</FormLabel><FormControl><Input placeholder="90210" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="USA" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="(555) 123-4567" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
              </CardContent>
            </Card>

            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5" /> Document Numbering</CardTitle>
                <CardDescription>Set prefixes for your Invoices and Order Forms.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="invoicePrefix" render={({ field }) => (
                  <FormItem><FormLabel>Invoice Prefix</FormLabel><FormControl><Input placeholder="INV-" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="orderFormPrefix" render={({ field }) => (
                  <FormItem><FormLabel>Order Form Prefix</FormLabel><FormControl><Input placeholder="OF-" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </CardContent>
            </Card>

            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center"><ImageIconLucide className="mr-2 h-5 w-5" /> Company Logo</CardTitle>
                <CardDescription>Upload your company logo (max 1MB).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Use the file input directly */}
                <FormItem>
                  <FormLabel htmlFor="logo-upload">Upload Logo File</FormLabel>
                  <div className="flex items-center gap-4">
                    <Input id="logo-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoFileChange} className="flex-1"/>
                    <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('logo-upload')?.click()}><UploadCloud className="h-5 w-5" /><span className="sr-only">Upload Logo</span></Button>
                  </div>
                  <FormDescription>Upload a JPG, PNG, or SVG file. Max 1MB.</FormDescription>
                  <FormMessage />
                </FormItem>
                {watchLogoUrl && (<div className="space-y-2"><Label>Logo Preview</Label><div className="border rounded-md p-4 flex justify-center items-center bg-muted/30 min-h-[150px]"><img src={watchLogoUrl} alt="Logo Preview" width={200} height={80} style={{ objectFit: 'contain', maxHeight: '80px' }} data-ai-hint="company logo"/></div></div>)}
              </CardContent>
              <CardFooter>
                {watchLogoUrl && (<Button type="button" variant="outline" onClick={() => handleRemoveAsset('logoUrl')} className="mr-auto"><Trash2 className="mr-2 h-4 w-4" /> Clear Logo</Button>)}
              </CardFooter>
            </Card>

            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center"><Edit3 className="mr-2 h-5 w-5" /> Company Signature</CardTitle>
                <CardDescription>Upload or draw your company signature (max 1MB for upload).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs
                  value={activeSignatureTab}
                  onValueChange={(value) => {
                    setActiveSignatureTab(value);
                    // Clear the file input if switching from upload to draw, or vice versa
                    if (value === 'upload') {
                      setIsSignatureDrawn(false);
                    } else if (value === 'draw') {
                      setSignatureFile(null); // Clear uploaded file if drawing
                      const fileInput = document.getElementById('signature-upload');
                      if (fileInput) fileInput.value = '';
                    }
                  }}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload"><ImageIconLucide className="mr-2 h-4 w-4" /> Upload Image</TabsTrigger>
                    <TabsTrigger value="draw"><Edit3 className="mr-2 h-4 w-4" /> Draw Signature</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="pt-4">
                    <FormItem>
                      <FormLabel htmlFor="signature-upload">Upload Signature File</FormLabel>
                      <div className="flex items-center gap-4">
                        <Input id="signature-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleSignatureFileChange} className="flex-1"/>
                        <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('signature-upload')?.click()}><UploadCloud className="h-5 w-5" /><span className="sr-only">Upload Signature</span></Button>
                      </div>
                      <FormDescription>Upload a JPG, PNG, or SVG file. Max 1MB.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  </TabsContent>
                  <TabsContent value="draw" className="pt-4 flex flex-col items-center">
                    <SignaturePad onConfirm={handleDrawnSignatureConfirm} />
                  </TabsContent>
                </Tabs>
                {watchSignatureUrl && (<div className="space-y-2 pt-4"><Label>Signature Preview</Label><div className="border rounded-md p-4 flex justify-center items-center bg-muted/30 min-h-[100px]"><img src={watchSignatureUrl} alt="Signature Preview" width={250} height={100} style={{ objectFit: 'contain', maxHeight: '100px' }}/></div></div>)}
              </CardContent>
              <CardFooter>
                {watchSignatureUrl && (<Button type="button" variant="outline" onClick={() => handleRemoveAsset('signatureUrl')} className="mr-auto"><Trash2 className="mr-2 h-4 w-4" /> Clear Signature</Button>)}
              </CardFooter>
            </Card>

            <div className="max-w-3xl mx-auto flex justify-end pt-4">
              <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty} size="lg">
                <Save className="mr-2 h-5 w-5" />
                {form.formState.isSubmitting ? 'Saving Settings...' : 'Save All Branding Settings'}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </>
  );
}