// src/components/customer-form.jsx


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
import { countries } from '../lib/countries';
import { states } from '../lib/states';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Save, Copy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useFormStatus } from 'react-dom';

// Define the schema directly as a JavaScript object for basic validation
const customerSchema = {
  firstname: { required: true, message: 'First Name is required.' },
  lastname: { required: true, message: 'Last Name is required.' },
  email: { required: true, message: 'Email is required.', pattern: /^\S+@\S+\.\S+$/i, patternMessage: 'Invalid email address.' },
  phone: {pattern: /^\+?[0-9]{10}$/,
patternMessage: 'Enter a valid phone number.',
 required: true, message: 'Phone number is required.' 
}, // Optional field, no specific validation here
  currency: { required: true, message: 'Currency is required.' },
  company: {
    name: { required: true, message: 'Company Name is required.' },
    email: { pattern: /^\S+@\S+\.\S+$/i, patternMessage: 'Invalid email address.',required: true, message: 'Company Email is required.' },
    street: {},
    city: {},
    state: {},
    zip: {},
    country: {},
  },
  billingAddress: {
    street: {},
    city: {},
    state: {},
    zip: {},
    country: {},
  },
  shippingAddress: {
    street: {},
    city: {},
    state: {},
    zip: {},
    country: {},
  },
};

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

export function CustomerForm({ initialData, formAction }) {
  
  // Custom resolver for a simple JavaScript object schema
  const customResolver = (schema) => async (values) => {
    const errors = {};
    for (const key in schema) {
      if (schema[key].required && !values[key]) {
        errors[key] = {
          type: 'required',
          message: schema[key].message || 'This field is required.',
        };
      }
      if (schema[key].pattern && values[key] && !schema[key].pattern.test(values[key])) {
        errors[key] = {
          type: 'pattern',
          message: schema[key].patternMessage || 'Invalid format.',
        };
      }
      // Handle nested objects (like company, billingAddress, shippingAddress)
      if (typeof schema[key] === 'object' && !Array.isArray(schema[key]) && key !== 'pattern') {
        for (const nestedKey in schema[key]) {
          const fullPath = `${key}.${nestedKey}`;
          const nestedValue = values[key]?.[nestedKey];
          if (schema[key][nestedKey].required && !nestedValue) {
            errors[fullPath] = {
              type: 'required',
              message: schema[key][nestedKey].message || 'This field is required.',
            };
          }
          if (schema[key][nestedKey].pattern && nestedValue && !schema[key][nestedKey].pattern.test(nestedValue)) {
            errors[fullPath] = {
              type: 'pattern',
              message: schema[key][nestedKey].patternMessage || 'Invalid format.',
            };
          }
        }
      }
    }
    return {
      values: values,
      errors: errors,
    };
  };

  const form = useForm({
    resolver: customResolver(customerSchema),
    defaultValues: {
      firstname: initialData?.firstname || '',
      lastname: initialData?.lastname || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      currency: initialData?.currency || 'USD',
      company: {
        name: initialData?.company?.name || '',
        email: initialData?.company?.email || '',
        street: initialData?.company?.street || '',
        city: initialData?.company?.city || '',
        state: initialData?.company?.state || '',
        zip: initialData?.company?.name || '',
        country: initialData?.company?.country || '',
      },
      billingAddress: {
        street: initialData?.billingAddress?.street || '',
        city: initialData?.billingAddress?.city || '',
        state: initialData?.billingAddress?.state || '',
        zip: initialData?.billingAddress?.zip || '',
        country: initialData?.billingAddress?.country || '',
      },
      shippingAddress: {
        street: initialData?.shippingAddress?.street || '',
        city: initialData?.shippingAddress?.city || '',
        state: initialData?.shippingAddress?.state || '',
        zip: initialData?.shippingAddress?.zip || '',
        country: initialData?.shippingAddress?.country || '',
      },
    },
  });
   const { watch } = form;
  const selectedCountry = watch("company.country");
  const handleCopyBillingAddress = () => {
    const billing = form.getValues('billingAddress');
    if (billing) {
      form.setValue('shippingAddress.street', billing.street || '', { shouldDirty: true, shouldValidate: true });
      form.setValue('shippingAddress.city', billing.city || '', { shouldDirty: true, shouldValidate: true });
      form.setValue('shippingAddress.state', billing.state || '', { shouldDirty: true, shouldValidate: true });
      form.setValue('shippingAddress.zip', billing.zip || '', { shouldDirty: true, shouldValidate: true });
      form.setValue('shippingAddress.country', billing.country || '', { shouldDirty: true, shouldValidate: true });
    }
  };

  function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending} aria-disabled={pending}>
        {pending ? (
          <>
            <Save className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" /> {initialData ? 'Update Customer' : 'Create Customer'}
          </>
        )}
      </Button>
    );
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (data) => {
        console.log("DEBUG: CustomerForm onSubmit triggered after validation. Data:", data);
        await formAction(data);
      })}>
        <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit Customer' : 'Add New Customer'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John " {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g.  Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g. john.doe@example.com" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. (123) 456-7890" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || 'USD'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <p className="text-base font-semibold text-foreground pt-4">Company Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="company.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="brandworks worldwide" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g. Brandwork@example.com" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 123 Main St" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Anytown" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="company.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
  <FormControl>
    <SelectTrigger>
      <SelectValue placeholder="Select state" />
    </SelectTrigger>
  </FormControl>
  <SelectContent>
    {states
      .filter((s) => s.country_name === selectedCountry)
      .map((s) => (
        <SelectItem key={s.name} value={s.name}>
          {s.name}
        </SelectItem>
      ))}
  </SelectContent>
</Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company.zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip/Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 90210" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
             <FormField
  control={form.control}
  name="company.country"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Country</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value} direction="down">
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.iso2} value={country.name}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
</div>
            <p className="text-base font-semibold text-foreground pt-4">Billing Address</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="billingAddress.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 123 Main St" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingAddress.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Anytown" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="billingAddress.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
  <FormControl>
    <SelectTrigger>
      <SelectValue placeholder="Select state" />
    </SelectTrigger>
  </FormControl>
  <SelectContent>
    {states
      .filter((s) => s.country_name === selectedCountry)
      .map((s) => (
        <SelectItem key={s.name} value={s.name}>
          {s.name}
        </SelectItem>
      ))}
  </SelectContent>
</Select>  <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingAddress.zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip/Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 90210" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
             <FormField
  control={form.control}
  name="billingAddress.country"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Country</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value} direction="down">
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.iso2} value={country.name}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>        </div>

            <div className="flex justify-between items-center pt-4">
              <p className="text-base font-semibold text-foreground">Shipping Address</p>
              <Button type="button" variant="outline" onClick={handleCopyBillingAddress} size="sm">
                <Copy className="mr-2 h-4 w-4" /> Copy Billing Address
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="shippingAddress.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 123 Main St" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingAddress.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Anytown" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="shippingAddress.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
  <FormControl>
    <SelectTrigger>
      <SelectValue placeholder="Select state" />
    </SelectTrigger>
  </FormControl>
  <SelectContent>
    {states
      .filter((s) => s.country_name === selectedCountry)
      .map((s) => (
        <SelectItem key={s.name} value={s.name}>
          {s.name}
        </SelectItem>
      ))}
  </SelectContent>
</Select>           <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingAddress.zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip/Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 90210" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
  control={form.control}
  name="shippingAddress.country"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Country</FormLabel>
     <Select onValueChange={field.onChange} defaultValue={field.value} direction="down">
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.iso2} value={country.name}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/> 
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}