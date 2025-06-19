import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import ModernCalendar from './ui/ModernCalendar';
import { RichTextEditor } from './rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription as ShadCNCardDesc } from './ui/card';
import { cn } from '../lib/utils';
import { format, addMonths } from 'date-fns';
import { CalendarIcon, PlusCircle, Save, Trash2,X, ExternalLink, FileCheck2, Percent, Tag, Library, CircleDollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCurrencySymbol } from '../lib/currency-utils';
import { Textarea } from "./ui/textarea";
import { Skeleton } from './ui/skeleton';
import { useToast } from '../hooks/use-toast';
import { Checkbox } from './ui/checkbox';

import axiosInstance from '../lib/axiosInstance';
const debounce = (func, waitFor) => {
  let timeout;
  return (...args) =>
    new Promise(resolve => {
      clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

const paymentTermOptions = [
  { value: "Due on Receipt", label: "Due on Receipt" },
  { value: "Net 15 Days", label: "Net 15 Days" },
  { value: "Net 30 Days", label: "Net 30 Days" },
  { value: "Net 60 Days", label: "Net 60 Days" },
  { value: "Custom", label: "Custom" },
];

const commitmentPeriodOptions = [
  { value: "N/A", label: "N/A" },
  { value: "1 Month", label: "1 Month" },
  { value: "3 Months", label: "3 Months" },
  { value: "6 Months", label: "6 Months" },
  { value: "12 Months", label: "12 Months" },
  { value: "18 Months", label: "18 Months" },
  { value: "24 Months", label: "24 Months" },
  { value: "30 Months", label: "30 Months" },
  { value: "36 Months", label: "36 Months" },
  { value: "Custom", label: "Custom" },
];

const paymentFrequencyOptions = [
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
    { value: "Biannual", label: "Biannual (Once every 6 months)" },
    { value: "Annual", label: "Annual" },
    { value: "Custom", label: "Custom" },
];

const NO_MSA_TEMPLATE_SELECTED = "_no_msa_template_";

export function InvoiceForm({ onSubmit, initialData, isSubmitting = false }) {
  const [customers, setCustomers] = React.useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = React.useState(true);
//  const [orderFormNumber, setOrderFormNumber] = useState('Auto-generating...');
  const [currentCurrencySymbol, setCurrentCurrencySymbol] = React.useState('$');
  const [termsTemplates, setTermsTemplates] = React.useState([]);
  const [msaTemplates, setMsaTemplates] = React.useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = React.useState(true);
  const { toast } = useToast();
  const [isAutoSavingTerms, setIsAutoSavingTerms] = React.useState(false);
  const lastSavedTermsRef = React.useRef(null);
  const [repositoryItems, setRepositoryItems] = React.useState([]);
  const [isLoadingRepositoryItems, setIsLoadingRepositoryItems] = React.useState(true);
 const [isFetchingOrderNumber, setIsFetchingOrderNumber] = React.useState(false); // Add loading state

  const form = useForm({
    defaultValues: initialData
      ? {
          ...initialData,
        issueDate: initialData.issueDate ? new Date(initialData.issueDate) : new Date(),
validUntilDate: initialData.validUntilDate ? new Date(initialData.validUntilDate) : new Date(),
          items: initialData.items.map(item => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            procurementPrice: item.procurementPrice,
            vendorName: item.vendorName,
          })),
          additionalCharges: initialData.additionalCharges?.map(ac => ({
            id: ac.id,
            description: ac.description,
            valueType: ac.valueType,
            value: ac.value,
          })) || [],
          discountEnabled: initialData.discountEnabled ?? false,
          discountDescription: initialData.discountDescription || '',
          discountType: initialData.discountType || 'fixed',
          discountValue: initialData.discountValue || 0,
          linkedMsaTemplateId: initialData.linkedMsaTemplateId === NO_MSA_TEMPLATE_SELECTED ? null : initialData.linkedMsaTemplateId,
    msaContent: initialData.msaContent || '',
          msaCoverPageTemplateId: initialData.msaCoverPageTemplateId || '',
          termsAndConditions: initialData.termsAndConditions || '<p></p>',
          paymentTerms: initialData.paymentTerms || "Net 30 Days",
          customPaymentTerms: initialData.customPaymentTerms || '',
          commitmentPeriod: initialData.commitmentPeriod || "N/A",
          customCommitmentPeriod: initialData.customCommitmentPeriod || '',
          paymentFrequency: initialData.paymentFrequency || "Monthly",
          customPaymentFrequency: initialData.customPaymentFrequency || '',
          serviceStartDate: initialData.serviceStartDate ? new Date(initialData.serviceStartDate) : null,
          serviceEndDate: initialData.serviceEndDate ? new Date(initialData.serviceEndDate) : null,
        }
      : {
           invoiceNumber: 'Auto-generating...',
          issueDate: new Date(),
          validUntilDate: new Date(new Date().setDate(new Date().getDate() + 30)),
          items: [{ description: '', quantity: 1, rate: 0, procurementPrice: undefined, vendorName: '' }],
          additionalCharges: [],
          discountEnabled: false,
          discountDescription: '',
          discountType: 'fixed',
          discountValue: 0,
          taxRate: 0,
          linkedMsaTemplateId: NO_MSA_TEMPLATE_SELECTED,
          msaContent: '',
          msaCoverPageTemplateId: '',
          termsAndConditions: '<p></p>',
          status: 'Draft',
          customerId: '',
          paymentTerms: "Net 30 Days",
          customPaymentTerms: '',
          commitmentPeriod: "N/A",
          customCommitmentPeriod: '',
          paymentFrequency: "Monthly",
          customPaymentFrequency: '',
          serviceStartDate: null,
          serviceEndDate: null,
        },
  });

  React.useEffect(() => {
    if (initialData) {
      lastSavedTermsRef.current = initialData.termsAndConditions || '<p></p>';
    } else {
      lastSavedTermsRef.current = '<p></p>';
    }
  }, [initialData]);

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  });
 React.useEffect(() => {
        const fetchNextOrderNumber = async () => {
            if (!initialData) { // Only fetch for new forms
                setIsFetchingOrderNumber(true);
                try {
                    const response = await axiosInstance.get('/invoices/next-number');
                    form.setValue('invoiceNumber', response.data.nextInvoiceNumber); // Use form.setValue
                } catch (error) {
                    console.error('Error fetching next order form number:', error.response?.data || error.message);
                    form.setValue('invoiceNumber', 'Error Loading Number'); // Use form.setValue
                } finally {
                    setIsFetchingOrderNumber(false);
                }
            }
        };

        fetchNextOrderNumber();
    }, [initialData, form]); // Dependency on form
  const { fields: chargeFields, append: appendCharge, remove: removeCharge } = useFieldArray({
    control: form.control,
    name: 'additionalCharges',
  });
  

  React.useEffect(() => {
    async function loadInitialData() {
      setIsLoadingCustomers(true);
      setIsLoadingTemplates(true);
      setIsLoadingRepositoryItems(true);
      try {
        // --- Backend API Calls Placeholders ---
        // Replace these with your actual fetch or axios calls to your backend API
        const fetchedCustomers = await axiosInstance.get('/customers');
        const fetchedTermsTemplates =await axiosInstance.get(`/terms-templates`);
        const fetchedMsaTemplates = await axiosInstance.get(`/msa-templates`)
        const fetchedRepoItems = await axiosInstance.get(`/item-route`);
        // --- End Backend API Calls Placeholders ---

        setCustomers(fetchedCustomers.data);
        setTermsTemplates(fetchedTermsTemplates.data);
        setMsaTemplates(fetchedMsaTemplates.data);
        setRepositoryItems(fetchedRepoItems.data);
      } catch (error) {
        console.error("Failed to fetch initial data for form", error);
        toast({ title: "Error", description: "Failed to load supporting data from backend.", variant: "destructive" });
      } finally {
        setIsLoadingCustomers(false);
        setIsLoadingTemplates(false);
        setIsLoadingRepositoryItems(false);
      }
    }
    loadInitialData();
  }, [toast]);

  // React.useEffect(() => {
  //   async function loadNextOrderFormNumber() {
  //     if (!initialData) {
  //       setIsLoadingOFNumber(true);
  //       try {
  //         // --- Backend API Call Placeholder ---
  //         // Replace with your actual API call to fetch the next order form number
  //         const nextOFNum = await new Promise(resolve => setTimeout(() => resolve('OF-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0')), 300));
  //         // --- End Backend API Call Placeholder ---
  //         form.setValue('orderFormNumber', nextOFNum);
  //       } catch (error) {
  //         console.error("Failed to fetch next order form number from backend", error);
  //         form.setValue('orderFormNumber', 'OF-ERROR');
  //       } finally {
  //         setIsLoadingOFNumber(false);
  //       }
  //     }
  //   }
  //   loadNextOrderFormNumber();
  // }, [initialData, form]);

  const watchedCustomerId = form.watch('customerId');

  React.useEffect(() => {
    let custCurrencyCode = 'USD'; // Default to USD
    const determineCurrency = () => {
      const currentFormCustomerId = form.getValues('customerId');
      if (currentFormCustomerId && customers.length > 0) {
        const customer = customers.find(c => c.id === currentFormCustomerId);
        if (customer?.currency) custCurrencyCode = customer.currency;
      } else if (initialData?.customerId && customers.length > 0) {
        const customer = customers.find(c => c.id === initialData.customerId);
        if (customer?.currency) custCurrencyCode = customer.currency;
      }
      setCurrentCurrencySymbol(getCurrencySymbol(custCurrencyCode));
    };
    if (!isLoadingCustomers) determineCurrency();
  }, [watchedCustomerId, customers, initialData?.customerId, form, isLoadingCustomers]);

  const watchedItems = form.watch('items');
  const watchedAdditionalCharges = form.watch('additionalCharges');
  const watchedTaxRate = form.watch('taxRate');
  const watchDiscountEnabled = form.watch('discountEnabled');
  const watchDiscountType = form.watch('discountType');
  const watchDiscountValue = form.watch('discountValue');

  const {
    subtotal: mainItemsSubtotal,
    totalAdditionalCharges,
    preDiscountSubtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    total,
  } = React.useMemo(() => {
    const itemsSub = watchedItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
    const addChargesTotal = watchedAdditionalCharges?.reduce((sum, charge) => {
      const value = Number(charge.value) || 0;
      if (charge.valueType === 'fixed') return sum + value;
      if (charge.valueType === 'percentage') return sum + (itemsSub * (value / 100));
      return sum;
    }, 0) || 0;

    const preDiscSubtotal = itemsSub + addChargesTotal;

    let currentDiscountAmount = 0;
    if (watchDiscountEnabled) {
      const discVal = Number(watchDiscountValue) || 0;
      if (watchDiscountType === 'fixed') {
        currentDiscountAmount = discVal;
      } else if (watchDiscountType === 'percentage') {
        currentDiscountAmount = preDiscSubtotal * (discVal / 100);
      }
    }

    const finalTaxableAmount = preDiscSubtotal - currentDiscountAmount;
    const finalTaxAmount = finalTaxableAmount * ((Number(watchedTaxRate) || 0) / 100);
    const grandTotal = finalTaxableAmount + finalTaxAmount;

    return {
      subtotal: itemsSub,
      totalAdditionalCharges: addChargesTotal,
      preDiscountSubtotal: preDiscSubtotal,
      discountAmount: currentDiscountAmount,
      taxableAmount: finalTaxableAmount,
      taxAmount: finalTaxAmount,
      total: grandTotal,
    };
  }, [watchedItems, watchedAdditionalCharges, watchedTaxRate, watchDiscountEnabled, watchDiscountType, watchDiscountValue]);


  const handleTermsTemplateSelect = (templateId) => {
    if (templateId === "none" || !templateId) {
      form.setValue('termsAndConditions', '<p></p>', { shouldDirty: true, shouldValidate: true });
      return;
    }
    const selectedTemplate = termsTemplates.find(t => t.id === templateId);
    if (selectedTemplate) form.setValue('termsAndConditions', selectedTemplate.content, { shouldDirty: true, shouldValidate: true });
  };

  const handleMsaTemplateSelect = (selectedMsaTemplateId) => {
    form.setValue('linkedMsaTemplateId', selectedMsaTemplateId, {shouldDirty: true});
    const selectedTemplate = msaTemplates.find(t => t.id === selectedMsaTemplateId);
    if (selectedMsaTemplateId === NO_MSA_TEMPLATE_SELECTED || !selectedMsaTemplateId || !selectedTemplate) {
      form.setValue('msaContent', '', { shouldDirty: true });
      form.setValue('msaCoverPageTemplateId', '', { shouldDirty: true });
      return;
    }
    if (selectedTemplate) {
      form.setValue('msaContent', selectedTemplate.content, { shouldDirty: true });
      form.setValue('msaCoverPageTemplateId', selectedTemplate.coverPageTemplateId || '', { shouldDirty: true });
    }
  };

  const debouncedSaveTerms = React.useCallback(
    debounce(async (terms, docId) => {
      if (!docId || isSubmitting || terms === lastSavedTermsRef.current) return;
      setIsAutoSavingTerms(true);
      try {
        // --- Backend API Call Placeholder ---
        // Replace with your actual API call to save terms and conditions
        console.log(`Simulating auto-save for docId: ${docId}, terms: ${terms.substring(0, 50)}...`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        // await saveOrderFormTerms(docId, { termsAndConditions: terms }); // Original call
        // --- End Backend API Call Placeholder ---

        lastSavedTermsRef.current = terms;
        toast({ title: "Terms Auto-Saved", description: "Your terms and conditions have been saved to the backend.", variant: "warning" });
      } catch (error) {
        console.error("Failed to auto-save terms to backend:", error);
        toast({ title: "Auto-Save Failed", description: "Could not auto-save terms and conditions to backend.", variant: "destructive" });
      } finally {
        setIsAutoSavingTerms(false);
      }
    }, 1500),
    [toast, isSubmitting]
  );

  const handleRepositoryItemSelect = (itemId, itemIndex) => {
    const selectedRepoItem = repositoryItems.find(item => item.id === itemId);
    if (selectedRepoItem) {
      form.setValue(`items.${itemIndex}.description`, selectedRepoItem.name, { shouldDirty: true });
      form.setValue(`items.${itemIndex}.quantity`, 1, { shouldDirty: true }); // Default quantity to 1 for convenience
      form.setValue(`items.${itemIndex}.rate`, selectedRepoItem.defaultRate ?? 0, { shouldDirty: true });
      form.setValue(`items.${itemIndex}.procurementPrice`, selectedRepoItem.defaultProcurementPrice ?? undefined, { shouldDirty: true });
      form.setValue(`items.${itemIndex}.vendorName`, selectedRepoItem.defaultVendorName ?? '', { shouldDirty: true });
    } else if (itemId === '--none--') {
        form.setValue(`items.${itemIndex}.description`, '', { shouldDirty: true });
        form.setValue(`items.${itemIndex}.quantity`, 1, { shouldDirty: true });
        form.setValue(`items.${itemIndex}.rate`, 0, { shouldDirty: true });
        form.setValue(`items.${itemIndex}.procurementPrice`, undefined, { shouldDirty: true });
        form.setValue(`items.${itemIndex}.vendorName`, '', { shouldDirty: true });
    }
  };

  const watchedServiceStartDate = form.watch('serviceStartDate');
  const watchedCommitmentPeriod = form.watch('commitmentPeriod');

  React.useEffect(() => {
    if (watchedServiceStartDate && watchedCommitmentPeriod && watchedCommitmentPeriod !== "N/A" && watchedCommitmentPeriod !== "Custom") {
      const parts = watchedCommitmentPeriod.split(" ");
      const value = parseInt(parts[0]);
      const unit = parts[1]; // "Month" or "Months"

      if (!isNaN(value) && (unit === "Month" || unit === "Months")) {
        const newEndDate = addMonths(new Date(watchedServiceStartDate), value);
        form.setValue('serviceEndDate', newEndDate, { shouldValidate: true });
      } else {
          form.setValue('serviceEndDate', null, { shouldValidate: true });
      }
    } else {
      // If no start date, or commitment is N/A or Custom, clear the auto-calculated end date.
      form.setValue('serviceEndDate', null, { shouldValidate: true });
    }
  }, [watchedServiceStartDate, watchedCommitmentPeriod, form]);

  const watchPaymentTerms = form.watch('paymentTerms');
  const watchCommitmentPeriod = form.watch('commitmentPeriod');
  const watchPaymentFrequency = form.watch('paymentFrequency');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{initialData ? 'Edit Invoice' : 'Create New Invoice'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customerId"
                    rules={{ required: 'Customer is required.' }} // Basic validation rule
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer *</FormLabel>
                        <div className="flex items-center gap-2">
                        <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLoadingCustomers}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingCustomers ? "Loading..." : "Select a customer"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/customers/new" target="_blank"><PlusCircle className="h-4 w-4"/></Link>
                        </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
            {initialData ? (
                    <FormField
                      control={form.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Number</FormLabel>
                          <FormControl>
                            {/* Display for existing data, always readOnly */}
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormDescription>
                            This number is auto-generated and cannot be changed.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  ) : (
                    // For new forms, display a placeholder or nothing at all
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Auto-generated upon creation"
                          disabled
                                   value={isFetchingOrderNumber ? "Loading..." : form.getValues('invoiceNumber')} // Display loading state

                        />
                      </FormControl>
                      <FormDescription>
                        This number will be auto-generated when the form is created.
                      </FormDescription>
                    </FormItem>
                  )}
                </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="issueDate"
                    rules={{ required: 'Issue Date is required.' }} // Basic validation rule
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Issue Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger> 
                          <PopoverContent className="w-auto bg-white p-0 shadow-lg rounded-md border" align="start">
                            <ModernCalendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="validUntilDate"
                    rules={{ required: 'Valid Until Date is required.', validate: (value) => {
                      // Custom validation: Valid Until Date must be after Issue Date
                      const issueDate = form.getValues('issueDate');
                      if (issueDate && value && new Date(value) <= new Date(issueDate)) {
                        return 'Valid Until Date must be after Issue Date.';
                      }
                      return true;
                    } }}
                    render={({ field }) => (
                       <FormItem className="flex flex-col">
                        <FormLabel>Valid Until Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <ModernCalendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                   <FormField
                     control={form.control}
                     name="status"
                     rules={{ required: 'Status is required.' }}
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Status</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value}>
                           <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                           <SelectContent>
                             {['Draft', 'Sent', 'Accepted', 'Declined', 'Expired'].map(status => (<SelectItem key={status} value={status}>{status}</SelectItem>))}
                           </SelectContent>
                         </Select>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
               </CardContent>
             </Card>

             <Card>
               <CardHeader><CardTitle>Payment &amp; Service Details</CardTitle></CardHeader>
               <CardContent className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                       control={form.control}
                       name="paymentTerms"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Payment Terms</FormLabel>
                           <Select onValueChange={field.onChange} value={field.value}>
                             <FormControl><SelectTrigger><SelectValue placeholder="Select payment terms" /></SelectTrigger></FormControl>
                             <SelectContent>
                               {paymentTermOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     {watchPaymentTerms === 'Custom' && (
                       <FormField
                         control={form.control}
                         name="customPaymentTerms"
                         rules={{ required: 'Custom Payment Terms are required when "Custom" is selected.' }}
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Custom Payment Terms</FormLabel>
                             <FormControl><Input placeholder="Specify custom terms" {...field} /></FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                     )}
                     <FormField
                       control={form.control}
                       name="commitmentPeriod"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Commitment Period</FormLabel>
                           <Select onValueChange={field.onChange} value={field.value}>
                             <FormControl><SelectTrigger><SelectValue placeholder="Select commitment period" /></SelectTrigger></FormControl>
                             <SelectContent>
                               {commitmentPeriodOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                       {watchCommitmentPeriod === 'Custom' && (
                         <FormField
                           control={form.control}
                           name="customCommitmentPeriod"
                           rules={{ required: 'Custom Commitment Period is required when "Custom" is selected.' }}
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>Custom Commitment Period</FormLabel>
                               <FormControl><Input placeholder="Specify custom period" {...field} /></FormControl>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                       )}
                       <FormField
                         control={form.control}
                         name="paymentFrequency"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Payment Frequency</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value}>
                               <FormControl><SelectTrigger><SelectValue placeholder="Select payment frequency" /></SelectTrigger></FormControl>
                               <SelectContent>
                                 {paymentFrequencyOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                               </SelectContent>
                             </Select>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       {watchPaymentFrequency === 'Custom' && (
                         <FormField
                           control={form.control}
                           name="customPaymentFrequency"
                           rules={{ required: 'Custom Payment Frequency is required when "Custom" is selected.' }}
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>Custom Payment Frequency</FormLabel>
                               <FormControl><Input placeholder="Specify custom frequency" {...field} /></FormControl>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                       )}
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                       control={form.control}
                       name="serviceStartDate"
                       render={({ field }) => (
                         <FormItem className="flex flex-col">
                           <FormLabel>Service Start Date</FormLabel>
                           <Popover>
                             <PopoverTrigger asChild>
                               <FormControl>
                                 <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                   {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date (Optional)</span>}
                                   <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                 </Button>
                               </FormControl>
                             </PopoverTrigger>
                             <PopoverContent className="w-auto p-0" align="start">
                               <ModernCalendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={field.onChange} initialFocus />
                             </PopoverContent>
                           </Popover>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="serviceEndDate"
                       render={({ field }) => (
                          <FormItem className="flex flex-col">
                           <FormLabel>Service End Date</FormLabel>
                           <Popover>
                             <PopoverTrigger asChild>
                               <FormControl>
                                 <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                   {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date (Optional)</span>}
                                   <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                 </Button>
                               </FormControl>
                             </PopoverTrigger>
                             <PopoverContent className="w-auto p-0" align="start">
                               <ModernCalendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={field.onChange} disabled={(date) => form.getValues("serviceStartDate") ? date < new Date(form.getValues("serviceStartDate")) : false} initialFocus />
                             </PopoverContent>
                           </Popover>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
               </CardContent>
             </Card>

             <Card>
               <CardHeader><CardTitle>Invoice Items</CardTitle></CardHeader>
               <CardContent className="space-y-4">
                 {itemFields.map((field, index) => {
                   const itemQuantity = form.watch(`items.${index}.quantity`) || 0;
                   const itemProcurementPrice = form.watch(`items.${index}.procurementPrice`);
                   const vendorPayable = (itemProcurementPrice !== undefined && itemProcurementPrice !== null) ? itemQuantity * itemProcurementPrice : null;

                   return (
                   <div key={field.id} className="space-y-3 p-3 border rounded-md relative">
                       <FormItem>
                       <FormLabel className="text-xs flex items-center"><Library className="mr-1 h-3 w-3 text-muted-foreground"/>Load from Repository</FormLabel>
                       <Select
                         onValueChange={(itemId) => handleRepositoryItemSelect(itemId, index)}
                         disabled={isLoadingRepositoryItems}
                         // You might want to add a 'value' prop here if you want the Select to reflect the current item's origin,
                         // but it's not strictly necessary for functionality.
                       >
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder={isLoadingRepositoryItems ? "Loading presets..." : "-- Select Preset Item (Optional) --"} />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                              <SelectItem value="--none--">-- Clear / Manual Entry --</SelectItem>
                            {repositoryItems.map((repoItem) => (
                              <SelectItem key={repoItem.id} value={repoItem.id}>
                                {repoItem.name} ({repoItem.defaultRate} {currentCurrencySymbol})
                              </SelectItem>
                            ))}
                         </SelectContent>
                       </Select>
                       <FormDescription>Selecting a preset will pre-fill Description, Rate, Procurement Price, and Vendor Name.</FormDescription>
                     </FormItem>
                     <FormField
                       control={form.control}
                       name={`items.${index}.description`}
                       rules={{ required: 'Description is required.' }}
                       render={({ field: itemDescriptionField }) => (
                         <FormItem>
                           <FormLabel>Description *</FormLabel>
                           <FormControl><Input placeholder="Item Description" {...itemDescriptionField} /></FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                       <FormField
                         control={form.control}
                         name={`items.${index}.quantity`}
                         rules={{
                           required: 'Quantity is required.',
                           min: { value: 1, message: 'Quantity must be at least 1.' },
                           validate: (value) => !isNaN(value) && Number.isInteger(Number(value)) || 'Quantity must be an integer.',
                         }}
                         render={({ field: itemQuantityField }) => (
                           <FormItem>
                             <FormLabel>Quantity *</FormLabel>
                             <FormControl><Input type="number" placeholder="1" {...itemQuantityField} onChange={e => itemQuantityField.onChange(Number(e.target.value))} /></FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       <FormField
                         control={form.control}
                         name={`items.${index}.rate`}
                         rules={{
                           required: 'Rate is required.',
                           min: { value: 0, message: 'Rate cannot be negative.' },
                           validate: (value) => !isNaN(value) || 'Rate must be a number.',
                         }}
                         render={({ field: itemRateField }) => (
                           <FormItem>
                             <FormLabel>Rate ({currentCurrencySymbol}) *</FormLabel>
                             <FormControl><Input type="number" placeholder="0.00" {...itemRateField} onChange={e => itemRateField.onChange(Number(e.target.value))} /></FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       <FormItem>
                         <FormLabel>Amount ({currentCurrencySymbol})</FormLabel>
                         <Input value={(itemQuantity * (form.watch(`items.${index}.rate`) || 0)).toFixed(2)} readOnly className="font-semibold text-right" />
                       </FormItem>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       <FormField
                         control={form.control}
                         name={`items.${index}.procurementPrice`}
                         rules={{
                            // No 'required' for optional field, but validate if entered
                            min: { value: 0, message: 'Procurement price cannot be negative.' },
                            validate: (value) => value === undefined || value === null || !isNaN(value) || 'Procurement price must be a number.',
                         }}
                         render={({ field: itemProcurementPriceField }) => (
                           <FormItem>
                             <FormLabel>Procurement Price ({currentCurrencySymbol}) (Optional)</FormLabel>
                             <FormControl><Input type="number" placeholder="0.00" {...itemProcurementPriceField} onChange={e => itemProcurementPriceField.onChange(e.target.value === '' ? undefined : Number(e.target.value))} /></FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       <FormField
                         control={form.control}
                         name={`items.${index}.vendorName`}
                         render={({ field: itemVendorNameField }) => (
                           <FormItem>
                             <FormLabel>Vendor Name (Optional)</FormLabel>
                             <FormControl><Input placeholder="Vendor Name" {...itemVendorNameField} /></FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                     </div>
                     {vendorPayable !== null && (
                       <FormItem>
                         <FormLabel>Vendor Payable ({currentCurrencySymbol})</FormLabel>
                         <Input value={vendorPayable.toFixed(2)} readOnly className="font-semibold text-right" />
                       </FormItem>
                     )}
                     {itemFields.length > 1 && (
                       <Button type="button" variant="destructive" size="xs" onClick={() => removeItem(index)} className="absolute top-1 right-2">
                         <X className="h-4 w-4" />
                       </Button>
                     )}
                   </div>
                 );
               })}
               <Button type="button" onClick={() => appendItem({ description: '', quantity: 1, rate: 0, procurementPrice: undefined, vendorName: '' })} variant="outline" className="w-full">
                 <PlusCircle className="mr-2 h-4 w-4" /> Add Item
               </Button>
             </CardContent>
           </Card>

           <Card>
             <CardHeader><CardTitle>Additional Charges</CardTitle></CardHeader>
             <CardContent className="space-y-4">
               {chargeFields.map((field, index) => (
                 <div key={field.id} className="space-y-3 p-3 border rounded-md relative">
                   <FormField
                     control={form.control}
                     name={`additionalCharges.${index}.description`}
                     rules={{ required: 'Description is required for additional charge.' }}
                     render={({ field: chargeDescriptionField }) => (
                       <FormItem>
                         <FormLabel>Description *</FormLabel>
                         <FormControl><Input placeholder="e.g., Shipping, Installation" {...chargeDescriptionField} /></FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     <FormField
                       control={form.control}
                       name={`additionalCharges.${index}.valueType`}
                       render={({ field: chargeValueTypeField }) => (
                         <FormItem>
                           <FormLabel>Value Type</FormLabel>
                           <Select onValueChange={chargeValueTypeField.onChange} value={chargeValueTypeField.value}>
                             <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                             <SelectContent>
                               <SelectItem value="fixed">Fixed Amount ({currentCurrencySymbol})</SelectItem>
                               <SelectItem value="percentage">Percentage (%)</SelectItem>
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name={`additionalCharges.${index}.value`}
                       rules={{
                         required: 'Value is required for additional charge.',
                         min: { value: 0, message: 'Value cannot be negative.' },
                         validate: (value) => !isNaN(value) || 'Value must be a number.',
                       }}
                       render={({ field: chargeValueField }) => (
                         <FormItem>
                           <FormLabel>Value</FormLabel>
                           <FormControl><Input type="number" placeholder="0.00" {...chargeValueField} onChange={e => chargeValueField.onChange(Number(e.target.value))} /></FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
                   {chargeFields.length > 0 && (
                     <Button type="button" variant="destructive" size="xs" onClick={() => removeCharge(index)} className="absolute top-1 right-2">
                       <X className="h-4 w-4" /> 
                     </Button>
                   )}
                 </div>
               ))}
               <Button type="button" onClick={() => appendCharge({ description: '', valueType: 'fixed', value: 0 })} variant="outline" className="w-full">
                 <PlusCircle className="mr-2 h-4 w-4" /> Add Additional Charge
               </Button>
             </CardContent>
           </Card>

           <Card>
             <CardHeader><CardTitle>Discount</CardTitle></CardHeader>
             <CardContent className="space-y-4">
               <FormField
                 control={form.control}
                 name="discountEnabled"
                 render={({ field }) => (
                   <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                     <FormControl>
                       <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                     </FormControl>
                     <div className="space-y-1 leading-none">
                       <FormLabel>Enable Discount</FormLabel>
                       <FormDescription>Check to apply a discount to the total.</FormDescription>
                     </div>
                   </FormItem>
                 )}
               />
               {watchDiscountEnabled && (
                 <>
                   <FormField
                     control={form.control}
                     name="discountDescription"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Discount Description (Optional)</FormLabel>
                         <FormControl><Input placeholder="e.g., Early Bird Discount" {...field} /></FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     <FormField
                       control={form.control}
                       name="discountType"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Discount Type</FormLabel>
                           <Select onValueChange={field.onChange} value={field.value}>
                             <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                             <SelectContent>
                               <SelectItem value="fixed">Fixed Amount ({currentCurrencySymbol})</SelectItem>
                               <SelectItem value="percentage">Percentage (%)</SelectItem>
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="discountValue"
                       rules={{
                         required: 'Discount value is required when enabled.',
                         min: { value: 0, message: 'Discount value cannot be negative.' },
                         validate: (value) => !isNaN(value) || 'Discount value must be a number.',
                         // Add more specific validation if discount percentage can't exceed 100
                         // e.g., if (watchDiscountType === 'percentage' && value > 100) return 'Percentage cannot exceed 100.';
                       }}
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Discount Value</FormLabel>
                           <FormControl><Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
                 </>
               )}
             </CardContent>
           </Card>

               <Card>
                   <CardHeader>
                       <CardTitle className="flex items-center">
                           <Library className="mr-2 h-5 w-5" /> Master Service Agreement (MSA)
                       </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                       <FormField
                           control={form.control}
                           name="linkedMsaTemplateId"
                           render={({ field }) => (
                               <FormItem>
                                   <FormLabel>Link MSA Template</FormLabel>
                                   <Select onValueChange={handleMsaTemplateSelect} value={field.value}>
                                       <FormControl><SelectTrigger><SelectValue placeholder="Select an MSA template" /></SelectTrigger></FormControl>
                                       <SelectContent>
                                           <SelectItem value={NO_MSA_TEMPLATE_SELECTED}>-- No MSA Template --</SelectItem>
                                           {isLoadingTemplates ? (
                                               <SelectItem value="loading" disabled>Loading templates...</SelectItem>
                                           ) : (
                                               msaTemplates.map(template => (
                                                   <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                                               ))
                                           )}
                                       </SelectContent>
                                   </Select>
                                   <FormDescription>
                                       Selecting a template will auto-populate the MSA content. You can still edit it afterwards.
                                   </FormDescription>
                                   <FormMessage />
                               </FormItem>
                           )}
                       />
                       <FormField
                           control={form.control}
                           name="msaContent"
                           render={({ field }) => (
                               <FormItem>
                                   <FormLabel>MSA Content</FormLabel>
                                   <FormControl>
                                       <RichTextEditor // Replaced Textarea with RichTextEditor
                                           value={field.value}
                                           onChange={field.onChange}
                                           onBlur={field.onBlur}
                                           placeholder="Enter MSA content here. It will be included in the order form preview and PDF."
                                            disabled={form.watch('linkedMsaTemplateId') !== NO_MSA_TEMPLATE_SELECTED && form.watch('linkedMsaTemplateId') !== null}
                              
                                       />
                                   </FormControl>
                                   <FormMessage />
                               </FormItem>
                           )}
                       />
                      
                   </CardContent>
               </Card>
  <Card>
                   <CardHeader>
                       <CardTitle className="flex items-center">
                           <FileCheck2 className="mr-2 h-5 w-5" /> Terms and Conditions
                       </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                       <FormField
                           control={form.control}
                           name="termsAndConditionsTemplateId"
                           render={({ field }) => (
                               <FormItem>
                                   <FormLabel>Link Terms & Conditions Template</FormLabel>
                                   <Select onValueChange={handleTermsTemplateSelect} value={field.value || "none"}>
                                       <FormControl><SelectTrigger><SelectValue placeholder="Select a terms template" /></SelectTrigger></FormControl>
                                       <SelectContent>
                                           <SelectItem value="none">-- No Template --</SelectItem>
                                           {isLoadingTemplates ? (
                                               <SelectItem value="loading" disabled>Loading templates...</SelectItem>
                                           ) : (
                                               termsTemplates.map(template => (
                                                   <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                                               ))
                                           )}
                                       </SelectContent>
                                   </Select>
                                   <FormDescription>
                                       Selecting a template will auto-populate the terms content. You can still edit it afterwards.
                                   </FormDescription>
                                   <FormMessage />
                               </FormItem>
                           )}
                       />
                       <FormField
                           control={form.control}
                           name="termsAndConditions"
                           render={({ field }) => (
                               <FormItem>
                                   <FormLabel>Terms and Conditions Content</FormLabel>
                                   <FormControl>
                                       <RichTextEditor
                                           value={field.value}
                                           onChange={field.onChange}
                                           onBlur={field.onBlur}
                                           placeholder="Enter terms and conditions here. Supports basic formatting."
                                       />
                                   </FormControl>
                                   <FormDescription className="flex items-center justify-between">
                                       <span>This content will be included in the order form preview and PDF.</span>
                                       {isAutoSavingTerms && <span className="text-sm text-yellow-600 animate-pulse">Auto-saving...</span>}
                                   </FormDescription>
                                   <FormMessage />
                               </FormItem>
                           )}
                       />
                   </CardContent>
               </Card>

         </div>

         {/* Summary Card - Right Column */}
         <div className="lg:col-span-1 space-y-6">
           <Card>
             <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
             <CardContent className="space-y-3">
               <div className="flex justify-between font-medium">
                 <span>Subtotal:</span>
                 <span>{currentCurrencySymbol} {mainItemsSubtotal.toFixed(2)}</span>
               </div>
               {totalAdditionalCharges > 0 && (
                 <div className="flex justify-between">
                   <span>Additional Charges:</span>
                   <span>{currentCurrencySymbol} {totalAdditionalCharges.toFixed(2)}</span>
                 </div>
               )}
               {watchDiscountEnabled && (
                 <>
                   <div className="flex justify-between">
                     <span>Pre-Discount Total:</span>
                     <span>{currentCurrencySymbol} {preDiscountSubtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-red-600 dark:text-red-400">
                     <span>Discount ({ 'N/A'}):</span>
                     <span>- {currentCurrencySymbol} {discountAmount.toFixed(2)}</span>
                   </div>
                 </>
               )}
               <div className="flex justify-between border-t pt-3 font-medium">
                 <span>Taxable Amount:</span>
                 <span>{currentCurrencySymbol} {taxableAmount.toFixed(2)}</span>
               </div>
               <FormField
                 control={form.control}
                 name="taxRate"
                 rules={{
                   min: { value: 0, message: 'Tax rate cannot be negative.' },
                   max: { value: 100, message: 'Tax rate cannot exceed 100%.' },
                   validate: (value) => !isNaN(value) || 'Tax rate must be a number.',
                 }}
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Tax Rate (%)</FormLabel>
                     <FormControl>
                       <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <div className="flex justify-between">
                 <span>Tax Amount ({watchedTaxRate || 0}%):</span>
                 <span>{currentCurrencySymbol} {taxAmount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-xl font-bold border-t border-b py-4">
                 <span>TOTAL:</span>
                 <span>{currentCurrencySymbol} {total.toFixed(2)}</span>
               </div>
             </CardContent>
             <CardFooter className="justify-end">
               <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Invoice'}
               </Button>
             </CardFooter>
           </Card>

           {/* Additional Information */}
           <Card>
             <CardHeader>
               <CardTitle>Additional Information</CardTitle>
               <ShadCNCardDesc>Optional notes or internal information.</ShadCNCardDesc>
             </CardHeader>
             <CardContent>
               <FormField
                 control={form.control}
                 name="notes"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Notes</FormLabel>
                     <FormControl>
                       <Input placeholder="Internal notes (optional)" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             </CardContent>
           </Card>
         </div>
       </div>
     </form>
   </Form>
 );
}