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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppBreadcrumb } from "@/components/layout/AppLayout";
import { User, Building2, Lock, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: "Settings" }]} />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and workspace settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="workspace">
            <Building2 className="h-4 w-4 mr-2" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-lg">JD</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, GIF or PNG. Max size 2MB.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john@example.com" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace</CardTitle>
              <CardDescription>Manage your workspace settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspaceName">Workspace Name</Label>
                <Input id="workspaceName" defaultValue="John's Workspace" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspaceSlug">Workspace Slug</Label>
                <Input id="workspaceSlug" defaultValue="johns-workspace" disabled />
                <p className="text-xs text-muted-foreground">
                  This is used in your API endpoints
                </p>
              </div>
              <Button>Update Workspace</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>

          <Separator />

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Danger Zone</AlertTitle>
            <AlertDescription>
              This action is irreversible. Once you delete your workspace, all data will be permanently removed.
            </AlertDescription>
          </Alert>

          <Button variant="destructive">Delete Workspace</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
