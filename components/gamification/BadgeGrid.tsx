'use client';

import { format } from 'date-fns';
import {
  CalendarCheck2,
  Flame,
  Lock,
  Medal,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { BadgeStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type BadgeGridProps = {
  badges: BadgeStatus[];
  title?: string;
  description?: string;
  compact?: boolean;
};

const ICON_MAP = {
  sparkles: Sparkles,
  flame: Flame,
  medal: Medal,
  'shield-check': ShieldCheck,
  'calendar-check': CalendarCheck2,
  'rotate-ccw': RefreshCcw,
} as const;

export function BadgeGrid({
  badges,
  title = 'Badges',
  description = 'Unlocked badges stay highlighted. Locked badges show what comes next.',
  compact = false,
}: BadgeGridProps) {
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={cn('grid gap-4 pt-4', compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3')}>
        {badges.map((badge) => {
          const Icon = ICON_MAP[badge.icon as keyof typeof ICON_MAP] ?? Sparkles;

          return (
            <div
              key={badge.id}
              className={cn(
                'rounded-[1.5rem] border p-4 transition-colors',
                badge.unlocked
                  ? 'border-primary/20 bg-primary/5'
                  : 'border-dashed bg-muted/30 text-muted-foreground'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-2xl',
                    badge.unlocked ? 'bg-primary/15 text-primary' : 'bg-background text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <Badge variant={badge.unlocked ? 'default' : 'outline'}>
                  {badge.unlocked ? 'Unlocked' : 'Locked'}
                </Badge>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className={cn('font-semibold', badge.unlocked ? 'text-foreground' : 'text-muted-foreground')}>
                    {badge.name}
                  </h3>
                  {!badge.unlocked ? <Lock className="h-3.5 w-3.5" /> : null}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{badge.description}</p>
                <p className="text-xs text-muted-foreground">
                  {badge.unlocked && badge.unlockedAt
                    ? `Unlocked on ${format(new Date(badge.unlockedAt), 'MMM d, yyyy')}`
                    : 'Keep attending to unlock this badge.'}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
