import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppBreadcrumb } from "@/components/layout/AppLayout";
import { useGetStoreConnectionsQuery, useDeleteStoreConnectionMutation, useTestStoreConnectionMutation, useSyncStoreOrdersMutation } from "@/store/api";
import { Plus, Store, ExternalLink, RefreshCw, MoreHorizontal, Pencil, Trash2, Eye, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const { data, isLoading, error } = useGetStoreConnectionsQuery();
  const [deleteConnection] = useDeleteStoreConnectionMutation();
  const [testConnection] = useTestStoreConnectionMutation();
  const [syncOrders, { isLoading: isSyncing }] = useSyncStoreOrdersMutation();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const connections = data?.connections || [];

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await syncOrders(id).unwrap();
      toast.success("Orders synced successfully");
    } catch {
      toast.error("Failed to sync orders");
    } finally {
      setSyncingId(null);
    }
  };

  const handleTest = async (id: string) => {
    try {
      await testConnection(id).unwrap();
      toast.success("Connection tested successfully");
    } catch {
      toast.error("Connection test failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConnection(id).unwrap();
      toast.success("Connection deleted");
    } catch {
      toast.error("Failed to delete connection");
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <AppBreadcrumb items={[{ label: "Stores", href: "/stores" }]} />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load store connections. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

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
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : connections.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No store connections yet. Click "Add Store" to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connections.map((conn) => (
                <Card key={conn._id}>
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
                          <DropdownMenuItem onClick={() => handleSync(conn._id)} disabled={syncingId === conn._id}>
                            {syncingId === conn._id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            {syncingId === conn._id ? "Syncing..." : "Sync Orders"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(conn._id)}
                          >
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
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connections.map((conn) => (
                      <TableRow key={conn._id}>
                        <TableCell className="font-medium">{conn.name}</TableCell>
                        <TableCell>{conn.platform}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {conn.storeUrl}
                        </TableCell>
                        <TableCell>{getStatusBadge(conn.status)}</TableCell>
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
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => deleteConnection(conn._id)}
                              >
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
