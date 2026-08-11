import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Plus, Truck, ExternalLink, MoreHorizontal, Pencil, Trash2, Settings } from "lucide-react";

const connections = [
  {
    id: "1",
    name: "Steadfast",
    apiEndpoint: "https://api.steadfast.com.bd",
    status: "active",
    orderCount: 120
  },
  {
    id: "2",
    name: "Pathao Courier",
    apiEndpoint: "https://merchant-api-live.pathao.com",
    status: "inactive",
    orderCount: 0
  }
];

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
    case "inactive":
      return <Badge variant="secondary">Inactive</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default function CourierConnectionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courier Connections</h1>
          <p className="text-muted-foreground">
            Manage your courier provider connections
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Courier
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connections.map((conn) => (
          <Card key={conn.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{conn.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="h-4 w-4" />
                  <span className="truncate">{conn.apiEndpoint}</span>
                </div>
                <div className="flex items-center justify-between">
                  {getStatusBadge(conn.status)}
                  <span className="text-sm text-muted-foreground">
                    {conn.orderCount} orders
                  </span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
