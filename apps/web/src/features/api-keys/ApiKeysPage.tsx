import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppBreadcrumb } from "@/components/layout/AppLayout";
import { useGetApiKeysQuery, useCreateApiKeyMutation, useDeleteApiKeyMutation, useGetApiKeyStatsQuery } from "@/store/api";
import { Plus, Copy, Trash2, Eye, EyeOff, Key, Activity, AlertCircle, Check } from "lucide-react";

export default function ApiKeysPage() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);

  const { data: keysData, isLoading: isLoadingKeys } = useGetApiKeysQuery();
  const { data: stats, isLoading: isLoadingStats } = useGetApiKeyStatsQuery();
  const [createKey, { isLoading: isCreating }] = useCreateApiKeyMutation();
  const [deleteKey] = useDeleteApiKeyMutation();

  const apiKeys = keysData?.keys || [];

  const toggleKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreate = async () => {
    if (!newKeyName) return;
    try {
      const result = await createKey({ name: newKeyName }).unwrap();
      setNewKeySecret(result.secret);
      setNewKeyName("");
      setDialogOpen(false);
    } catch (err) {
      console.error("Failed to create API key:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteKey(id).unwrap();
    } catch (err) {
      console.error("Failed to delete API key:", err);
    }
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: "API Keys" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys for public API access
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Key
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for external integrations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., Production Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isCreating || !newKeyName}>
                {isCreating ? "Generating..." : "Generate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Show newly created key secret */}
      {newKeySecret && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">API Key Created Successfully</p>
              <p className="text-sm">Copy your secret key now. It won&apos;t be shown again.</p>
              <code className="block p-2 bg-muted rounded text-sm break-all">{newKeySecret}</code>
              <Button size="sm" onClick={() => { copyToClipboard(newKeySecret, "new"); setNewKeySecret(null); }}>
                {copiedKey === "new" ? "Copied!" : "Copy & Dismiss"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="usage">
            <Activity className="h-4 w-4 mr-2" />
            Usage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your API Keys</CardTitle>
              <CardDescription>
                Use these keys to access the public fraud check API
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingKeys ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No API keys yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      apiKeys.map((apiKey) => (
                        <TableRow key={apiKey._id}>
                          <TableCell className="font-medium">{apiKey.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {showKeys[apiKey._id]
                                  ? apiKey.key
                                  : apiKey.key.slice(0, 8) + "••••••••"}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleKey(apiKey._id)}
                              >
                                {showKeys[apiKey._id] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => copyToClipboard(apiKey.key, apiKey._id)}
                              >
                                {copiedKey === apiKey._id ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {apiKey.lastUsedAt 
                              ? new Date(apiKey.lastUsedAt).toLocaleDateString()
                              : "Never"}
                          </TableCell>
                          <TableCell>{new Date(apiKey.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(apiKey._id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {isLoadingStats ? (
              [1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalKeys || 0}</div>
                    <p className="text-xs text-muted-foreground">Active keys</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <Activity className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats?.totalRequests || 0}</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Failed</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">0</div>
                    <p className="text-xs text-muted-foreground">0% failure rate</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
