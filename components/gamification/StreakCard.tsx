'use client';

import { Flame } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

type StreakCardProps = {
  currentStreak: number;
  bestStreak: number;
};

export function StreakCard({ currentStreak, bestStreak }: StreakCardProps) {
  return (
    <Card className="rounded-3xl border-none bg-orange-500/5 shadow-sm">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-2xl bg-orange-500/15 p-3 text-orange-500">
          <Flame className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Attendance streak</p>
          <h3 className="text-2xl font-bold">
            {currentStreak} day{currentStreak === 1 ? '' : 's'}
          </h3>
          <p className="text-xs text-muted-foreground">
            Best streak: {bestStreak} day{bestStreak === 1 ? '' : 's'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
