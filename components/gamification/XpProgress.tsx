'use client';

import { TrendingUp } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type XpProgressProps = {
  level: number;
  currentLevelXp: number;
  requiredXp: number;
  xpToNextLevel: number;
  progressPercent: number;
};

export function XpProgress({
  level,
  currentLevelXp,
  requiredXp,
  xpToNextLevel,
  progressPercent,
}: XpProgressProps) {
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          XP progress
        </CardTitle>
        <CardDescription>Level growth scales up gradually with each new level.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span>Level {level}</span>
          <span className="text-muted-foreground">
            {currentLevelXp} / {requiredXp} XP
          </span>
        </div>
        <Progress value={progressPercent} className="h-2.5" />
        <p className="text-sm text-muted-foreground">
          {xpToNextLevel} XP left to reach the next level.
        </p>
      </CardContent>
    </Card>
  );
}
