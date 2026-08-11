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
import { Plus, Truck, ExternalLink } from "lucide-react";

const connections = [
  {
    id: "1",
    name: "Steadfast",
    apiEndpoint: "https://api.steadfast.com.bd",
    status: "active"
  },
  {
    id: "2",
    name: "Pathao Courier",
    apiEndpoint: "https://merchant-api-live.pathao.com",
    status: "inactive"
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
                {getStatusBadge(conn.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="h-4 w-4" />
                  <span className="truncate">{conn.apiEndpoint}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Test Connection
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
