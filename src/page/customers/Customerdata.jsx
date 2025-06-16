
import * as React from 'react';
import { AppHeader } from '../../components/ui/layout/app-header';
import { Button as ShadCNButton } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DataTable } from '../../components/ui/DataTable';
import { DeleteConfirmationDialog as ClientDeleteConfirmationDialog } from '../../components/delete-confirmation-dialog';
import { Skeleton } from '../../components/ui/skeleton';
import { PlusCircle, Edit, Trash2 as ClientTrash2Icon } from 'lucide-react';
import { useToast as ClientUseToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../lib/axiosInstance'; // Assuming this path is correct

// ✅ CORRECTED: getAllCustomers to handle Axios response
const getAllCustomers = async () => {
  try {
    const response = await axiosInstance.get('/customers');
    // Axios automatically parses JSON and puts it in .data
    // It throws an error for non-2xx status codes, so no need for !response.ok check here
    return response.data;
  } catch (error) {
    // Axios errors have a specific structure
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch customers from server.";
      console.error("Axios Error fetching customers:", errorMessage, error.response);
      throw new Error(errorMessage);
    }
    console.error("Unexpected Error fetching customers:", error);
    throw new Error("An unexpected error occurred while fetching customers.");
  }
};

// ✅ CORRECTED: removeCustomer to handle Axios response and potential 409
const removeCustomer = async (customerId) => {
  try {
    const response = await axiosInstance.delete(`/customers/${customerId}`);
    // If delete is successful, Axios response status will be 204 (No Content) or 200.
    // If the backend returns 204, response.data will be empty.
    // We just need to ensure no error was thrown.
    return true; // Indicates success
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Check for 409 Conflict specifically
      if (error.response?.status === 409) {
        throw new Error(error.response?.data?.error || 'Customer is linked with other records and cannot be deleted.');
      }
      // Handle other Axios errors
      const message = error.response?.data?.message || error.message || 'Something went wrong while deleting the customer.';
      console.error("Axios Error deleting customer:", message, error.response);
      throw new Error(message);
    }
    console.error("Unexpected Error deleting customer:", error);
    throw new Error("An unexpected error occurred while deleting the customer.");
  }
};

export function DeleteCustomerButton({ customerId, customerName, onDeleted }) {
  const { toast } = ClientUseToast(); // Assuming ClientUseToast is correctly imported and functional

  const handleDelete = async () => {
    try {
      await removeCustomer(customerId); // No need for 'success' variable if function only throws on error

      toast({
        title: "Deleted",
        description: `${customerName} was successfully deleted.`,
        variant: 'default',
      });
      onDeleted(); // Refresh list
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error.message || `Failed to delete ${customerName}.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <ClientDeleteConfirmationDialog
      onConfirm={handleDelete}
      itemName={customerName}
      trigger={
        <ShadCNButton variant="ghost" size="icon" onClick={(e) => { e.stopPropagation() }} title="Delete Customer">
          <ClientTrash2Icon className="h-4 w-4 text-destructive" />
        </ShadCNButton>
      }
    />
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = ClientUseToast();
  const navigate = useNavigate();
React.useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) {
        window.location.replace('/');
      }
    };
  }, []);
  const handleNavigate = React.useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const fetchCustomers = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllCustomers(); // Correctly get data from the modified getAllCustomers
      setCustomers(data);
    } catch (error) {
      // The error thrown from getAllCustomers already contains a descriptive message
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Define Customer interface for JSDoc if you want type hints
  /**
   * @typedef {Object} Customer
   * @property {string} id
   * @property {string} name
   * @property {string} email
   * @property {string} [phone]
   * // Add other properties your customer object might have
   */

  const columns = [
    { accessorKey: 'name', header: 'Name', cell: (/** @type {Customer} */ row) => row.name },
    { accessorKey: 'email', header: 'Email', cell: (/** @type {Customer} */ row) => row.email },
    { accessorKey: 'phone', header: 'Phone', cell: (/** @type {Customer} */ row) => row.phone || 'N/A' },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (/** @type {Customer} */ row) => (
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/customers/${row.id}/edit`}
            onClick={(e) => {
              e.stopPropagation();
            }}
            title="Edit Customer"
          >
            <ShadCNButton variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </ShadCNButton>
          </Link>
          <DeleteCustomerButton customerId={row.id} customerName={row.name} onDeleted={fetchCustomers} />
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <>
        <AppHeader title="Customers">
          <ShadCNButton disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
          </ShadCNButton>
        </AppHeader>

        <main className="flex-1 p-4 md:p-6 space-y-6">
          <Card>
            <CardHeader><CardTitle>All Customers</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Customers">
        <Link
          to="/Addcustomer"
          onClick={(e) => {
            e.preventDefault(); // Prevent default Link behavior to use handleNavigate
            handleNavigate("/Addcustomer");
          }}
        >
          <ShadCNButton>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
          </ShadCNButton>
        </Link>
      </AppHeader>
      {/* main wrapper with maxWidth for content */}
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              className="w-full"
              columns={columns}
              data={customers}
              onRowClick={(row) => handleNavigate(`/customers/${row.id}/edit`)}
              noResultsMessage="No customers found. Add your first customer!"
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
