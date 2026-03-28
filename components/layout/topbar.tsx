import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';

export function Topbar() {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
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
            <span className="text-sm font-medium">Alex Student</span>
            <span className="text-xs text-primary font-bold">Level 12</span>
          </div>
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarImage src="https://picsum.photos/seed/alex/100/100" />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

