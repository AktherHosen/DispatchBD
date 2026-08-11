import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Building2, Users, User, Ban, CheckCircle } from "lucide-react";

const stats = [
  {
    title: "Total Workspaces",
    value: "45",
    icon: Building2
  },
  {
    title: "Total Users",
    value: "128",
    icon: Users
  },
  {
    title: "Active Members",
    value: "89",
    icon: User
  }
];

const workspaces = [
  {
    id: "1",
    name: "Fashion BD",
    owner: "Rahim Uddin",
    email: "rahim@fashionbd.com",
    status: "active",
    plan: "Pro",
    members: 5,
    createdAt: "2024-01-01"
  },
  {
    id: "2",
    name: "Tech Store",
    owner: "Karim Ahmed",
    email: "karim@techstore.com",
    status: "active",
    plan: "Free",
    members: 2,
    createdAt: "2024-01-05"
  },
  {
    id: "3",
    name: "Home Needs",
    owner: "Fatima Begum",
    email: "fatima@homeneeds.com",
    status: "suspended",
    plan: "Free",
    members: 1,
    createdAt: "2024-01-10"
  }
];

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    case "suspended":
      return (
        <Badge variant="destructive">
          <Ban className="h-3 w-3 mr-1" />
          Suspended
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}

export default function SuperAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin</h1>
        <p className="text-muted-foreground">
          Platform administration and management
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workspaces table */}
      <Card>
        <CardHeader>
          <CardTitle>All Workspaces</CardTitle>
          <CardDescription>
            Manage all workspaces on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.map((ws) => (
                <TableRow key={ws.id}>
                  <TableCell className="font-medium">{ws.name}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{ws.owner}</p>
                      <p className="text-xs text-muted-foreground">{ws.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ws.plan}</Badge>
                  </TableCell>
                  <TableCell>{ws.members}</TableCell>
                  <TableCell>{getStatusBadge(ws.status)}</TableCell>
                  <TableCell>{ws.createdAt}</TableCell>
                  <TableCell>
                    {ws.status === "active" ? (
                      <Button variant="destructive" size="sm">
                        Suspend
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        Reactivate
                      </Button>
                    )}
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
