import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ArrowLeft } from "lucide-react";

export default function StoreConnectionCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    storeUrl: "",
    consumerKey: "",
    consumerSecret: ""
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
          Connect your WooCommerce store
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>WooCommerce Connection</CardTitle>
            <CardDescription>
              Enter your WooCommerce REST API credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name</Label>
              <Input
                id="name"
                placeholder="My Store"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
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
            </div>
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
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/stores")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Connecting..." : "Connect Store"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
