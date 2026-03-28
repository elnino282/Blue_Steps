import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground mt-1">Analyze your attendance and study habits over time.</p>
      </div>
      <Card className="rounded-3xl shadow-sm min-h-[400px] flex items-center justify-center border-dashed">
        <CardContent className="text-center text-muted-foreground">
          <p>Statistics view placeholder</p>
          <p className="text-sm mt-2">Charts and graphs coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
