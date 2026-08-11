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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppBreadcrumb } from "@/components/layout/AppLayout";
import { useGetPlansQuery, useGetSubscriptionQuery, useUpgradePlanMutation } from "@/store/api";
import { Check, CreditCard, Download, AlertCircle, Loader2 } from "lucide-react";

export default function PlansPage() {
  const { data: plansData, isLoading: isLoadingPlans } = useGetPlansQuery();
  const { data: subData, isLoading: isLoadingSub } = useGetSubscriptionQuery();
  const [upgradePlan, { isLoading: isUpgrading }] = useUpgradePlanMutation();

  const plans = plansData?.plans || [];
  const currentPlan = subData?.subscription?.planId || subData?.plan;
  const currentPlanId = subData?.subscription?.planId?._id;

  const invoices: Array<{ id: string; date: string; amount: string; status: string }> = [];

  const handleUpgrade = async (planId: string) => {
    try {
      await upgradePlan({ planId }).unwrap();
    } catch (err) {
      console.error("Failed to upgrade:", err);
    }
  };

  if (isLoadingPlans || isLoadingSub) {
    return (
      <div className="space-y-6">
        <AppBreadcrumb items={[{ label: "Plans" }]} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plans & Billing</h1>
          <p className="text-muted-foreground">Choose the plan that fits your business</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          {plans.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No plans available yet.</AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => {
                const isCurrent = currentPlanId === plan._id;
                return (
                  <Card key={plan._id} className={isCurrent ? "border-primary" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{plan.name}</CardTitle>
                        {isCurrent && <Badge>Current</Badge>}
                      </div>
                      <div>
                        <span className="text-3xl font-bold">৳{plan.price.toLocaleString()}</span>
                        <span className="text-muted-foreground">
                          {plan.price === 0 ? " forever" : "/month"}
                        </span>
                      </div>
                      <CardDescription className="capitalize">{plan.tier} plan</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          {plan.limits.stores === -1 ? "Unlimited" : plan.limits.stores} store connections
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          {plan.limits.ordersPerMonth === -1 ? "Unlimited" : plan.limits.ordersPerMonth.toLocaleString()} orders/month
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          {plan.limits.fraudChecksPerMonth === -1 ? "Unlimited" : plan.limits.fraudChecksPerMonth.toLocaleString()} fraud checks/month
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          {plan.limits.moderators === -1 ? "Unlimited" : plan.limits.moderators} moderators
                        </li>
                        {plan.limits.apiAccess && (
                          <li className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            API access
                          </li>
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={isCurrent ? "outline" : "default"}
                        disabled={isCurrent || isUpgrading}
                        onClick={() => handleUpgrade(plan._id)}
                      >
                        {isCurrent ? "Current Plan" : isUpgrading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Upgrading...</>
                        ) : (
                          "Upgrade"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoice History</CardTitle>
                  <CardDescription>Download your past invoices</CardDescription>
                </div>
                <Button variant="outline" size="sm" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No invoices yet</p>
              ) : (
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
