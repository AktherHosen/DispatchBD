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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  AppBreadcrumb
} from "@/components/layout/AppLayout";
import {
  Plus,
  Store,
  ExternalLink,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye
} from "lucide-react";

const connections = [
  {
    id: "1",
    name: "Fashion BD",
    platform: "woocommerce",
    storeUrl: "https://fashionbd.com",
    status: "active",
    lastSyncAt: "2024-01-15T10:30:00Z",
    orderCount: 156
  },
  {
    id: "2",
    name: "Tech Store",
    platform: "woocommerce",
    storeUrl: "https://techstore.com",
    status: "inactive",
    lastSyncAt: null,
    orderCount: 0
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
      <AppBreadcrumb items={[{ label: "Stores", href: "/stores" }]} />
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

      <Tabs defaultValue="grid" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connections.map((conn) => (
              <Card key={conn.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{conn.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync Now
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{conn.platform}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ExternalLink className="h-4 w-4" />
                      <span className="truncate">{conn.storeUrl}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(conn.status)}
                      <span className="text-sm text-muted-foreground">
                        {conn.orderCount} orders
                      </span>
                    </div>
                    {conn.lastSyncAt && (
                      <p className="text-xs text-muted-foreground">
                        Last sync: {new Date(conn.lastSyncAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connections.map((conn) => (
                    <TableRow key={conn.id}>
                      <TableCell className="font-medium">{conn.name}</TableCell>
                      <TableCell>{conn.platform}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {conn.storeUrl}
                      </TableCell>
                      <TableCell>{getStatusBadge(conn.status)}</TableCell>
                      <TableCell>{conn.orderCount}</TableCell>
                      <TableCell>
                        {conn.lastSyncAt
                          ? new Date(conn.lastSyncAt).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Orders
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
