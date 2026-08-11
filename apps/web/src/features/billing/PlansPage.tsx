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
import { Check } from "lucide-react";

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

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plans & Billing</h1>
        <p className="text-muted-foreground">
          Choose the plan that fits your business
        </p>
      </div>

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
    </div>
  );
}
