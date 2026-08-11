import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { AppBreadcrumb } from "@/components/layout/AppLayout";
import { Check, CreditCard, Download, Copy, Trash2, Eye, EyeOff, Key, Activity, AlertCircle, Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

const plans = [
  {
    name: "Free",
    price: "৳0",
    period: "forever",
    description: "For small businesses getting started",
    features: [
      "1 store connection",
      "100 orders/month",
      "50 fraud checks/month",
      "1 moderator",
      "Basic analytics"
    ],
    current: true
  },
  {
    name: "Pro",
    price: "৳1,999",
    period: "/month",
    description: "For growing businesses",
    features: [
      "5 store connections",
      "2,000 orders/month",
      "500 fraud checks/month",
      "5 moderators",
      "Advanced analytics",
      "API access",
      "Priority support"
    ],
    current: false
  },
  {
    name: "Enterprise",
    price: "৳4,999",
    period: "/month",
    description: "For large operations",
    features: [
      "Unlimited stores",
      "Unlimited orders",
      "Unlimited fraud checks",
      "Unlimited moderators",
      "Custom analytics",
      "Full API access",
      "Dedicated support",
      "Custom integrations"
    ],
    current: false
  }
];

const invoices = [
  { id: "INV-001", date: "2024-01-01", amount: "৳0", status: "paid" },
  { id: "INV-002", date: "2023-12-01", amount: "৳0", status: "paid" },
  { id: "INV-003", date: "2023-11-01", amount: "৳0", status: "paid" }
];

const apiKeys = [
  {
    id: "1",
    name: "Production API Key",
    key: "pk_live_xxxxxxxxxxxx",
    lastUsed: "2024-01-15",
    createdAt: "2024-01-01",
    requests: 1200
  },
  {
    id: "2",
    name: "Test API Key",
    key: "pk_test_xxxxxxxxxxxx",
    lastUsed: "2024-01-10",
    createdAt: "2024-01-05",
    requests: 34
  }
];

export default function PlansPage() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  const toggleKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: "Plans" }]} />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plans & Billing</h1>
        <p className="text-muted-foreground">
          Choose the plan that fits your business
        </p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.current ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.current && <Badge>Current</Badge>}
                  </div>
                  <div>
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.current ? "outline" : "default"}
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoice History</CardTitle>
                  <CardDescription>Download your past invoices</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{invoice.id}</p>
                        <p className="text-xs text-muted-foreground">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-medium">{invoice.amount}</p>
                      <Badge variant="outline">{invoice.status}</Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Manage your API keys for public API access
                  </CardDescription>
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
                      <Button onClick={() => setDialogOpen(false)}>Generate</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Requests</TableHead>
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
                      <TableCell>{apiKey.requests.toLocaleString()}</TableCell>
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

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">1,200</div>
                <p className="text-xs text-muted-foreground">97.2% success rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">34</div>
                <p className="text-xs text-muted-foreground">2.8% failure rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
