import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, RefreshCw, Eye } from "lucide-react";

const orders = [
  {
    id: "COUR-001",
    orderId: "ORD-001",
    customer: "Rahim Uddin",
    consignmentId: "SF-123456",
    courier: "Steadfast",
    amount: "৳1,250",
    status: "delivered",
    date: "2024-01-15"
  },
  {
    id: "COUR-002",
    orderId: "ORD-002",
    customer: "Karim Ahmed",
    consignmentId: "PT-789012",
    courier: "Pathao",
    amount: "৳3,500",
    status: "in_transit",
    date: "2024-01-14"
  },
  {
    id: "COUR-003",
    orderId: "ORD-003",
    customer: "Fatima Begum",
    consignmentId: "SF-345678",
    courier: "Steadfast",
    amount: "৳890",
    status: "pending",
    date: "2024-01-14"
  }
];

function getStatusBadge(status: string) {
  switch (status) {
    case "delivered":
      return <Badge className="bg-green-500 hover:bg-green-600">Delivered</Badge>;
    case "in_transit":
      return <Badge className="bg-blue-500 hover:bg-blue-600">In Transit</Badge>;
    case "pending":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default function CourierOrdersPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courier Orders</h1>
          <p className="text-muted-foreground">
            Track orders sent to courier providers
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync Status
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                {orders.length} orders total
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Consignment ID</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Courier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.consignmentId}</TableCell>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.courier}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
