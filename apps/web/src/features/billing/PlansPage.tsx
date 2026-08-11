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
import { Check, CreditCard, Download } from "lucide-react";

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

export default function PlansPage() {
  return (
    <div className="space-y-6">
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
      </Tabs>
    </div>
  );
}
