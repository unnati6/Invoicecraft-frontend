// E:\Invoicecraftproject\frontend\src\app\dashboard\page.js

import * as React from 'react';

// UI Components
import { AppHeader } from '../components/ui/layout/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useNavigate } from 'react-router-dom';

// Hooks and Utilities
import { useToast } from '../hooks/use-toast';
import { getCurrencySymbol } from '../lib/currency-utils';

// Custom Components
import { DashboardChart } from '../components/dashboard-chart';

// *******************************************************************
// *** सुनिश्चित करें कि ये सभी इंपोर्ट्स हटा दिए गए हैं! ***
// *******************************************************************
// import { SidebarProvider, Sidebar, SidebarInset, ... } from '../components/ui/sidebar';
// import { FileText, Users, LogOut, ... } from 'lucide-react';


const MOCK_CONVERSION_RATES_TO_USD = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  INR: 0.012,
  CAD: 0.73,
  AUD: 0.66,
  JPY: 0.0067,
};

export default function DashboardPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = React.useState([]);
  const [customers, setCustomers] = React.useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState('all');
  const [chartData, setChartData] = React.useState([]);
  const [summaryStats, setSummaryStats] = React.useState({
    totalSales: 0,
    received: 0,
    pending: 0,
    currencySymbol: '$',
    customerName: undefined,
  });
  const [currencyBreakdown, setCurrencyBreakdown] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate(); // यदि आप नेविगेशन के लिए इनका उपयोग नहीं कर रहे हैं, तो handleLogout/handleCustomer फ़ंक्शंस के साथ इन्हें हटा दें

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const invoiceData = await new Promise(resolve => setTimeout(() => resolve([
          { id: 'inv1', customerId: 'cust1', total: 100, status: 'Paid', currencyCode: 'USD' },
          { id: 'inv2', customerId: 'cust2', total: 200, status: 'Sent', currencyCode: 'EUR' },
          { id: 'inv3', customerId: 'cust1', total: 50, status: 'Overdue', currencyCode: 'USD' },
          { id: 'inv4', customerId: 'cust3', total: 300, status: 'Paid', currencyCode: 'GBP' },
          { id: 'inv5', customerId: 'cust2', total: 75, status: 'Paid', currencyCode: 'EUR' },
        ]), 500));
        const customerData = await new Promise(resolve => setTimeout(() => resolve([
          { id: 'cust1', name: 'John Doe', currency: 'USD' },
          { id: 'cust2', name: 'Jane Smith', currency: 'EUR' },
          { id: 'cust3', name: 'Bob Johnson', currency: 'GBP' },
        ]), 500));

        setInvoices(invoiceData);
        setCustomers(customerData);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch dashboard data.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  React.useEffect(() => {
    if (invoices.length === 0 && !loading) {
        setChartData([]);
        setSummaryStats({ totalSales: 0, received: 0, pending: 0, currencySymbol: '$', customerName: undefined });
        setCurrencyBreakdown([]);
        return;
    }

    let filteredInvoices = invoices;
    let currentCurrencySymbol = '$';
    let customerNameDisplay;

    if (selectedCustomerId !== 'all') {
      filteredInvoices = invoices.filter(inv => inv.customerId === selectedCustomerId);
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      if (selectedCustomer) {
        currentCurrencySymbol = getCurrencySymbol(selectedCustomer.currency);
        customerNameDisplay = selectedCustomer.name;
      }
    } else {
      currentCurrencySymbol = getCurrencySymbol('USD'); // Default for 'All Customers'
      customerNameDisplay = "All Customers";
    }

    const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const paymentsReceived = filteredInvoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    const paymentsPending = filteredInvoices
      .filter(inv => inv.status === 'Sent' || inv.status === 'Overdue')
      .reduce((sum, inv) => sum + inv.total, 0);

    setChartData([
      { name: 'Total Sales', value: totalSales, fill: 'hsl(var(--chart-1))' },
      { name: 'Payments Received', value: paymentsReceived, fill: 'hsl(var(--chart-2))' },
      { name: 'Payments Pending', value: paymentsPending, fill: 'hsl(var(--chart-3))' },
    ]);

    setSummaryStats({
        totalSales,
        received: paymentsReceived,
        pending: paymentsPending,
        currencySymbol: currentCurrencySymbol,
        customerName: customerNameDisplay
    });

    const salesByCurrency = {};
    filteredInvoices.forEach(inv => {
      const code = inv.currencyCode || 'USD';
      if (!salesByCurrency[code]) {
        salesByCurrency[code] = { total: 0, symbol: getCurrencySymbol(code) };
      }
      salesByCurrency[code].total += inv.total;
    });

    const breakdownResult = Object.entries(salesByCurrency)
      .map(([code, data]) => {
        const rate = MOCK_CONVERSION_RATES_TO_USD[code] || 1;
        return {
          currencyCode: code,
          totalInCurrency: data.total,
          totalInUSD: data.total * rate,
          symbol: data.symbol,
        };
      })
      .sort((a, b) => b.totalInUSD - a.totalInUSD);

    setCurrencyBreakdown(breakdownResult);

  }, [invoices, customers, selectedCustomerId, loading]);

  // handleLogout और handlecustomer फ़ंक्शंस को यहाँ से हटा दें
  // क्योंकि साइडबार अब AppSidebar में है और वहीं से नेविगेशन नियंत्रित होगा।
  // यदि आपको DashboardPage से किसी अन्य पेज पर नेविगेट करने की आवश्यकता है,
  // तो आपको उन फ़ंक्शंस को रखना होगा या उपयुक्त तरीके से नेविगेट करना होगा।
  // const handleLogout = () => { navigate('/'); };
  // const handlecustomer = () => { navigate('/customer'); };

  if (loading) {
    return (
      <>
        <AppHeader title="Dashboard" />
        {/*
          LOADING STATE:
          main tag को यहां भी `max-w-[1000px] mx-auto` क्लास के साथ रैप करें।
        */}
    <main className="flex-1 p-4 md:p-6 space-y-6">
          <Card className="w-full max-w-sm">
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-full" /></CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-3">
            {[1,2,3].map(i => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-24 mb-1"/>
                        <Skeleton className="h-8 w-32"/>
                    </CardHeader>
                </Card>
            ))}
          </div>
          <Card>
            <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
            <CardContent className="h-[350px]"><Skeleton className="h-full w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Dashboard" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
           {/* Customer Selection and Sales Overview Title */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-semibold">
            Sales Overview {summaryStats.customerName && summaryStats.customerName !== "All Customers" ? `for ${summaryStats.customerName}` : `(All Customers)`}
          </h2>
          <Card className="w-full sm:w-auto sm:min-w-[250px]">
            <CardContent className="p-3">
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Total Sales</CardDescription>
              <CardTitle className="text-3xl">{summaryStats.currencySymbol}{summaryStats.totalSales.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Payments Received</CardDescription>
              <CardTitle className="text-3xl">{summaryStats.currencySymbol}{summaryStats.received.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Payments Pending</CardDescription>
              <CardTitle className="text-3xl">{summaryStats.currencySymbol}{summaryStats.pending.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Chart and Currency Breakdown Table */}
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Metrics Overview</CardTitle>
                    <CardDescription>
                    Bar chart showing sales, received, and pending amounts.
                    {selectedCustomerId === 'all' && invoices.length > 0 && (
                        <span className="text-xs block text-muted-foreground/80 mt-1">
                            Note: "All Customers" view uses {getCurrencySymbol('USD')} as the default currency for aggregated totals. Individual customer views will use their specific currency.
                        </span>
                    )}
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] p-2 sm:p-6">
                    {chartData.length > 0 ? (
                    <DashboardChart data={chartData} currencySymbol={summaryStats.currencySymbol} />
                    ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No data to display for the current selection.
                    </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Sales by Currency</CardTitle>
                    <CardDescription>Total sales broken down by currency and their USD equivalent (using mock rates).</CardDescription>
                </CardHeader>
                <CardContent>
                {currencyBreakdown.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Currency</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">USD Equivalent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {currencyBreakdown.map(item => (
                            <TableRow key={item.currencyCode}>
                                <TableCell>{item.currencyCode}</TableCell>
                                <TableCell className="text-right">{item.symbol}{item.totalInCurrency.toFixed(2)}</TableCell>
                                <TableCell className="text-right">${item.totalInUSD.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    No sales data for currency breakdown.
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}