import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppHeader } from '../../components/ui/layout/app-header';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../../components/ui/card';
import axios from 'axios';
import { DataTable } from '../../components/ui/DataTable';
import { DeleteConfirmationDialog } from '../../components/delete-confirmation-dialog';
import {
  PlusCircle,
  Edit,
  Trash2,
  PackageSearch,
  LayoutGrid,
  ListFilter,
  Eye,
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { Input } from '../../components/ui/input';
import { getCurrencySymbol } from '../../lib/currency-utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as ShadDialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '../../components/ui/dialog';
import { ScrollArea } from '../../components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
const dummyItems = [
  {
    id: '1',
    name: 'Sample Item A',
    customerName: 'ABC Corp',
    defaultRate: 1200,
    defaultProcurementPrice: 1000,
    defaultVendorName: 'Vendor A',
    currencyCode: 'USD',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Sample Item B',
    customerName: null,
    defaultRate: 800,
    defaultProcurementPrice: 700,
    defaultVendorName: 'Vendor B',
    currencyCode: 'INR',
    createdAt: new Date().toISOString(),
  },
];
 
function RepositoryItemPreviewDialog({ item, trigger }) {
  const currencySymbol = getCurrencySymbol(item.currencyCode);
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Preview: {item.name}</DialogTitle>
          {item.customerName && (
            <ShadDialogDescription>
              Customer Specific: {item.customerName}
            </ShadDialogDescription>
          )}
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1 pr-4">
          <div className="space-y-2 text-sm">
            <p><strong>Default Rate:</strong> {currencySymbol}{item.defaultRate?.toFixed(2) || 'N/A'}</p>
            <p><strong>Default Procurement Price:</strong> {currencySymbol}{item.defaultProcurementPrice?.toFixed(2) || 'N/A'}</p>
            <p><strong>Default Vendor Name:</strong> {item.defaultVendorName || 'N/A'}</p>
            <p><strong>Default Currency:</strong> {item.currencyCode || 'N/A'}</p>
            <p><strong>Created At:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ItemRepositoryPage() {
  const { toast } = useToast();

  const [repositoryItems, setRepositoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('card');
const navigate = useNavigate();
   const handleNavigate = React.useCallback((path) => {
      navigate(path);
    }, [navigate]);
 const fetchItems = useCallback(async () => {
  setLoading(true);
  try {
    const res = await axios.get('http://localhost:5000/api/item-route');
    setRepositoryItems(res.data); // Axios response data
  } catch (error) {
    console.error("Failed to fetch item:", error);
    toast({
      title: "Error",
      description: "Unable to fetch repository items.",
    });
  } finally {
    setLoading(false);
  }
}, [toast]);


  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
const handleDeleteItem = async (id) => {
  try {
    await axios.delete(`http://localhost:5000/api/item-route/${id}`);
    setRepositoryItems((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: 'Success',
      description: 'Repository item deleted.',
    });
  } catch (error) {
    console.error('Delete failed:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete repository item.',
      variant: 'destructive',
    });
  }
};
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return repositoryItems;
    const lower = searchTerm.toLowerCase();
    return repositoryItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.defaultVendorName?.toLowerCase().includes(lower) ||
        item.customerName?.toLowerCase().includes(lower)
    );
  }, [repositoryItems, searchTerm]);

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (row) => row.name,
    },
    {
      accessorKey: 'customerName',
      header: 'Customer Name',
      cell: (row) => row.customerName || 'N/A',
    },
    {
      accessorKey: 'defaultRate',
      header: 'Default Rate',
      cell: (row) => `${getCurrencySymbol(row.currencyCode)}${row.defaultRate?.toFixed(2) || 'N/A'}`,
    },
    {
      accessorKey: 'defaultProcurementPrice',
      header: 'Proc. Price',
      cell: (row) => `${getCurrencySymbol(row.currencyCode)}${row.defaultProcurementPrice?.toFixed(2) || 'N/A'}`,
    },
    {
      accessorKey: 'defaultVendorName',
      header: 'Default Vendor',
      cell: (row) => row.defaultVendorName || 'N/A',
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-1">
          <RepositoryItemPreviewDialog
            item={row}
            trigger={
              <Button variant="ghost" size="icon" title="Preview Item">
                <Eye className="h-4 w-4" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            title="Edit Item"
            onClick={() => console.log('Navigate to edit:', row.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        <DeleteConfirmationDialog
  onConfirm={() => handleDeleteItem(row.id)}
  itemName={`repository item "${row.name}"`}
  trigger={
    <Button variant="ghost" size="icon" title="Delete Item">
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  }
/>
        </div>
      ),
    },
  ];

  return (
    <>
      <AppHeader title="Item Repository">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Filter by item, vendor, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-64"
          />
          <Button
            variant={viewMode === 'card' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('card')}
            title="Card View"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <ListFilter className="h-4 w-4" />
          </Button>
         <Link
                    to="/Additemrepository"
                    onClick={(e) => {
                      e.preventDefault();
                          e.stopPropagation();
                      handleNavigate("/Additemrepository");
                    }}
                  >
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                  </Link>
        </div>
      </AppHeader>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <PackageSearch className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {searchTerm ? 'No Matching Items Found' : 'No Items in Repository'}
            </h2>
            <p className="text-muted-foreground mb-4 max-w-md">
              {searchTerm
                ? `Your search for "${searchTerm}" did not match any items.`
                : 'Add items manually or they will appear here automatically after Order Form or Invoice usage.'}
            </p>
            <a href="/item-repository/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Default Item
              </Button>
            </a>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <RepositoryItemPreviewDialog
                key={item.id}
                item={item}
                trigger={
                  <Card className="flex flex-col cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3 pt-4 px-4">
                      <CardTitle className="text-base truncate" title={item.name}>
                        {item.name}
                      </CardTitle>
                      {item.customerName && (
                        <CardDescription className="text-xs">
                          Customer: {item.customerName}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="text-sm px-4 pb-2 space-y-1 flex-grow">
                      <p>Rate: {getCurrencySymbol(item.currencyCode)}{item.defaultRate?.toFixed(2) || 'N/A'}</p>
                      <p>Proc. Price: {getCurrencySymbol(item.currencyCode)}{item.defaultProcurementPrice?.toFixed(2) || 'N/A'}</p>
                      <p>Vendor: {item.defaultVendorName || 'N/A'}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-1 border-t pt-3 mt-auto">
<Button
  variant="ghost"
  size="icon"
  title="Edit Item"
  onClick={(e) => {
    e.preventDefault();
    handleNavigate(`/item-repository/${item.id}/edit`);
  }}
>
  <Edit className="h-4 w-4" />
</Button>

                    
<DeleteConfirmationDialog
  onConfirm={() => handleDeleteItem(item.id)}
  itemName={`repository item "${item.name}"`}
  trigger={
    <Button
      variant="ghost"
      size="icon"
      title="Delete Item"
      onClick={(e) => e.stopPropagation()} // ⛔ Prevent preview
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  }
/>
                    </CardFooter>
                  </Card>
                }
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Repository Items</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={filteredItems}
                onRowClick={(row) => console.log('Row clicked for edit:', row.id)}
                noResultsMessage={
                  searchTerm
                    ? `No items match your filter "${searchTerm}".`
                    : 'No items found.'
                }
              />
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
