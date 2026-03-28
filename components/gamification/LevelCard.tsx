'use client';

import { Zap } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

type LevelCardProps = {
  level: number;
  totalXp: number;
  xpToNextLevel: number;
};

export function LevelCard({ level, totalXp, xpToNextLevel }: LevelCardProps) {
  return (
    <Card className="rounded-3xl border-none bg-primary/5 shadow-sm">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-2xl bg-primary/15 p-3 text-primary">
          <Zap className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Current level</p>
          <h3 className="text-2xl font-bold">Level {level}</h3>
          <p className="text-xs text-muted-foreground">
            {totalXp} XP total, {xpToNextLevel} XP until the next level.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
