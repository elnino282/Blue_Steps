import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Flame, Trophy, Zap, Heart } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Alex! 👋</h1>
          <p className="text-muted-foreground mt-1">You&apos;re on a 5-day streak. Keep it up!</p>
        </div>
        <Button size="lg" className="rounded-full shadow-md gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Check-in Today
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-3xl border-none shadow-sm bg-primary/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Level</p>
              <h3 className="text-2xl font-bold">Level 12</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-none shadow-sm bg-orange-500/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Study Streak</p>
              <h3 className="text-2xl font-bold">5 Days</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-none shadow-sm bg-yellow-500/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total XP</p>
              <h3 className="text-2xl font-bold">2,450 XP</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Card */}
          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>Level 12</span>
                  <span className="text-muted-foreground">2,450 / 3,000 XP</span>
                </div>
                <Progress value={81} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  550 XP to reach Level 13. Attend 2 more classes to level up!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="rounded-3xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today&apos;s Schedule</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { time: '09:00 AM', title: 'Advanced Mathematics', status: 'completed', xp: '+50 XP' },
                { time: '11:30 AM', title: 'Physics Lab', status: 'upcoming', xp: '+75 XP' },
                { time: '02:00 PM', title: 'Computer Science', status: 'upcoming', xp: '+50 XP' },
              ].map((cls, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border bg-card hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 text-center">
                      <span className="text-xs font-bold text-muted-foreground">{cls.time}</span>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div>
                      <p className="font-medium">{cls.title}</p>
                      <Badge variant={cls.status === 'completed' ? 'default' : 'secondary'} className="mt-1">
                        {cls.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-primary">{cls.xp}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          {/* Motivation Widget */}
          <Card className="rounded-3xl shadow-sm bg-primary text-primary-foreground border-none">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg">Daily Motivation</h3>
              <p className="text-primary-foreground/80 text-sm">
                &quot;The secret of getting ahead is getting started. You&apos;re doing great today!&quot;
              </p>
            </CardContent>
          </Card>

          {/* Recent Badges */}
          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-secondary/50">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-600 mb-2">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">Early Bird</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-secondary/50">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-600 mb-2">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">3-Day Streak</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
