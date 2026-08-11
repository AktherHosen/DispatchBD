import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppBreadcrumb } from "@/components/layout/AppLayout";
import { useGetDashboardStatsQuery } from "@/store/api";
import { ShoppingBag, Truck, Store, DollarSign, TrendingUp, AlertCircle } from "lucide-react";

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

export default function DashboardPage() {
  const { data, isLoading, error } = useGetDashboardStatsQuery();

  const stats = data?.stats;
  const recentOrders = data?.recentOrders ?? [];

  const statCards = [
    {
      title: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag
    },
    {
      title: "Active Couriers",
      value: stats?.activeCouriers ?? 0,
      icon: Truck
    },
    {
      title: "Active Stores",
      value: stats?.activeStores ?? 0,
      icon: Store
    },
    {
      title: "Success Rate",
      value: `${stats?.successRate ?? 0}%`,
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: "Dashboard" }]} />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your business.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load dashboard data. Please try again.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20 rounded-md" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue={0} className="space-y-4">
        <TabsList>
          <TabsTrigger value={0}>Recent Orders</TabsTrigger>
          <TabsTrigger value={1}>Analytics</TabsTrigger>
          <TabsTrigger value={2}>Courier Performance</TabsTrigger>
        </TabsList>

        <TabsContent value={0} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Your latest store orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-medium">৳{order.total.toLocaleString()}</p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={1} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>
                Your business performance at a glance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Total Revenue</p>
                  <div className="text-3xl font-bold">
                    ৳{(stats?.totalRevenue ?? 0).toLocaleString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Success Rate</p>
                  <div className="text-3xl font-bold">
                    {stats?.successRate ?? 0}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={2} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Courier Performance</CardTitle>
              <CardDescription>
                Track courier delivery performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Courier analytics coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
