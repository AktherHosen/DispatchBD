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
import { useGetDashboardStatsQuery, useGetRtoStatsQuery } from "@/store/api";
import { ShoppingBag, Truck, Store, TrendingUp, AlertCircle, DollarSign, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

const RTO_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];

export default function DashboardPage() {
  const { data, isLoading, error } = useGetDashboardStatsQuery();
  const { data: rtoData, isLoading: isLoadingRto } = useGetRtoStatsQuery({ months: 6 });

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
          <TabsTrigger value={3}>RTO Cost</TabsTrigger>
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
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Total Sent</p>
                      <p className="text-2xl font-bold">{(data as any)?.courierPerformance?.total ?? 0}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Delivered</p>
                      <p className="text-2xl font-bold text-green-600">{(data as any)?.courierPerformance?.delivered ?? 0}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold">{(data as any)?.courierPerformance?.successRate ?? 0}%</p>
                    </div>
                  </div>
                  {(data as any)?.courierPerformance?.byStatus?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">By Status</p>
                      {(data as any).courierPerformance.byStatus.map((s: any) => (
                        <div key={s.status} className="flex items-center justify-between py-2 border-b last:border-0">
                          <Badge variant={s.status === "delivered" ? "default" : "secondary"}>
                            {s.status.replace("_", " ")}
                          </Badge>
                          <div className="flex items-center gap-4 text-sm">
                            <span>{s.count} orders</span>
                            <span className="text-muted-foreground">৳{s.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={3} className="space-y-4">
          {isLoadingRto ? (
            <div className="grid gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">RTO Rate</CardTitle>
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{rtoData?.summary.rtoRate ?? 0}%</div>
                    <p className="text-xs text-muted-foreground">
                      {rtoData?.summary.totalReturned ?? 0} of {rtoData?.summary.totalOrders ?? 0} orders
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total RTO Cost</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">৳{(rtoData?.summary.totalRtoCost ?? 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Forward + return leg costs</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Returned Orders</CardTitle>
                    <RotateCcw className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{rtoData?.summary.totalReturned ?? 0}</div>
                    <p className="text-xs text-muted-foreground">Last {rtoData?.summary.periodMonths ?? 6} months</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{rtoData?.summary.totalOrders ?? 0}</div>
                    <p className="text-xs text-muted-foreground">Last {rtoData?.summary.periodMonths ?? 6} months</p>
                  </CardContent>
                </Card>
              </div>

              {rtoData?.monthly && rtoData.monthly.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly RTO Trend</CardTitle>
                    <CardDescription>RTO rate and returned orders over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={rtoData.monthly}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" fontSize={12} />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey="returned" fill="#ef4444" name="Returned" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="left" dataKey="delivered" fill="#22c55e" name="Delivered" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {rtoData?.byCourier && rtoData.byCourier.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>RTO by Courier</CardTitle>
                      <CardDescription>Return costs broken down by courier</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={rtoData.byCourier}
                            dataKey="totalReturns"
                            nameKey="courierName"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={(props: any) => `${props.name || ""} (${((props.percent || 0) * 100).toFixed(0)}%)`}
                          >
                            {rtoData.byCourier.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={RTO_COLORS[index % RTO_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Courier Cost Breakdown</CardTitle>
                      <CardDescription>Forward vs return costs per courier</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {rtoData.byCourier.map((c) => (
                          <div key={c.courierId} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">{c.courierName}</p>
                              <Badge variant="outline">{c.totalReturns} returns</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-muted-foreground">Forward cost</p>
                                <p className="font-medium">৳{c.totalForwardCost.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Return cost</p>
                                <p className="font-medium text-red-600">৳{c.totalReturnCost.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {rtoData?.topReturners && rtoData.topReturners.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Repeat Returners</CardTitle>
                    <CardDescription>Customers with the most returns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {rtoData.topReturners.map((r, i) => (
                        <div key={r.phone} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}.</span>
                            <div>
                              <p className="text-sm font-medium">{r.name}</p>
                              <p className="text-xs text-muted-foreground">{r.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="destructive">{r.returnCount} returns</Badge>
                            <span className="text-muted-foreground">৳{r.totalValue.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
