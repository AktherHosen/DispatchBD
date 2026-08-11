import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppBreadcrumb } from "@/components/layout/AppLayout";
import {
  useCheckPhoneMutation,
  useGetFraudChecksQuery,
  useGetFraudStatsQuery,
  useGetCourierConnectionsQuery,
  useBulkScoreOrdersMutation,
  useGetHeldOrdersQuery,
  useReleaseHeldOrderMutation
} from "@/store/api";
import { Search, Shield, AlertTriangle, CheckCircle, Loader2, AlertCircle, Zap, RotateCcw } from "lucide-react";
import { toast } from "sonner";

function getRiskBadge(level: string) {
  switch (level) {
    case "low":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Low Risk
        </Badge>
      );
    case "medium":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Medium Risk
        </Badge>
      );
    case "high":
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          High Risk
        </Badge>
      );
    default:
      return <Badge>{level}</Badge>;
  }
}

export default function FraudCheckPage() {
  const [phone, setPhone] = useState("");
  const [selectedCourier, setSelectedCourier] = useState("");
  const [search, setSearch] = useState("");
  const [autoHold, setAutoHold] = useState(false);
  const [checkPhone, { isLoading: isChecking, error: checkError, data: checkResult }] = useCheckPhoneMutation();
  const { data: fraudData, isLoading: isLoadingChecks } = useGetFraudChecksQuery({});
  const { data: stats, isLoading: isLoadingStats } = useGetFraudStatsQuery();
  const { data: couriersData, isLoading: isLoadingCouriers } = useGetCourierConnectionsQuery();
  const [bulkScore, { isLoading: isBulkScoring }] = useBulkScoreOrdersMutation();
  const { data: heldData, isLoading: isLoadingHeld } = useGetHeldOrdersQuery();
  const [releaseOrder, { isLoading: isReleasing }] = useReleaseHeldOrderMutation();

  const fraudLogs = fraudData?.logs || [];
  const courierConnections = couriersData?.connections || [];
  const activeCouriers = courierConnections.filter((c) => c.status === "active");
  const heldOrders = heldData?.orders || [];

  const handleCheck = async () => {
    if (!phone || !selectedCourier) return;
    try {
      await checkPhone({ phone, courierConnectionId: selectedCourier }).unwrap();
      setPhone("");
    } catch (err) {
      console.error("Fraud check failed:", err);
    }
  };

  const handleBulkScore = async () => {
    try {
      const result = await bulkScore({ autoHold }).unwrap();
      toast.success(`Scored ${result.summary.total} orders: ${result.summary.high} high risk, ${result.summary.held} held`);
    } catch (err) {
      toast.error("Failed to score orders");
    }
  };

  const handleRelease = async (orderId: string) => {
    try {
      await releaseOrder(orderId).unwrap();
      toast.success("Order released from hold");
    } catch (err) {
      toast.error("Failed to release order");
    }
  };

  const getErrorMessage = () => {
    if (!checkError) return null;
    if ("data" in checkError) {
      return (checkError.data as { message?: string })?.message || "Failed to check phone";
    }
    return "Failed to check phone";
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: "Fraud Check" }]} />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fraud & Risk Check</h1>
        <p className="text-muted-foreground">
          Check phone risk, score orders, and manage held orders
        </p>
      </div>

      <Tabs defaultValue={0} className="space-y-4">
        <TabsList>
          <TabsTrigger value={0}>Phone Check</TabsTrigger>
          <TabsTrigger value={1}>Order Scoring</TabsTrigger>
          <TabsTrigger value={2}>Held Orders ({heldOrders.length})</TabsTrigger>
          <TabsTrigger value={3}>History</TabsTrigger>
        </TabsList>

        {/* Phone Check Tab */}
        <TabsContent value={0} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Check Phone Number</CardTitle>
              </div>
              <CardDescription>
                Check fraud risk using courier APIs + internal order history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeCouriers.length === 0 && !isLoadingCouriers ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No active courier connections found. Please add and activate a courier connection first.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {checkError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{getErrorMessage()}</AlertDescription>
                    </Alert>
                  )}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="courier">Courier Provider</Label>
                      <Select value={selectedCourier} onValueChange={(v) => setSelectedCourier(v ?? "")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select courier" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingCouriers ? (
                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                          ) : (
                            activeCouriers.map((courier) => (
                              <SelectItem key={courier._id} value={courier._id}>
                                {courier.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="01XXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleCheck}
                        disabled={isChecking || !phone || !selectedCourier}
                        className="w-full"
                      >
                        {isChecking ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Shield className="h-4 w-4 mr-2" />
                        )}
                        Check Risk
                      </Button>
                    </div>
                  </div>

                  {checkResult && (
                    <div className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{checkResult.phone}</p>
                          <p className="text-xs text-muted-foreground">External provider: {checkResult.provider}</p>
                        </div>
                        {getRiskBadge(checkResult.riskLevel)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">External Risk</p>
                          <p className="font-medium">{checkResult.riskLevel} ({checkResult.totalOrders} orders, {checkResult.successRate.toFixed(1)}% success)</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Internal Risk</p>
                          <p className="font-medium">{checkResult.internalRisk} (score: {checkResult.internalScore})</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {isLoadingStats ? (
              [1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.low || 0}</div>
                    <p className="text-xs text-muted-foreground">Phone numbers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.medium || 0}</div>
                    <p className="text-xs text-muted-foreground">Phone numbers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.high || 0}</div>
                    <p className="text-xs text-muted-foreground">Phone numbers</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Order Scoring Tab */}
        <TabsContent value={1} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <CardTitle>Bulk Risk Scoring</CardTitle>
              </div>
              <CardDescription>
                Score all pending orders for fraud risk based on phone history, zone RTO rate, and order value deviation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoHold}
                    onChange={(e) => setAutoHold(e.target.checked)}
                    className="rounded"
                  />
                  Auto-hold high-risk orders
                </label>
                <Button onClick={handleBulkScore} disabled={isBulkScoring}>
                  {isBulkScoring ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Score All Pending Orders
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Scoring formula: Phone returns (40%) + Zone RTO rate (35%) + Order value deviation (25%)
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Held Orders Tab */}
        <TabsContent value={2} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle>Held Orders</CardTitle>
              </div>
              <CardDescription>
                Orders held due to high fraud risk — review and release or dispatch manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHeld ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : heldOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No held orders</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Held At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {heldOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.customerPhone}</TableCell>
                        <TableCell>৳{order.total.toLocaleString()}</TableCell>
                        <TableCell>{getRiskBadge(order.riskLevel)}</TableCell>
                        <TableCell>{order.storeConnectionId?.name || "—"}</TableCell>
                        <TableCell>{new Date(order.heldAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRelease(order._id)}
                            disabled={isReleasing}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Release
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value={3} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Check History</CardTitle>
                  <CardDescription>
                    Previous fraud check results
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search phone..."
                    className="w-48 pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingChecks ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Total Orders</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Checked By</TableHead>
                      <TableHead>Last Checked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fraudLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No fraud checks yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      fraudLogs
                        .filter((log) => !search || log.phone.includes(search))
                        .map((log) => (
                          <TableRow key={log._id}>
                            <TableCell className="font-medium">{log.phone}</TableCell>
                            <TableCell>{getRiskBadge(log.riskLevel)}</TableCell>
                            <TableCell>{log.totalOrders}</TableCell>
                            <TableCell>{log.successRate.toFixed(1)}%</TableCell>
                            <TableCell>{log.checkedBy?.name || "Unknown"}</TableCell>
                            <TableCell>{new Date(log.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
