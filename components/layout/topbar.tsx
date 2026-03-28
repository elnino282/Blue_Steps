'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from './sidebar';

export function Topbar() {
  const { user, needsOnlineBootstrap } = useAuth();
  const { isOffline } = useNetworkStatus();
  const displayName = user?.displayName || 'Explorer';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="sticky top-0 z-10">
      {isOffline ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 lg:px-6">
          {needsOnlineBootstrap
            ? 'You are offline. Connect once so BlueStep can create your anonymous account and sync your data.'
            : 'You are offline. BlueStep is using cached data until the connection returns.'}
        </div>
      ) : null}

      <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden" />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div className="hidden md:flex items-center bg-secondary/50 rounded-full px-3 py-1.5">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>
          <div className="flex items-center gap-3 pl-4 border-l">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium">{displayName}</span>
              <span className="text-xs text-primary font-bold">Level {user?.level ?? 1}</span>
            </div>
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
    </div>
  );
}
