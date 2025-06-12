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
import { BASE_URL } from '../../lib/Api';
const getAllCustomers = async () => {
  const res = await fetch(`${BASE_URL}/customers`);
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
};
const removeCustomer = async (customerId) => {
  try {
    const res = await axios.delete(`${BASE_URL}/customers/${customerId}`);

    if (res.status === 409) {
      throw new Error(res.data?.error || 'Customer is linked with other records.');
    }

    return true;
  } catch (error) {
    // Axios attaches response data in error.response
    const message =
      error.response?.data?.error ||
      error.message ||
      'Something went wrong while deleting.';
    throw new Error(message);
  }
};



  export function DeleteCustomerButton({ customerId, customerName, onDeleted }) {
    const { toast } = ClientUseToast();
const handleDelete = async () => {
  try {
    const success = await removeCustomer(customerId);

    if (success) {
      toast({
        title: "Deleted",
        description: `${customerName} was successfully deleted.`,
        variant: 'default',
        duration: 180000,
      });
      onDeleted(); // Refresh list
    }
  } catch (error) {
    toast({
      title: "Delete Failed",
      description: error.message || `Failed to delete ${customerName}.`,
      variant: 'destructive',
        duration: 180000,
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

    const handleNavigate = React.useCallback((path) => {
      navigate(path);
    }, [navigate]);

    const fetchCustomers = React.useCallback(async () => {
      setLoading(true);
      try {
        const data = await getAllCustomers();
        setCustomers(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch customers.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }, [toast]);

    React.useEffect(() => {
      fetchCustomers();
    }, [fetchCustomers]);

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
              e.preventDefault();
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