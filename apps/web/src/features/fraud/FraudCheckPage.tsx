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
import { useCheckPhoneMutation, useGetFraudChecksQuery, useGetFraudStatsQuery } from "@/store/api";
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
  const [search, setSearch] = useState("");
  const [checkPhone, { isLoading: isChecking }] = useCheckPhoneMutation();
  const { data: fraudData, isLoading: isLoadingChecks } = useGetFraudChecksQuery({});
  const { data: stats, isLoading: isLoadingStats } = useGetFraudStatsQuery();

  const fraudLogs = fraudData?.logs || [];

  const handleCheck = async () => {
    if (!phone) return;
    try {
      await checkPhone({ phone }).unwrap();
      setPhone("");
    } catch (err) {
      console.error("Fraud check failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: "Fraud Check" }]} />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fraud Check</h1>
        <p className="text-muted-foreground">
          Check phone number fraud risk before dispatching orders
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
            Enter a phone number to check its fraud risk level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCheck} disabled={isChecking || !phone}>
                {isChecking ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Check Risk
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {isLoadingStats ? (
          [1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
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
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
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
                  <TableHead>Last Checked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fraudLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
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
