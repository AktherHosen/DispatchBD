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
    id: "ORD-001",
    customer: "Rahim Uddin",
    phone: "01712345678",
    store: "Fashion BD",
    amount: "৳1,250",
    status: "delivered",
    date: "2024-01-15"
  },
  {
    id: "ORD-002",
    customer: "Karim Ahmed",
    phone: "01812345678",
    store: "Tech Store",
    amount: "৳3,500",
    status: "in_transit",
    date: "2024-01-14"
  },
  {
    id: "ORD-003",
    customer: "Fatima Begum",
    phone: "01912345678",
    store: "Fashion BD",
    amount: "৳890",
    status: "pending",
    date: "2024-01-14"
  },
  {
    id: "ORD-004",
    customer: "Hasan Ali",
    phone: "01612345678",
    store: "Home Needs",
    amount: "৳2,100",
    status: "delivered",
    date: "2024-01-13"
  },
  {
    id: "ORD-005",
    customer: "Nusrat Jahan",
    phone: "01512345678",
    store: "Fashion BD",
    amount: "৳1,750",
    status: "in_transit",
    date: "2024-01-13"
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
    case "processing":
      return <Badge className="bg-purple-500 hover:bg-purple-600">Processing</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default function StoreOrdersPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Orders</h1>
          <p className="text-muted-foreground">
            View and manage orders from your stores
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync Orders
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
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.phone}</TableCell>
                  <TableCell>{order.store}</TableCell>
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
