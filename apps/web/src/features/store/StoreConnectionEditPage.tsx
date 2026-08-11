import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppBreadcrumb } from "@/components/layout/AppLayout";
import { useGetStoreConnectionQuery, useUpdateStoreConnectionMutation, useTestStoreConnectionMutation } from "@/store/api";
import { ArrowLeft, Loader2, Store, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function StoreConnectionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetStoreConnectionQuery(id!);
  const [updateConnection, { isLoading: isUpdating }] = useUpdateStoreConnectionMutation();
  const [testConnection, { isLoading: isTesting }] = useTestStoreConnectionMutation();

  const [form, setForm] = useState({
    name: "",
    storeUrl: "",
    consumerKey: "",
    consumerSecret: ""
  });

  useEffect(() => {
    if (data?.connection) {
      setForm({
        name: data.connection.name,
        storeUrl: data.connection.storeUrl,
        consumerKey: data.connection.consumerKey || "",
        consumerSecret: ""
      });
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const payload: Record<string, string> = { name: form.name };
      if (form.consumerKey) payload.consumerKey = form.consumerKey;
      if (form.consumerSecret) payload.consumerSecret = form.consumerSecret;

      await updateConnection({ id, data: payload }).unwrap();
      toast.success("Store connection updated");
      navigate("/stores");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const handleTest = async () => {
    if (!id) return;
    try {
      await testConnection(id).unwrap();
      toast.success("Connection test successful");
    } catch {
      toast.error("Connection test failed");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <AppBreadcrumb items={[{ label: "Stores", href: "/stores" }, { label: "Edit" }]} />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load store connection.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const connection = data?.connection;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <AppBreadcrumb items={[{ label: "Stores", href: "/stores" }, { label: connection?.name || "Edit" }]} />
      <div>
        <Button variant="ghost" onClick={() => navigate("/stores")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stores
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Store</h1>
        <p className="text-muted-foreground">
          Update your WooCommerce store connection
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                <CardTitle>{connection?.name}</CardTitle>
              </div>
              {connection?.status && (
                <div className="flex items-center gap-1">
                  {connection.status === "active" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm capitalize">{connection.status}</span>
                </div>
              )}
            </div>
            <CardDescription>
              Update your WooCommerce REST API credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeUrl">Store URL</Label>
              <Input
                id="storeUrl"
                value={form.storeUrl}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Store URL cannot be changed. Create a new connection instead.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="consumerKey">Consumer Key</Label>
              <Input
                id="consumerKey"
                placeholder="Leave empty to keep current"
                value={form.consumerKey}
                onChange={(e) => setForm({ ...form, consumerKey: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consumerSecret">Consumer Secret</Label>
              <Input
                id="consumerSecret"
                type="password"
                placeholder="Leave empty to keep current"
                value={form.consumerSecret}
                onChange={(e) => setForm({ ...form, consumerSecret: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/stores")}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleTest} disabled={isTesting}>
                {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Connection
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
