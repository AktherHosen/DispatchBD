import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AppBreadcrumb } from "@/components/layout/AppLayout";
import { useGetSuperAdminStatsQuery, useGetAdminWorkspacesQuery, useSuspendWorkspaceMutation, useReactivateWorkspaceMutation } from "@/store/api";
import { Building2, Users, User, Ban, CheckCircle, MoreHorizontal, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const [page, setPage] = useState(1);
  const { data: statsData, isLoading: statsLoading } = useGetSuperAdminStatsQuery();
  const { data: wsData, isLoading: wsLoading } = useGetAdminWorkspacesQuery({ page, limit: 10 });
  const [suspendWorkspace] = useSuspendWorkspaceMutation();
  const [reactivateWorkspace] = useReactivateWorkspaceMutation();

  const stats = statsData?.stats;
  const workspaces = wsData?.workspaces || [];
  const pagination = wsData?.pagination;

  const handleSuspend = async (id: string) => {
    try {
      await suspendWorkspace(id).unwrap();
      toast.success("Workspace suspended");
    } catch {
      toast.error("Failed to suspend workspace");
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await reactivateWorkspace(id).unwrap();
      toast.success("Workspace reactivated");
    } catch {
      toast.error("Failed to reactivate workspace");
    }
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: "Super Admin" }]} />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin</h1>
        <p className="text-muted-foreground">
          Platform administration and management
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {statsLoading ? (
          [1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-20 mt-1" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workspaces</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalWorkspaces ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalMembers ?? 0}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue={0} className="space-y-4">
        <TabsList>
          <TabsTrigger value={0}>Workspaces</TabsTrigger>
          <TabsTrigger value={1}>Users</TabsTrigger>
          <TabsTrigger value={2}>Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value={0} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Workspaces</CardTitle>
              <CardDescription>
                Manage all workspaces on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {wsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workspaces.map((ws) => (
                        <TableRow key={ws._id}>
                          <TableCell className="font-medium">{ws.name}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{ws.ownerId?.name ?? "—"}</p>
                              <p className="text-xs text-muted-foreground">{ws.ownerId?.email ?? "—"}</p>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(ws.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge("active")}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleSuspend(ws._id)}
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Suspend
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReactivate(ws._id)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Reactivate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setPage(p => Math.max(1, p - 1))}
                              className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                            const start = Math.max(1, Math.min(page - 2, pagination.totalPages - 4));
                            return start + i;
                          }).filter(p => p <= pagination.totalPages).map((p) => (
                            <PaginationItem key={p}>
                              <PaginationLink
                                onClick={() => setPage(p)}
                                isActive={p === page}
                                className="cursor-pointer"
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                              className={page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={1} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                User management coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={2} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>Manage workspace subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Subscription management coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
