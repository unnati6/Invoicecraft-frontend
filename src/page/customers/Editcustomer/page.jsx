'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/layout/app-header';
import { CustomerForm } from '../../../components/Customer-form';
import { useToast } from '../../../hooks/use-toast';
import { Skeleton } from '../../../components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { CheckSquare, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { getCurrencySymbol } from '../../../lib/currency-utils';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Keep axios import for axios.isAxiosError
import axiosInstance from '../../../lib/axiosInstance'; // ✅ Import the configured axiosInstance
async function getCustomerById(customerId) {
  try {
    const response = await axiosInstance.get(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error("Customer not found.");
    }
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch customer details.";
    console.error("Error fetching customer:", errorMessage, error.response);
    throw new Error(errorMessage);
  }
}

async function updateCustomerApi(customerId, data) {
  try {
    const response = await axiosInstance.put(`/customers/${customerId}`, data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to update customer.";
    console.error("Error updating customer:", errorMessage, error.response);
    throw new Error(errorMessage);
  }
}

async function deleteCustomerApi(customerId) {
  try {
    await axiosInstance.delete(`/customers/${customerId}`);
    return true; // Indicate success
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new Error(error.response?.data?.error || 'Customer is linked with other records and cannot be deleted.');
    }
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Customer not found for deletion.');
    }
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete customer.";
    console.error("Error deleting customer:", errorMessage, error.response);
    throw new Error(errorMessage);
  }
}


export default function EditCustomerPage() {
  const navigate = useNavigate();
  const { id: customerId } = useParams();
  const { toast } = useToast();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCustomerDeleted, setIsCustomerDeleted] = useState(false);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [isMarkingPaid, setIsMarkingPaid] = useState(null);
  const [totalPaidByCustomer, setTotalPaidByCustomer] = useState(0);
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) {
        window.location.replace('/');
      }
    };
  }, []);
  useEffect(() => {
    if (!customerId) {
      navigate('/customers');
      return;
    }

    async function loadCustomer() {
      setLoading(true);
      try {
        // ✅ Use the new API function
        const data = await getCustomerById(customerId);
        setCustomer(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message, // Use error.message from the API function
          variant: 'destructive',
        });
        navigate('/customers'); // Navigate away on error
      } finally {
        setLoading(false);
      }
    }
    if (!isCustomerDeleted) loadCustomer();
  }, [customerId, navigate, toast, isCustomerDeleted]);

  useEffect(() => {
    async function loadInvoices() {
      setIsLoadingInvoices(true);
      try {
        const mockInvoices = [];
        setCustomerInvoices(mockInvoices);
        const paidTotal = mockInvoices.reduce((sum, inv) => sum + (inv.status === 'Paid' ? inv.total : 0), 0);
        setTotalPaidByCustomer(paidTotal);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch customer invoices.', variant: 'destructive' });
      } finally {
        setIsLoadingInvoices(false);
      }
    }
    if (customer && !isCustomerDeleted) loadInvoices();
  }, [customer, toast, isCustomerDeleted]);

const handleSubmit = async (data) => {
    try {
      // ✅ Use the new API function
      await updateCustomerApi(customerId, data);
      toast({
        title: 'Success',
        description: 'Customer updated successfully.',
      });
      navigate('/customers'); // Navigate back to customer list after update
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update customer.',
        variant: 'destructive',
      });
    }
  };

  // Handle customer deletion
  const handleDeleteCustomer = async () => {
    if (!customer || isDeleting || isCustomerDeleted) return;

    setIsDeleting(true); // Set deleting state
    try {
      // ✅ Use the new API function for deletion
      await deleteCustomerApi(customerId);
      setIsCustomerDeleted(true); // Set local state for UI rendering
      setCustomer(null); // Clear customer data
      setCustomerInvoices([]); // Clear invoices
      setTotalPaidByCustomer(0); // Reset total paid
      toast({ title: 'Success', description: `${customer.name} deleted successfully.` });
      navigate('/customers'); // Navigate to customer list
    } catch (error) {
      setIsDeleting(false); // Reset deleting state on error
      toast({
        title: 'Delete Failed',
        description: error.message || `Failed to delete ${customer.name}.`,
        variant: 'destructive',
      });
    }
  };

  const handleMarkInvoicePaidOnCustomerPage = async (invoiceId) => {
    setIsMarkingPaid(invoiceId);
    setTimeout(() => {
      const updated = customerInvoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv
      );
      setCustomerInvoices(updated);
      setTotalPaidByCustomer(
        updated.reduce((sum, inv) => sum + (inv.status === 'Paid' ? inv.total : 0), 0)
      );
      setIsMarkingPaid(null);
      toast({ title: 'Success', description: `Invoice ${invoiceId} marked as paid.` });
    }, 500);
  };

  if (isCustomerDeleted) {
    return (
      <>
        <AppHeader title="Customer Deleted" showBackButton />
        <main className="flex-1 p-4 text-center">
          <p className="text-green-600 font-semibold">Customer was successfully deleted!</p>
          <Button onClick={() => navigate('/customers')}>Go to Customer List</Button>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <AppHeader title="Edit Customer" showBackButton />
        <main className="p-4 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-12 w-full" />
        </main>
      </>
    );
  }

  if (!customer) {
    return (
      <>
        <AppHeader title="Error" showBackButton />
        <main className="p-4 text-center">Customer not found.</main>
      </>
    );
  }

  return (
    <>
      <AppHeader title={`Edit Customer: ${customer.name}`} showBackButton onDelete={handleDeleteCustomer} />
      <main className="p-4 space-y-6">
        <CustomerForm formAction={handleSubmit} initialData={customer} />
        <Card>
          <CardHeader>
            <CardTitle><FileText className="mr-2 h-5 w-5" /> Invoices for {customer.name}</CardTitle>
            <CardDescription>All invoices for this customer</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInvoices ? (
              <Skeleton className="h-10 w-full" />
            ) : customerInvoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        <Badge>{invoice.status}</Badge>
                      </TableCell>
                      <TableCell>{getCurrencySymbol(invoice.currencyCode)}{invoice.total.toFixed(2)}</TableCell>
                      <TableCell>
                        {invoice.status !== 'Paid' && (
                          <Button
                            onClick={() => handleMarkInvoicePaidOnCustomerPage(invoice.id)}
                            disabled={isMarkingPaid === invoice.id}
                          >
                            {isMarkingPaid === invoice.id ? 'Processing...' : 'Mark as Paid'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No invoices found.</p>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            Total Paid: {getCurrencySymbol(customer.currency)}{totalPaidByCustomer.toFixed(2)}
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
