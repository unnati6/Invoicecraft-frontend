
import * as React from 'react';
import { Button } from './ui/button';
import { Form } from './ui/form'; // You might not need to import these if replacing
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import ModernCalendar from './ui/ModernCalendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from './ui/card';
// import { purchaseOrderFormSchema, type PurchaseOrderFormData, type PurchaseOrderItemFormData } from '@/lib/schemas'; // REMOVED
// import type { PurchaseOrder } from '@/types'; // REMOVED
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Save, Trash2 } from 'lucide-react';
import { getCurrencySymbol } from '../lib/currency-utils';

// Removed all type definitions.
// You'll need to understand the expected shape of data based on context.

const currencies = [
  { value: 'USD', label: 'USD - United States Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'GBP', label: 'GBP - British Pound Sterling' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'INR', label: 'INR - Indian Rupee' },
];

export function PurchaseOrderForm({
  onSubmit,
  initialData,
  isSubmitting = false,
    poNumber,
  isViewMode = false,
}) {
  // --- State Management ---
  // Replaces useForm and zodResolver
  const [formData, setFormData] = React.useState(() => {
    if (initialData) {
      return {
        ...initialData,
        issueDate: new Date(initialData.issueDate),
        items: initialData.items.map(item => ({
          id: item.id, // Assuming id exists on initial items
          description: item.description,
          quantity: item.quantity,
          procurementPrice: item.procurementPrice,
        })),
      };
    } else {
      return {
        poNumber: poNumber || '',
        vendorName: '',
        issueDate: new Date(),
        items: [{ description: '', quantity: 1, procurementPrice: 0 }],
        status: 'Draft',
        currencyCode: 'USD',
        orderFormId: undefined,
        orderFormNumber: undefined,
      };
    }
  });

  const [errors, setErrors] = React.useState({});
  
  
// Effect to update poNumber when it's fetched by the parent
  React.useEffect(() => {
    // Only update if it's a new form (no initialData) AND poNumber is provided
    // AND the current formData.poNumber is different from the new poNumber
    if (!initialData && poNumber && formData.poNumber !== poNumber) {
      setFormData(prev => ({ ...prev, poNumber: poNumber }));
    }
  }, [poNumber, initialData, formData.poNumber]);

  // --- Handlers for Form Fields ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for the field when it changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, issueDate: date }));
    if (errors.issueDate) {
      setErrors(prev => ({ ...prev, issueDate: undefined }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // --- Handlers for Item Array (replaces useFieldArray) ---
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    let parsedValue = value;

    // Convert quantity and price to numbers
    if (name === 'quantity' || name === 'procurementPrice') {
      parsedValue = parseFloat(value) || 0; // Ensures it's a number, defaults to 0 if invalid
    }
    
    newItems[index] = { ...newItems[index], [name]: parsedValue };
    setFormData(prev => ({ ...prev, items: newItems }));

    // Clear item-specific errors if they exist
    if (errors.items && errors.items[index] && errors.items[index][name]) {
      const newItemsErrors = [...(errors.items || [])];
      newItemsErrors[index] = { ...newItemsErrors[index], [name]: undefined };
      setErrors(prev => ({ ...prev, items: newItemsErrors }));
    }
    // Clear general items array error if it exists
    if (typeof errors.items === 'string') {
        setErrors(prev => ({ ...prev, items: undefined }));
    }
  };

  const appendItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, procurementPrice: 0 }],
    }));
    // Clear any general "items" array error when adding a new item
    if (typeof errors.items === 'string') {
        setErrors(prev => ({ ...prev, items: undefined }));
    }
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    // Remove errors for the removed item
    if (errors.items && Array.isArray(errors.items)) {
        const newItemsErrors = errors.items.filter((_, i) => i !== index);
        setErrors(prev => ({ ...prev, items: newItemsErrors }));
    }
  };

  // --- Manual Validation Function ---
  const validateForm = () => {
    const newErrors = {};

    if (!formData.vendorName) {
      newErrors.vendorName = 'Vendor Name is required.';
    }
    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue Date is required.';
    }
    if (!formData.currencyCode) {
      newErrors.currencyCode = 'Currency is required.';
    }
    if (!formData.status) {
        newErrors.status = 'Status is required.';
    }

    if (!formData.items || formData.items.length === 0) {
      newErrors.items = 'At least one item is required.';
    } else {
      const itemErrors = formData.items.map((item, index) => {
        const itemSpecificErrors = {};
        if (!item.description.trim()) {
          itemSpecificErrors.description = 'Description is required.';
        }
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          itemSpecificErrors.quantity = 'Quantity must be a positive number.';
        }
        if (typeof item.procurementPrice !== 'number' || item.procurementPrice < 0) {
          itemSpecificErrors.procurementPrice = 'Price must be a non-negative number.';
        }
        return Object.keys(itemSpecificErrors).length > 0 ? itemSpecificErrors : null;
      });

      if (itemErrors.some(error => error !== null)) {
        newErrors.items = itemErrors;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Calculated Values ---
  const currentCurrencySymbol = getCurrencySymbol(formData.currencyCode);

  const grandTotalVendorPayable = React.useMemo(() => {
    return formData.items.reduce((sum, item) => {
      const itemTotal = (Number(item.quantity) || 0) * (Number(item.procurementPrice) || 0);
      return sum + itemTotal;
    }, 0);
  }, [formData.items]);

  // --- Form Submission ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // For a new PO, the poNumber will be 'Auto-generated on save' here.
      // We should NOT send this placeholder to the backend.
      // The backend's trigger will generate the actual po_number.
      const dataToSubmit = { ...formData };
      if (!initialData) { // Only remove poNumber if it's a new form
          delete dataToSubmit.poNumber;
      }
      onSubmit(dataToSubmit);
    }
  };
  return (
    // Removed Form context from Shadcn UI, replaced with direct form element
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isViewMode
              ? `View Purchase Order: ${initialData?.poNumber || 'Loading...'}`
              : (initialData ? `Edit Purchase Order: ${initialData.poNumber}` : 'Create New Purchase Order')}
              </CardTitle>
          {initialData?.orderFormNumber && (
            <CardDescription>
              Linked to Order Form: {initialData.orderFormNumber}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PO Number */}
            <div className="flex flex-col space-y-1.5"> {/* Mimic FormItem */}
                  <label htmlFor="poNumber" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">PO Number *</label> {/* Mimic FormLabel */}
              <Input
                id="poNumber"
                name="poNumber"
      placeholder={initialData ? initialData.poNumber : (poNumber || 'Loading PO number...')} // Dynamic placeholder based on initialData or fetched poNumber
                value={initialData ? formData.poNumber : (poNumber || 'Loading PO number...')} // Display fetched poNumber for new POs
                     disabled={isViewMode || isSubmitting || !!initialData || (!!poNumber && !initialData)}
                      />
              {errors.poNumber && <p className="text-sm font-medium text-destructive">{errors.poNumber}</p>} {/* Mimic FormMessage */}
            </div>

            {/* Vendor Name */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="vendorName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Vendor Name *</label>
              <Input
                id="vendorName"
                name="vendorName"
                placeholder="e.g. Supplier Corp"
                value={formData.vendorName}
                onChange={handleChange}
                disabled={isViewMode || isSubmitting}
              />
              {errors.vendorName && <p className="text-sm font-medium text-destructive">{errors.vendorName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Issue Date */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="issueDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Issue Date *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn('w-full pl-3 text-left font-normal', !formData.issueDate && 'text-muted-foreground')}
                    disabled={isViewMode || isSubmitting}
                  >
                    {formData.issueDate ? format(formData.issueDate, 'PPP') : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <ModernCalendar
                    mode="single"
                    selected={formData.issueDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.issueDate && <p className="text-sm font-medium text-destructive">{errors.issueDate}</p>}
            </div>

            {/* Currency */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="currencyCode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Currency</label>
              <Select
                onValueChange={(value) => handleSelectChange('currencyCode', value)}
                value={formData.currencyCode}
                disabled={isViewMode || isSubmitting || !!initialData?.orderFormId /* Lock if from OF */}
              >
                <SelectTrigger id="currencyCode">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!!initialData?.orderFormId && <p className="text-sm text-muted-foreground">Currency is inherited from the linked Order Form.</p>}
              {errors.currencyCode && <p className="text-sm font-medium text-destructive">{errors.currencyCode}</p>}
            </div>

            {/* Status */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Status</label>
              <Select
                onValueChange={(value) => handleSelectChange('status', value)}
                value={formData.status}
                disabled={isViewMode || isSubmitting}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {['Draft', 'Issued', 'Sent', 'Cancelled'].map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm font-medium text-destructive">{errors.status}</p>}
            </div>
          </div>

          <h3 className="text-lg font-semibold pt-4 border-t">Items</h3>
          {formData.items.map((item, index) => (
            <div key={item.id || index} className="grid grid-cols-12 gap-x-4 gap-y-2 items-start p-3 border rounded-md relative">
              {/* Description */}
              <div className="col-span-12 md:col-span-5 flex flex-col space-y-1.5">
                {index === 0 && <label htmlFor={`item-${index}-description`} className="text-xs">Description *</label>}
                <Input
                  id={`item-${index}-description`}
                  name="description"
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, e)}
                  disabled={isViewMode || isSubmitting}
                />
                {errors.items && errors.items[index]?.description && (
                  <p className="text-sm font-medium text-destructive">{errors.items[index].description}</p>
                )}
              </div>

              {/* Quantity */}
              <div className="col-span-4 md:col-span-2 flex flex-col space-y-1.5">
                {index === 0 && <label htmlFor={`item-${index}-quantity`} className="text-xs">Quantity *</label>}
                <Input
                  id={`item-${index}-quantity`}
                  name="quantity"
                  type="number"
                  placeholder="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, e)}
                  disabled={isViewMode || isSubmitting}
                />
                {errors.items && errors.items[index]?.quantity && (
                  <p className="text-sm font-medium text-destructive">{errors.items[index].quantity}</p>
                )}
              </div>

              {/* Procurement Price */}
              <div className="col-span-4 md:col-span-2 flex flex-col space-y-1.5">
                {index === 0 && <label htmlFor={`item-${index}-price`} className="text-xs">Proc. Price ({currentCurrencySymbol}) *</label>}
                <Input
                  id={`item-${index}-price`}
                  name="procurementPrice"
                  type="number"
                  placeholder="0.00"
                  value={item.procurementPrice}
                  onChange={(e) => handleItemChange(index, e)}
                  disabled={isViewMode || isSubmitting}
                />
                {errors.items && errors.items[index]?.procurementPrice && (
                  <p className="text-sm font-medium text-destructive">{errors.items[index].procurementPrice}</p>
                )}
              </div>

              {/* Item Total */}
              <div className="col-span-4 md:col-span-2 flex items-end h-full">
                {index === 0 && <label className="text-xs md:invisible md:block">Total</label>}
                <p className="py-2 text-sm font-medium min-w-[70px] text-right">
                  {currentCurrencySymbol}{((Number(item.quantity) || 0) * (Number(item.procurementPrice) || 0)).toFixed(2)}
                </p>
              </div>

              {/* Remove Item Button */}
              {!isViewMode && (
                <div className="col-span-12 md:col-span-1 flex items-end justify-end h-full pt-2 md:pt-0">
                  {formData.items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-destructive hover:text-destructive" disabled={isSubmitting}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add Item Button */}
          {!isViewMode && (
            <Button
              type="button"
              variant="outline"
              onClick={appendItem}
              className="mt-2"
              disabled={isSubmitting}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          )}
          {errors.items && typeof errors.items === 'string' && ( // For the general "at least one item" error
            <p className="text-sm font-medium text-destructive">{errors.items}</p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-end gap-2 border-t pt-4">
          <div className="text-lg font-semibold">
            Grand Total Payable: {currentCurrencySymbol}{grandTotalVendorPayable.toFixed(2)}
          </div>
          {!isViewMode && (
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Purchase Order')}
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}

PurchaseOrderForm.displayName = "PurchaseOrderForm";