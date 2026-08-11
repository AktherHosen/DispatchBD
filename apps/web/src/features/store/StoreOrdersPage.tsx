import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppBreadcrumb } from "@/components/layout/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { useGetStoreOrdersQuery, useSyncStoreOrdersMutation, useSendToCourierMutation, useBulkSendToCourierMutation, useGetCourierConnectionsQuery, useAddOrderNoteMutation } from "@/store/api";
import { useGetStoreConnectionsQuery } from "@/store/api";
import { Search, RefreshCw, Eye, MoreHorizontal, Send, Filter, AlertCircle, Loader2, Truck, ShoppingBag, Download, CheckSquare } from "lucide-react";
import { toast } from "sonner";

function exportToCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(row => headers.map(h => {
      const val = String(row[h] ?? "");
      return val.includes(",") || val.includes('"') || val.includes("\n")
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    }).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function getStatusBadge(status: string) {
  switch (status) {
    case "delivered":
      return <Badge className="bg-green-500 hover:bg-green-600">Delivered</Badge>;
    case "shipped":
    case "in_transit":
      return <Badge className="bg-blue-500 hover:bg-blue-600">In Transit</Badge>;
    case "pending":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
    case "processing":
      return <Badge className="bg-purple-500 hover:bg-purple-600">Processing</Badge>;
    case "cancelled":
    case "returned":
      return <Badge variant="destructive">{status === "cancelled" ? "Cancelled" : "Returned"}</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default function StoreOrdersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useGetStoreOrdersQuery({
    page,
    limit: 20,
    status: statusFilter || undefined,
    search: search || undefined
  });

  const { data: connectionsData } = useGetStoreConnectionsQuery({});
  const [syncOrders, { isLoading: isSyncing }] = useSyncStoreOrdersMutation();
  const [sendToCourier, { isLoading: isSending }] = useSendToCourierMutation();
  const { data: courierData } = useGetCourierConnectionsQuery();

  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedCourier, setSelectedCourier] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkSendDialogOpen, setBulkSendDialogOpen] = useState(false);
  const [bulkCourier, setBulkCourier] = useState("");
  const [bulkSendToCourier, { isLoading: isBulkSending }] = useBulkSendToCourierMutation();

  const handleSync = async (storeConnectionId: string) => {
    try {
      await syncOrders(storeConnectionId).unwrap();
      toast.success("Orders synced successfully");
    } catch {
      toast.error("Failed to sync orders");
    }
  };

  const handleSendToCourier = async () => {
    if (!selectedOrder || !selectedCourier) return;
    try {
      await sendToCourier({
        storeOrderId: selectedOrder,
        courierConnectionId: selectedCourier
      }).unwrap();
      toast.success("Order sent to courier");
      setSendDialogOpen(false);
      setSelectedOrder(null);
      setSelectedCourier("");
    } catch {
      toast.error("Failed to send order to courier");
    }
  };

  const openSendDialog = (orderId: string) => {
    setSelectedOrder(orderId);
    setSelectedCourier("");
    setSendDialogOpen(true);
  };

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const orders = data?.orders ?? [];
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(o => o._id)));
    }
  };

  const handleBulkSend = async () => {
    if (!bulkCourier || selectedOrders.size === 0) return;
    try {
      await bulkSendToCourier({
        orderIds: Array.from(selectedOrders),
        courierConnectionId: bulkCourier
      }).unwrap();
      toast.success(`${selectedOrders.size} orders sent to courier`);
      setBulkSendDialogOpen(false);
      setSelectedOrders(new Set());
      setBulkCourier("");
    } catch {
      toast.error("Failed to bulk send orders");
    }
  };

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: "Stores", href: "/stores" }, { label: "Orders" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Orders</h1>
          <p className="text-muted-foreground">
            View and manage orders from your stores
          </p>
        </div>
        {connectionsData?.connections?.[0]?._id && (
          <Button onClick={() => handleSync(connectionsData.connections[0]._id)} disabled={isSyncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            Sync Orders
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load orders. Please try again.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                {pagination ? `${pagination.total} orders total` : "Loading..."}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full sm:w-64 pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => {
                const rows = (data?.orders ?? []).map(o => ({
                  OrderNumber: o.orderNumber,
                  Customer: o.customerName,
                  Phone: o.customerPhone,
                  Email: o.customerEmail,
                  City: o.shippingCity,
                  Status: o.status,
                  Total: o.total,
                  Currency: o.currency,
                  CreatedAt: new Date(o.createdAt).toLocaleString()
                }));
                exportToCsv(`store-orders-${new Date().toISOString().slice(0,10)}.csv`, rows);
              }}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {selectedOrders.size > 0 && (
                <Button variant="default" size="sm" onClick={() => setBulkSendDialogOpen(true)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send ({selectedOrders.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders found"
              description="Orders will appear here once you sync them from your connected stores."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={orders.length > 0 && selectedOrders.size === orders.length}
                        onChange={toggleSelectAll}
                        className="h-4 w-4"
                      />
                    </TableHead>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order._id)}
                          onChange={() => toggleSelectOrder(order._id)}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.customerPhone}</TableCell>
                      <TableCell>৳{order.total.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/orders/${order._id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openSendDialog(order._id)}>
                              <Send className="mr-2 h-4 w-4" />
                              Send to Courier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Update Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send to Courier</DialogTitle>
            <DialogDescription>
              Select a courier to send this order for delivery.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Courier</label>
              <Select value={selectedCourier} onValueChange={(v) => setSelectedCourier(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select courier" />
                </SelectTrigger>
                <SelectContent>
                  {(courierData?.connections ?? []).map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendToCourier} disabled={!selectedCourier || isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Send Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkSendDialogOpen} onOpenChange={setBulkSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send {selectedOrders.size} Orders to Courier</DialogTitle>
            <DialogDescription>Select a courier to send all selected orders.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Courier</Label>
              <Select value={bulkCourier} onValueChange={(v) => setBulkCourier(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select courier" />
                </SelectTrigger>
                <SelectContent>
                  {(courierData?.connections ?? []).map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkSendDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkSend} disabled={!bulkCourier || isBulkSending}>
              {isBulkSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send {selectedOrders.size} Orders
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
