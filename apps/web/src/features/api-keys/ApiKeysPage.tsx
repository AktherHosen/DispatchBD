import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Plus, Copy, Trash2, Eye, EyeOff } from "lucide-react";

const apiKeys = [
  {
    id: "1",
    name: "Production API Key",
    key: "pk_live_xxxxxxxxxxxx",
    lastUsed: "2024-01-15",
    createdAt: "2024-01-01"
  },
  {
    id: "2",
    name: "Test API Key",
    key: "pk_test_xxxxxxxxxxxx",
    lastUsed: "2024-01-10",
    createdAt: "2024-01-05"
  }
];

export default function ApiKeysPage() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys for public API access
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate Key
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Use these keys to access the public fraud check API
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {showKeys[apiKey.id]
                          ? apiKey.key
                          : apiKey.key.slice(0, 8) + "••••••••"}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleKey(apiKey.id)}
                      >
                        {showKeys[apiKey.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{apiKey.lastUsed}</TableCell>
                  <TableCell>{apiKey.createdAt}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
          <CardDescription>Your API usage this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Successful</p>
              <p className="text-2xl font-bold text-green-600">1,200</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-600">34</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
