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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppBreadcrumb } from "@/components/layout/AppLayout";
import { useCheckPhoneMutation, useGetFraudChecksQuery, useGetFraudStatsQuery, useGetCourierConnectionsQuery } from "@/store/api";
import { Search, Shield, AlertTriangle, CheckCircle, Loader2, AlertCircle } from "lucide-react";

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
  const [checkPhone, { isLoading: isChecking, error: checkError }] = useCheckPhoneMutation();
  const { data: fraudData, isLoading: isLoadingChecks } = useGetFraudChecksQuery({});
  const { data: stats, isLoading: isLoadingStats } = useGetFraudStatsQuery();
  const { data: couriersData, isLoading: isLoadingCouriers } = useGetCourierConnectionsQuery();

  const fraudLogs = fraudData?.logs || [];
  const courierConnections = couriersData?.connections || [];
  const activeCouriers = courierConnections.filter((c) => c.status === "active");

  const handleCheck = async () => {
    if (!phone || !selectedCourier) return;
    try {
      await checkPhone({ phone, courierConnectionId: selectedCourier }).unwrap();
      setPhone("");
    } catch (err) {
      console.error("Fraud check failed:", err);
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
        <h1 className="text-3xl font-bold tracking-tight">Fraud Check</h1>
        <p className="text-muted-foreground">
          Check phone number fraud risk using your connected courier APIs
        </p>
      </div>

      {/* Check form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Check Phone Number</CardTitle>
          </div>
          <CardDescription>
            Select a courier connection and enter a phone number to check its fraud risk level
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
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

      {/* History */}
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
    </div>
  );
}
