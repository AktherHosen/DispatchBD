import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
  Menu,
  Bell,
  ChevronDown,
  User
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Stores",
    href: "/stores",
    icon: Store
  },
  {
    title: "Couriers",
    href: "/couriers",
    icon: Truck
  },
  {
    title: "Fraud Check",
    href: "/fraud",
    icon: Shield
  },
  {
    title: "Moderators",
    href: "/moderators",
    icon: Users
  },
  {
    title: "API Keys",
    href: "/api-keys",
    icon: Key
  },
  {
    title: "Plans",
    href: "/plans",
    icon: CreditCard
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings
  }
];

interface SidebarContentProps {
  onLinkClick?: () => void;
}

function SidebarContent({ onLinkClick }: SidebarContentProps) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={onLinkClick}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">
              john@example.com
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <Button variant="ghost" size="icon">
        <Bell className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">john@example.com</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/dashboard" className="text-xl font-bold">
            DispatchBD
          </Link>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b">
            <SheetTitle className="text-left text-xl font-bold px-6 py-4">
              DispatchBD
            </SheetTitle>
          </SheetHeader>
          <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
