import { Card, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account, notifications, and preferences.</p>
      </div>
      <Card className="rounded-3xl shadow-sm min-h-[400px] flex items-center justify-center border-dashed">
        <CardContent className="text-center text-muted-foreground">
          <p>Settings view placeholder</p>
          <p className="text-sm mt-2">Profile and app settings coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
