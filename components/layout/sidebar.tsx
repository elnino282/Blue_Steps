import Link from 'next/link';
import { 
  LayoutDashboard, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Heart, 
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Statistics', href: '/statistics', icon: BarChart3 },
  { name: 'Motivation', href: '/motivation', icon: Heart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col h-full bg-card border-r", className)}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold">
          B
        </div>
        <span className="font-bold text-xl text-primary tracking-tight">BlueStep</span>
      </div>
      
      <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <Button 
                variant="ghost" 
                className="w-full justify-start rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto border-t">
        <Button variant="ghost" className="w-full justify-start rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
