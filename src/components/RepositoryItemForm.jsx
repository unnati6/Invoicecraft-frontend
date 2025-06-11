'use client';

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button as ShadCNButton } from './ui/button';
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription as CardDesc,
} from './ui/card';
import { Save } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { getCurrencySymbol } from '../lib/currency-utils';

const currencies = [
  { value: 'USD', label: 'USD - United States Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'GBP', label: 'GBP - British Pound Sterling' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'CNY', label: 'CNY - Chinese Yuan Renminbi' },
  { value: 'SEK', label: 'SEK - Swedish Krona' },
  { value: 'NZD', label: 'NZD - New Zealand Dollar' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'HKD', label: 'HKD - Hong Kong Dollar' },
  { value: 'NOK', label: 'NOK - Norwegian Krone' },
  { value: 'KRW', label: 'KRW - South Korean Won' },
  { value: 'TRY', label: 'TRY - Turkish Lira' },
  { value: 'RUB', label: 'RUB - Russian Ruble' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'BRL', label: 'BRL - Brazilian Real' },
  { value: 'ZAR', label: 'ZAR - South African Rand' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'ARS', label: 'ARS - Argentine Peso' },
  { value: 'CLP', label: 'CLP - Chilean Peso' },
  { value: 'COP', label: 'COP - Colombian Peso' },
  { value: 'CZK', label: 'CZK - Czech Koruna' },
  { value: 'DKK', label: 'DKK - Danish Krone' },
  { value: 'HUF', label: 'HUF - Hungarian Forint' },
  { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
  { value: 'ILS', label: 'ILS - Israeli New Shekel' },
  { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  { value: 'PHP', label: 'PHP - Philippine Peso' },
  { value: 'PLN', label: 'PLN - Polish Złoty' },
  { value: 'SAR', label: 'SAR - Saudi Riyal' },
  { value: 'THB', label: 'THB - Thai Baht' },
  { value: 'TWD', label: 'TWD - New Taiwan Dollar' },
];
const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  defaultRate: yup
    .number()
    .typeError('Default Rate must be a number')
    .positive('Default Rate must be positive')
    .required('Default Rate is required'),
  defaultProcurementPrice: yup
    .number()
    .typeError('Procurement Price must be a number')
    .min(0, 'Procurement Price must be at least 0'),
    defaultVendorName: yup.string()
  ,
  currencyCode: yup.string().required('Currency is required'),
});

export function RepositoryItemForm({ onSubmit, initialData = null, isSubmitting = false }) {
  const methods = useForm({
    resolver: yupResolver(schema), 
    defaultValues: {
      name: initialData?.name || '',
      defaultRate: initialData?.defaultRate ?? 0,
      defaultProcurementPrice: initialData?.defaultProcurementPrice ?? '',
      defaultVendorName: initialData?.defaultVendorName || '',
      currencyCode: initialData?.currencyCode || 'USD',
      customerId: initialData?.customerId,
      customerName: initialData?.customerName,
    },
  });

  const { register, handleSubmit,setValue, watch, formState: { errors } } = methods;
  const currencyCode = watch('currencyCode');
  const currentCurrencySymbol = getCurrencySymbol(currencyCode);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit Repository Item' : 'Create New Repository Item'}</CardTitle>
            <CardDesc>
              {initialData
                ? 'Modify the default details for this item/service.'
                : 'Define a new global default item/service for your repository.'}
            </CardDesc>
          </CardHeader>

          <CardContent className="space-y-6">
            {initialData?.customerName && (
              <div className="bg-muted/50 p-3 rounded-md border">
                <p className="text-sm font-medium text-foreground">Customer-Specific Item</p>
                <p className="text-xs text-muted-foreground">
                  This item's defaults are specific to: {initialData.customerName}. Editing here updates this customer-specific version.
                </p>
              </div>
            )}

            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name / Description *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Standard Web Development Hour"
                      disabled={isSubmitting || !!initialData?.customerId}
                    />
                  </FormControl>
                  {!!initialData?.customerId && (
                    <FormDescription className="text-xs">
                      Name cannot be changed for customer-specific items. To change the name, create a new item from an Order Form.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                name="defaultRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Selling Rate ({currentCurrencySymbol})</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="currencyCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Currency</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => setValue('currencyCode', value)}
                      disabled={isSubmitting || !!initialData?.customerId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!!initialData?.customerId && (
                      <FormDescription className="text-xs">
                        Currency cannot be changed for customer-specific items.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                name="defaultProcurementPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Procurement Price ({currentCurrencySymbol})</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00 (Optional)"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="defaultVendorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Vendor Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Optional vendor name"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
            {initialData?.customerId && (
              <input type="hidden" {...register('customerId')} value={initialData.customerId} />
            )}
            {initialData?.customerName && (
              <input type="hidden" {...register('customerName')} value={initialData.customerName} />
            )}
          </CardContent>

          <CardFooter>
            <ShadCNButton type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting
                ? initialData
                  ? 'Saving...'
                  : 'Creating...'
                : initialData
                ? 'Save Changes'
                : 'Create Item'}
            </ShadCNButton>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
}
