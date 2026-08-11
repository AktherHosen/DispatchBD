import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useGetCourierConnectionQuery, useUpdateCourierConnectionMutation, useTestCourierConnectionMutation } from "@/store/api";
import { ArrowLeft, Loader2, Truck, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function CourierConnectionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetCourierConnectionQuery(id!);
  const [updateConnection, { isLoading: isUpdating }] = useUpdateCourierConnectionMutation();
  const [testConnection, { isLoading: isTesting }] = useTestCourierConnectionMutation();

  const [form, setForm] = useState({
    name: "",
    apiEndpoint: "",
    apiKey: "",
    apiSecret: ""
  });

  useEffect(() => {
    if (data?.connection) {
      setForm({
        name: data.connection.name,
        apiEndpoint: data.connection.apiEndpoint,
        apiKey: "",
        apiSecret: ""
      });
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const payload: Record<string, string> = { name: form.name };
      if (form.apiKey) payload.apiKey = form.apiKey;
      if (form.apiSecret) payload.apiSecret = form.apiSecret;

      await updateConnection({ id, data: payload }).unwrap();
      toast.success("Courier connection updated");
      navigate("/couriers");
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
        <AppBreadcrumb items={[{ label: "Couriers", href: "/couriers" }, { label: "Edit" }]} />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load courier connection.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const connection = data?.connection;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <AppBreadcrumb items={[{ label: "Couriers", href: "/couriers" }, { label: connection?.name || "Edit" }]} />
      <div>
        <Button variant="ghost" onClick={() => navigate("/couriers")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Couriers
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Courier</h1>
        <p className="text-muted-foreground">
          Update your courier connection settings
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
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
              Update your courier API credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Connection Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiEndpoint">API Endpoint</Label>
              <Input
                id="apiEndpoint"
                value={form.apiEndpoint}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                API endpoint cannot be changed. Create a new connection instead.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                placeholder="Leave empty to keep current"
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                placeholder="Leave empty to keep current"
                value={form.apiSecret}
                onChange={(e) => setForm({ ...form, apiSecret: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/couriers")}>
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
