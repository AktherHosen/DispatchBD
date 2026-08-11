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
import { Plus, Store, ExternalLink, RefreshCw } from "lucide-react";

const connections = [
  {
    id: "1",
    name: "Fashion BD",
    platform: "woocommerce",
    storeUrl: "https://fashionbd.com",
    status: "active",
    lastSyncAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    name: "Tech Store",
    platform: "woocommerce",
    storeUrl: "https://techstore.com",
    status: "inactive",
    lastSyncAt: null
  }
];

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
    case "inactive":
      return <Badge variant="secondary">Inactive</Badge>;
    case "error":
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default function StoreConnectionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Connections</h1>
          <p className="text-muted-foreground">
            Manage your WooCommerce store connections
          </p>
        </div>
        <Link to="/stores/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Store
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connections.map((conn) => (
          <Card key={conn.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{conn.name}</CardTitle>
                </div>
                {getStatusBadge(conn.status)}
              </div>
              <CardDescription>{conn.platform}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="h-4 w-4" />
                  <span className="truncate">{conn.storeUrl}</span>
                </div>
                {conn.lastSyncAt && (
                  <p className="text-xs text-muted-foreground">
                    Last sync: {new Date(conn.lastSyncAt).toLocaleDateString()}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    View Orders
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
