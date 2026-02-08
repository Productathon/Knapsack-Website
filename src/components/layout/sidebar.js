"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Inbox, 
  FileText, 
  BarChart3, 
  Settings,
  HelpCircle,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/dashboard/leads", icon: Inbox },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

const secondaryNavigation = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help", href: "/dashboard/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center px-6 mb-2">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900 tracking-tight">
          <div className="h-6 w-6 rounded bg-blue-600 text-white flex items-center justify-center text-sm">P</div>
          Sales Portal
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-secondary text-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5 shrink-0 transition-colors", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {item.name}
            </Link>
          );
        })}
        
        <div className="pt-4 mt-4 border-t border-border">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">System</p>
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-secondary text-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5 shrink-0 transition-colors", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
      
      <Link href="/dashboard/profile" className="border-t border-border p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center border border-border">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">Rahul Sharma</p>
            <p className="truncate text-xs text-muted-foreground">Sales Manager</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
