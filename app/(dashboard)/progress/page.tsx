'use client';

import { Award, Trophy } from 'lucide-react';

import { BadgeGrid } from '@/components/gamification/BadgeGrid';
import { LevelCard } from '@/components/gamification/LevelCard';
import { StreakCard } from '@/components/gamification/StreakCard';
import { XpProgress } from '@/components/gamification/XpProgress';
import { Card, CardContent } from '@/components/ui/card';
import { useGamification } from '@/hooks/use-gamification';

export default function ProgressPage() {
  const { userSummary, xpProgress, badges, unlockedBadges, loading } = useGamification();

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress & Badges</h1>
        <p className="mt-1 text-muted-foreground">
          Track level growth, total XP, streak quality, and your unlocked milestones.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <LevelCard
          level={userSummary.level}
          totalXp={userSummary.totalXp}
          xpToNextLevel={xpProgress.xpToNextLevel}
        />
        <StreakCard
          currentStreak={userSummary.currentStreak}
          bestStreak={userSummary.bestStreak}
        />
        <Card className="rounded-3xl border-none bg-yellow-500/5 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-2xl bg-yellow-500/15 p-3 text-yellow-600">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unlocked badges</p>
              <h2 className="text-2xl font-bold">{unlockedBadges.length}</h2>
              <p className="text-xs text-muted-foreground">
                {badges.length - unlockedBadges.length} badge{badges.length - unlockedBadges.length === 1 ? '' : 's'} still waiting.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)]">
        <XpProgress
          level={userSummary.level}
          currentLevelXp={xpProgress.currentLevelXp}
          requiredXp={xpProgress.requiredXp}
          xpToNextLevel={xpProgress.xpToNextLevel}
          progressPercent={xpProgress.progressPercent}
        />

        <Card className="rounded-3xl shadow-sm">
          <CardContent className="flex h-full items-center gap-4 p-6">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Engine status</p>
              <h2 className="text-xl font-bold">Gamification is live</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Each attendance check-in now updates XP, level, streak, daily summaries, and badge evaluation
                from the same pipeline so the app stays consistent.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <BadgeGrid
        badges={badges}
        title="Badge collection"
        description="Unlocked and locked badges are shown together so the next target stays obvious."
      />
    </div>
  );
}
