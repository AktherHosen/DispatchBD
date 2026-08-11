import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  SidebarProvider,
  useSidebar
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useLogoutMutation, useGetUserWorkspacesQuery } from "@/store/api";
import { logout as logoutAction, setWorkspace } from "@/store/authSlice";
import {
  LayoutDashboard,
  Store,
  Truck,
  Shield,
  Users,
  Key,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  User,
  ChevronRight,
  Home,
  Moon,
  Sun,
  Building2,
  Check
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const navigation = [
  {
    title: "Platform",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Stores", href: "/stores", icon: Store },
      { title: "Couriers", href: "/couriers", icon: Truck }
    ]
  },
  {
    title: "Management",
    items: [
      { title: "Fraud Check", href: "/fraud", icon: Shield },
      { title: "Moderators", href: "/moderators", icon: Users },
      { title: "API Keys", href: "/api-keys", icon: Key }
    ]
  },
  {
    title: "Account",
    items: [
      { title: "Plans", href: "/plans", icon: CreditCard },
      { title: "Settings", href: "/settings", icon: Settings }
    ]
  }
];

interface AppBreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
}

export function AppBreadcrumb({ items }: AppBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link to="/dashboard" />}>
            <Home className="h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight />
        </BreadcrumbSeparator>
        {items.map((item, index) => (
          <BreadcrumbItem key={index}>
            {item.href ? (
              <>
                <BreadcrumbLink render={<Link to={item.href} />}>
                  {item.label}
                </BreadcrumbLink>
                <BreadcrumbSeparator>
                  <ChevronRight />
                </BreadcrumbSeparator>
              </>
            ) : (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [logoutApi] = useLogoutMutation();
  const { theme, setTheme } = useTheme();
  const { data: workspacesData } = useGetUserWorkspacesQuery();
  const workspace = useAppSelector((state) => state.auth.workspace);

  const workspaces = workspacesData?.workspaces ?? [];
  const currentWorkspace = workspaces.find((w) => w.id === workspace?.id);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      // Ignore error, just clear local state
    }
    dispatch(logoutAction());
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Store className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">DispatchBD</span>
                <span className="truncate text-xs">Multi-tenant Platform</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {workspaces.length > 1 && (
        <>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                        <Building2 className="size-4" />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium">
                            {currentWorkspace?.name ?? "Select workspace"}
                          </span>
                          <span className="truncate text-xs">
                            {workspaces.length} workspaces
                          </span>
                        </div>
                        <ChevronDown className="ml-auto size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width]"
                        side="bottom"
                        align="start"
                      >
                        {workspaces.map((ws) => (
                          <DropdownMenuItem
                            key={ws.id}
                            onClick={() => {
                              dispatch(setWorkspace({ id: ws.id, name: ws.name, slug: ws.slug }));
                            }}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <p className="text-sm font-medium">{ws.name}</p>
                                <p className="text-xs text-muted-foreground">{ws.role}</p>
                              </div>
                              {ws.id === workspace?.id && <Check className="h-4 w-4" />}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarSeparator />
        </>
      )}

      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton 
                        isActive={isActive}
                        tooltip={item.title}
                        render={<Link to={item.href} />}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name ? getInitials(user.name) : "JD"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.name || "John Doe"}
                  </span>
                  <span className="truncate text-xs">
                    {user?.email || "john@example.com"}
                  </span>
                </div>
                <ChevronDown className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarHeaderComponent() {
  const { isMobile } = useSidebar();

  if (isMobile) {
    return null;
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <SidebarSeparator orientation="vertical" className="mr-2 h-4" />
      <div className="flex-1" />
      <Button variant="ghost" size="icon-sm">
        <Bell className="h-4 w-4" />
      </Button>
    </header>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SidebarHeaderComponent />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
