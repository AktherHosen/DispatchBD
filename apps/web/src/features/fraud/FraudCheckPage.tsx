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
import { Search, Shield, AlertTriangle, CheckCircle } from "lucide-react";

const fraudLogs = [
  {
    id: "1",
    phone: "01712345678",
    riskLevel: "low",
    totalOrders: 15,
    successRate: 93.3,
    lastChecked: "2024-01-15"
  },
  {
    id: "2",
    phone: "01812345678",
    riskLevel: "high",
    totalOrders: 8,
    successRate: 37.5,
    lastChecked: "2024-01-14"
  },
  {
    id: "3",
    phone: "01912345678",
    riskLevel: "medium",
    totalOrders: 12,
    successRate: 66.7,
    lastChecked: "2024-01-14"
  }
];

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fraud Check</h1>
        <p className="text-muted-foreground">
          Check phone number fraud risk before dispatching orders
        </p>
      </div>

      {/* Check form */}
      <Card>
        <CardHeader>
          <CardTitle>Check Phone Number</CardTitle>
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
              <Button>
                <Shield className="h-4 w-4 mr-2" />
                Check Risk
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search phone..." className="w-48" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              {fraudLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.phone}</TableCell>
                  <TableCell>{getRiskBadge(log.riskLevel)}</TableCell>
                  <TableCell>{log.totalOrders}</TableCell>
                  <TableCell>{log.successRate}%</TableCell>
                  <TableCell>{log.lastChecked}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
