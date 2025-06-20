import React from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom for navigation
import { AppHeader } from '../../components/ui/layout/app-header'; // Adjust path as per your project structure
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'; // Adjust path
import { DataTable } from '../../components/ui/DataTable';
import { DeleteConfirmationDialog } from '../../components/delete-confirmation-dialog';
import { Badge } from '../../components/ui/badge';
import { Eye, Trash2, PackageOpen, PlusCircle, Edit } from 'lucide-react';
import { useToast } from '../../hooks/use-toast'; // Adjust path
import { format } from 'date-fns';
import { Skeleton } from '../../components/ui/skeleton';// Adjust path
import { getCurrencySymbol } from '../../lib/currency-utils';// Adjust path

// Simulated API calls (replace with actual fetch/axios calls to your backend)
import axiosInstance from '../../lib/axiosInstance';
export default function PurchaseOrdersPage() {
  const navigate = useNavigate(); // For navigation
  // const location = useLocation(); // Not strictly needed for this page, but equivalent to usePathname if you need it.
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
    const PURCHASE_ORDERS_API_BASE_URL = '/Purchaseorder';
   React.useEffect(() => {
    const fetchPurchaseOrders = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(PURCHASE_ORDERS_API_BASE_URL);
        setPurchaseOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch purchase orders:", error);
        const errorMessage = error.response?.data?.message || "Failed to fetch purchase orders.";
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchPurchaseOrders();
  }, [toast]); // Dependencies: toast to ensure it's available

  const handleDeletePurchaseOrder = async (id) => {
    // Client-side validation: Check if PO exists before attempting to delete
    const poToDelete = purchaseOrders.find(po => po.id === id);
    if (!poToDelete) {
      toast({ title: "Error", description: "Purchase Order not found for deletion.", variant: "destructive" });
      return;
    }

    try {
      await axiosInstance.delete(`${PURCHASE_ORDERS_API_BASE_URL}/${id}`);
      setPurchaseOrders(prev => prev.filter(po => po.id !== id));
      toast({ title: "Success", description: "Purchase Order deleted." });
      navigate('/purchaseorder')
    } catch (error) {
      console.error("Failed to delete purchase order:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete purchase order.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Issued': return 'default';
      case 'Fulfilled': return 'secondary';
      case 'Cancelled': return 'destructive';
      case 'Draft': return 'outline';
      default: return 'outline';
    }
  };

  const columns = [
    { accessorKey: 'poNumber', header: 'PO Number', cell: (row) => row.poNumber, size: 120 },
    { accessorKey: 'vendorName', header: 'Vendor', cell: (row) => row.vendorName, size: 200 },
   
    { accessorKey: 'issueDate', header: 'Issue Date', cell: (row) => format(new Date(row.issueDate), 'PP'), size: 120 },
   {
  accessorKey: 'total_amount',
  header: 'Total Payable',
  cell: (row) => {
    const total = row.total_amount ?? 0; // Use 0 if undefined or null
    const currency = getCurrencySymbol(row.currencyCode); // Ensure currencyCode also exists
    return `${currency}${total.toFixed(2)}`;
  },
  size: 130
},
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={getStatusVariant(row.status)} className={row.status === 'Issued' ? 'bg-primary text-primary-foreground hover:bg-primary/80' : ''}>
          {row.status}
        </Badge>
      ),
      size: 100
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/Editpurchaseorder/${row.id}/edit`); }} title="Edit Purchase Order" >
            <Edit className="h-4 w-4" />
          </Button>

            <DeleteConfirmationDialog
              onConfirm={() => handleDeletePurchaseOrder(row.id)}
              itemName={`purchase order ${row.poNumber}`}
              trigger={
                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Delete Purchase Order">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              }
            />
          
        </div>
      ),
      size: 120
    },
  ];

  if (loading) {
    return (
      <>
        <AppHeader title="Purchase Orders">
          <Skeleton className="h-10 w-44" />
        </AppHeader>
        <main className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader><CardTitle>All Purchase Orders</CardTitle><CardDescription>Manage and track your purchase orders to vendors.</CardDescription></CardHeader>
            <CardContent><div className="space-y-2">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div></CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Purchase Orders">
        <Link to="/Newpurchaseorder"> {/* Use Link from react-router-dom */}
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Purchase Order
          </Button>
        </Link>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Purchase Orders</CardTitle>
              </CardHeader>
          <CardContent>
            {purchaseOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[30vh] text-center">
                <PackageOpen className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Purchase Orders Yet</h2>
                <p className="text-muted-foreground">Create your first purchase order </p>
                <Link to="/Newpurchaseorder" className="mt-4"> {/* Use Link from react-router-dom */}
                  <Button><PlusCircle className="mr-2 h-4 w-4" /> Create Purchase Order</Button>
                </Link>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={purchaseOrders}
                onRowClick={(row) => navigate(`Editpurchaseorder/${row.id}/edit`)} // Navigate to the edit/view page
                noResultsMessage="No purchase orders found."
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

// Dummy Link component if react-router-dom is not used directly,
// but it's highly recommended to use a proper router for navigation.
function Link({ to, children, className }) {
  return <a href={to} className={className}>{children}</a>;
}