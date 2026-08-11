import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { AppBreadcrumb } from "@/components/layout/AppLayout";
import { ArrowLeft, Loader2, Store } from "lucide-react";

export default function StoreConnectionCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    storeUrl: "",
    consumerKey: "",
    consumerSecret: "",
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: API call
    console.log(form);
    setLoading(false);
    navigate("/stores");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <AppBreadcrumb items={[{ label: "Stores", href: "/stores" }, { label: "Add Store" }]} />
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate("/stores")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stores
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add Store</h1>
        <p className="text-muted-foreground">
          Connect your WooCommerce store to sync orders
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              <CardTitle>WooCommerce Connection</CardTitle>
            </div>
            <CardDescription>
              Enter your WooCommerce REST API credentials. You can find these in
              your WooCommerce settings under Advanced &gt; REST API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name</Label>
              <Input
                id="name"
                placeholder="My Store"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                A friendly name for this store connection
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeUrl">Store URL</Label>
              <Input
                id="storeUrl"
                placeholder="https://example.com"
                value={form.storeUrl}
                onChange={(e) => setForm({ ...form, storeUrl: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                The full URL of your WooCommerce store
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="consumerKey">Consumer Key</Label>
              <Input
                id="consumerKey"
                placeholder="ck_..."
                value={form.consumerKey}
                onChange={(e) =>
                  setForm({ ...form, consumerKey: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consumerSecret">Consumer Secret</Label>
              <Input
                id="consumerSecret"
                type="password"
                placeholder="cs_..."
                value={form.consumerSecret}
                onChange={(e) =>
                  setForm({ ...form, consumerSecret: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add any notes about this connection..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/stores")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Store"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
