import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppBreadcrumb } from "@/components/layout/AppLayout";
import { useGetStoreOrdersQuery, useGetCourierOrdersQuery } from "@/store/api";
import { ArrowLeft, Package, Truck, AlertCircle, MapPin, Phone, Mail, Hash, Clock, Banknote } from "lucide-react";

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-500 hover:bg-yellow-600" },
    processing: { label: "Processing", className: "bg-blue-500 hover:bg-blue-600" },
    shipped: { label: "Shipped", className: "bg-blue-500 hover:bg-blue-600" },
    delivered: { label: "Delivered", className: "bg-green-500 hover:bg-green-600" },
    cancelled: { label: "Cancelled", className: "" },
    returned: { label: "Returned", className: "bg-orange-500 hover:bg-orange-600" },
    picked: { label: "Picked", className: "bg-blue-500 hover:bg-blue-600" },
    in_transit: { label: "In Transit", className: "bg-blue-500 hover:bg-blue-600" }
  };
  const info = map[status] || { label: status, className: "" };
  return <Badge className={info.className || undefined}>{info.label}</Badge>;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: storeData, isLoading: storeLoading, error: storeError } = useGetStoreOrdersQuery({ page: 1, limit: 100 });
  const { data: courierData, isLoading: courierLoading } = useGetCourierOrdersQuery({ page: 1, limit: 100 });

  const isLoading = storeLoading || courierLoading;

  const storeOrder = storeData?.orders.find(o => o._id === id);
  const courierOrder = courierData?.orders.find(o => o._id === id || o.storeOrderId?._id === id);
  const order = storeOrder;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AppBreadcrumb items={[{ label: "Orders", href: "/stores/orders" }, { label: "Detail" }]} />
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (storeError) {
    return (
      <div className="space-y-6">
        <AppBreadcrumb items={[{ label: "Orders", href: "/stores/orders" }, { label: "Detail" }]} />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load order details.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!order && !courierOrder) {
    return (
      <div className="space-y-6">
        <AppBreadcrumb items={[{ label: "Orders", href: "/stores/orders" }, { label: "Detail" }]} />
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Order not found.</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const displayOrder = order || {
    _id: courierOrder!._id,
    orderNumber: courierOrder!.consignmentId,
    customerName: (courierOrder!.storeOrderId as any)?.customerName ?? "—",
    customerPhone: (courierOrder!.storeOrderId as any)?.customerPhone ?? "—",
    customerEmail: (courierOrder!.storeOrderId as any)?.customerEmail ?? "—",
    shippingAddress: (courierOrder!.storeOrderId as any)?.shippingAddress ?? "—",
    shippingCity: (courierOrder!.storeOrderId as any)?.shippingCity ?? "—",
    status: courierOrder!.status,
    total: courierOrder!.amount,
    currency: "BDT",
    items: (courierOrder!.storeOrderId as any)?.items ?? [],
    createdAt: courierOrder!.createdAt
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: "Orders", href: "/stores/orders" }, { label: displayOrder.orderNumber }]} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{displayOrder.orderNumber}</h1>
            <p className="text-muted-foreground">
              Created {new Date(displayOrder.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        {getStatusBadge(displayOrder.status)}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-medium">{displayOrder.customerName.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium">{displayOrder.customerName}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{displayOrder.customerPhone || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{displayOrder.customerEmail || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{displayOrder.shippingAddress || "—"}</span>
              </div>
              {displayOrder.shippingCity && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{displayOrder.shippingCity}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Order Number
                </span>
                <span className="font-medium">{displayOrder.orderNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Created
                </span>
                <span className="font-medium">{new Date(displayOrder.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(displayOrder.status)}
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>{displayOrder.currency} {displayOrder.total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      {displayOrder.items && displayOrder.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Items ({displayOrder.items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {displayOrder.items.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium">{displayOrder.currency} {item.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courier Info */}
      {courierOrder && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Courier Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Courier</span>
              <span className="font-medium">{courierOrder.courierConnectionId?.name ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Consignment ID</span>
              <span className="font-medium">{courierOrder.consignmentId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getStatusBadge(courierOrder.status)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {courierOrder?.statusHistory && courierOrder.statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Status Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-4">
              <div className="absolute left-[17px] top-0 bottom-0 w-px bg-border" />
              {courierOrder.statusHistory.map((entry, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  <div className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border ${
                    i === 0 ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"
                  }`}>
                    {i === 0 ? (
                      <Truck className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-medium">{i}</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(entry.status)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-sm text-muted-foreground">{entry.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Button>
    </div>
  );
}
