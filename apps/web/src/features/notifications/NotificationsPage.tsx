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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppBreadcrumb } from "@/components/layout/AppLayout";
import {
  useGetNotificationSettingsQuery,
  useUpdateBotTokenMutation,
  useGetLinkingCodeMutation,
  useToggleTelegramMutation,
  useUpdateNotifyStatusesMutation,
  useUnlinkTelegramMutation,
  useGetNotificationLogsQuery
} from "@/store/api";
import {
  MessageSquare,
  Link,
  Unlink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Bell,
  BellOff,
  Clock
} from "lucide-react";
import { toast } from "sonner";

const AVAILABLE_STATUSES = [
  { value: "picked", label: "Picked Up" },
  { value: "in_transit", label: "In Transit" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
  { value: "cancelled", label: "Cancelled" },
  { value: "failed", label: "Delivery Failed" }
];

function getStatusBadge(status: string) {
  switch (status) {
    case "sent":
      return <Badge className="bg-green-500 hover:bg-green-600">Sent</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default function NotificationsPage() {
  const [botToken, setBotToken] = useState("");
  const [showToken, setShowToken] = useState(false);

  const { data: settingsData, isLoading: isLoadingSettings } =
    useGetNotificationSettingsQuery();
  const [updateToken, { isLoading: isUpdatingToken }] =
    useUpdateBotTokenMutation();
  const [getLinkingCode, { isLoading: isGettingCode, data: linkingData }] =
    useGetLinkingCodeMutation();
  const [toggleTelegram, { isLoading: isToggling }] =
    useToggleTelegramMutation();
  const [updateStatuses, { isLoading: isUpdatingStatuses }] =
    useUpdateNotifyStatusesMutation();
  const [unlink, { isLoading: isUnlinking }] =
    useUnlinkTelegramMutation();
  const { data: logsData, isLoading: isLoadingLogs } =
    useGetNotificationLogsQuery();

  const settings = settingsData?.settings?.telegram;
  const logs = logsData?.logs || [];

  const handleSaveToken = async () => {
    if (!botToken) return;
    try {
      await updateToken({ botToken }).unwrap();
      toast.success("Bot token saved");
      setBotToken("");
    } catch {
      toast.error("Failed to save bot token");
    }
  };

  const handleGetLinkingCode = async () => {
    try {
      const result = await getLinkingCode().unwrap();
      toast.success("Linking code generated");
      void result;
    } catch {
      toast.error("Failed to get linking code");
    }
  };

  const handleToggle = async (enabled: boolean) => {
    try {
      await toggleTelegram({ enabled }).unwrap();
      toast.success(`Telegram ${enabled ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to toggle");
    }
  };

  const handleStatusToggle = async (status: string, checked: boolean) => {
    if (!settings) return;
    const current = settings.notifyStatuses;
    const updated = checked
      ? [...current, status]
      : current.filter((s) => s !== status);
    if (updated.length === 0) {
      toast.error("At least one status must be selected");
      return;
    }
    try {
      await updateStatuses({ notifyStatuses: updated }).unwrap();
    } catch {
      toast.error("Failed to update statuses");
    }
  };

  const handleUnlink = async () => {
    try {
      await unlink().unwrap();
      toast.success("Telegram bot unlinked");
    } catch {
      toast.error("Failed to unlink");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: "Notifications" }]} />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Configure real-time alerts for courier status changes
        </p>
      </div>

      <Tabs defaultValue={0} className="space-y-4">
        <TabsList>
          <TabsTrigger value={0}>Telegram Setup</TabsTrigger>
          <TabsTrigger value={1}>Notification Log</TabsTrigger>
        </TabsList>

        {/* Telegram Setup Tab */}
        <TabsContent value={0} className="space-y-4">
          {isLoadingSettings ? (
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Connection Status */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <CardTitle>Telegram Bot</CardTitle>
                  </div>
                  <CardDescription>
                    Connect a Telegram bot to receive real-time order status alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {settings?.hasChatId ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {settings?.hasChatId
                            ? "Bot Connected"
                            : "Bot Not Connected"}
                        </p>
                        {settings?.linkedAt && (
                          <p className="text-xs text-muted-foreground">
                            Linked {new Date(settings.linkedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {settings?.hasChatId && (
                        <>
                          <Switch
                            checked={settings?.enabled || false}
                            onCheckedChange={handleToggle}
                            disabled={isToggling}
                          />
                          <span className="text-sm text-muted-foreground">
                            {settings?.enabled ? "Enabled" : "Disabled"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bot Token */}
                  <div className="space-y-2">
                    <Label>Bot Token</Label>
                    <div className="flex gap-2">
                      <Input
                        type={showToken ? "text" : "password"}
                        placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        onClick={() => setShowToken(!showToken)}
                      >
                        {showToken ? "Hide" : "Show"}
                      </Button>
                      <Button
                        onClick={handleSaveToken}
                        disabled={isUpdatingToken || !botToken}
                      >
                        {isUpdatingToken ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Get a bot token from @BotFather on Telegram
                    </p>
                  </div>

                  {/* Linking Code */}
                  {settings?.hasBotToken && !settings?.hasChatId && (
                    <div className="rounded-lg border p-4 space-y-3">
                      <p className="text-sm font-medium">Link Your Bot</p>
                      <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Open Telegram and search for your bot</li>
                        <li>Click the button below to get a linking code</li>
                        <li>Send the code to your bot in Telegram</li>
                      </ol>
                      {linkingData?.code ? (
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-3 py-2 rounded text-lg font-mono">
                            {linkingData.code}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyCode(linkingData.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={handleGetLinkingCode}
                          disabled={isGettingCode}
                        >
                          {isGettingCode ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Link className="h-4 w-4 mr-2" />
                          )}
                          Generate Linking Code
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Unlink */}
                  {settings?.hasChatId && (
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleUnlink}
                        disabled={isUnlinking}
                      >
                        <Unlink className="h-4 w-4 mr-2" />
                        Unlink Bot
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Toggles */}
              {settings?.hasChatId && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      <CardTitle>Notification Preferences</CardTitle>
                    </div>
                    <CardDescription>
                      Choose which status changes trigger a notification
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {AVAILABLE_STATUSES.map((s) => (
                        <div
                          key={s.value}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-2">
                            {settings.notifyStatuses.includes(s.value) ? (
                              <Bell className="h-4 w-4 text-blue-500" />
                            ) : (
                              <BellOff className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">{s.label}</span>
                          </div>
                          <Switch
                            checked={settings.notifyStatuses.includes(s.value)}
                            onCheckedChange={(checked: boolean) =>
                              handleStatusToggle(s.value, checked)
                            }
                            disabled={isUpdatingStatuses}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Notification Log Tab */}
        <TabsContent value={1} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Log</CardTitle>
              <CardDescription>
                Recent notification attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No notifications sent yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log._id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-medium">
                            #{log.courierOrderId?.consignmentId || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.channel}
                          </p>
                        </div>
                        {getStatusBadge(log.status)}
                        {log.error && (
                          <p className="text-xs text-red-500 max-w-[200px] truncate">
                            {log.error}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.sentAt).toLocaleString()}
                      </p>
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
