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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Search,
  RefreshCw,
  Eye,
  MoreHorizontal,
  Send,
  Filter,
  Download
} from "lucide-react";

const orders = [
  {
    id: "ORD-001",
    customer: "Rahim Uddin",
    phone: "01712345678",
    store: "Fashion BD",
    amount: "৳1,250",
    status: "delivered",
    courier: "Steadfast",
    date: "2024-01-15"
  },
  {
    id: "ORD-002",
    customer: "Karim Ahmed",
    phone: "01812345678",
    store: "Tech Store",
    amount: "৳3,500",
    status: "in_transit",
    courier: "Pathao",
    date: "2024-01-14"
  },
  {
    id: "ORD-003",
    customer: "Fatima Begum",
    phone: "01912345678",
    store: "Fashion BD",
    amount: "৳890",
    status: "pending",
    courier: "",
    date: "2024-01-14"
  },
  {
    id: "ORD-004",
    customer: "Hasan Ali",
    phone: "01612345678",
    store: "Home Needs",
    amount: "৳2,100",
    status: "delivered",
    courier: "Pathao",
    date: "2024-01-13"
  },
  {
    id: "ORD-005",
    customer: "Nusrat Jahan",
    phone: "01512345678",
    store: "Fashion BD",
    amount: "৳1,750",
    status: "in_transit",
    courier: "Steadfast",
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
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Orders</h1>
          <p className="text-muted-foreground">
            View and manage orders from your stores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Orders
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                {orders.length} orders total
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64 pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
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
        </CardContent>
      </Card>
    </div>
  );
}
