import { Card, CardContent } from '@/components/ui/card';

export default function MotivationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Motivation</h1>
        <p className="text-muted-foreground mt-1">Daily quotes, tips, and positive energy to keep you going.</p>
      </div>
      <Card className="rounded-3xl shadow-sm min-h-[400px] flex items-center justify-center border-dashed">
        <CardContent className="text-center text-muted-foreground">
          <p>Motivation view placeholder</p>
          <p className="text-sm mt-2">Healing messages and tips coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
