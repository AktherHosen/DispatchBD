import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Truck, DollarSign, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Total Orders",
    value: "1,234",
    description: "+12% from last month",
    icon: ShoppingBag
  },
  {
    title: "Active Couriers",
    value: "8",
    description: "2 pending connection",
    icon: Truck
  },
  {
    title: "Total Sales",
    value: "৳45,231",
    description: "+8% from last month",
    icon: DollarSign
  },
  {
    title: "Success Rate",
    value: "94.5%",
    description: "+2.1% from last month",
    icon: TrendingUp
  }
];

const recentOrders = [
  {
    id: "ORD-001",
    customer: "Rahim Uddin",
    store: "Fashion BD",
    amount: "৳1,250",
    status: "delivered",
    courier: "Steadfast"
  },
  {
    id: "ORD-002",
    customer: "Karim Ahmed",
    store: "Tech Store",
    amount: "৳3,500",
    status: "in_transit",
    courier: "Pathao"
  },
  {
    id: "ORD-003",
    customer: "Fatima Begum",
    store: "Fashion BD",
    amount: "৳890",
    status: "pending",
    courier: "Steadfast"
  },
  {
    id: "ORD-004",
    customer: "Hasan Ali",
    store: "Home Needs",
    amount: "৳2,100",
    status: "delivered",
    courier: "Pathao"
  },
  {
    id: "ORD-005",
    customer: "Nusrat Jahan",
    store: "Fashion BD",
    amount: "৳1,750",
    status: "in_transit",
    courier: "Steadfast"
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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            You made 26 sales this month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer} • {order.store}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-medium">{order.amount}</p>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
