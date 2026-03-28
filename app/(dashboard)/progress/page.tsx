import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress & Badges</h1>
        <p className="text-muted-foreground mt-1">Track your level, XP, and unlocked achievements.</p>
      </div>
      <Card className="rounded-3xl shadow-sm min-h-[400px] flex items-center justify-center border-dashed">
        <CardContent className="text-center text-muted-foreground">
          <p>Progress view placeholder</p>
          <p className="text-sm mt-2">Gamification stats and badges coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
