'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import {
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  MapPin,
  Sparkles,
  UserRound,
} from 'lucide-react';

import { BadgeGrid } from '@/components/gamification/BadgeGrid';
import { LevelCard } from '@/components/gamification/LevelCard';
import { StreakCard } from '@/components/gamification/StreakCard';
import { XpProgress } from '@/components/gamification/XpProgress';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const STATUS_META = {
  scheduled: {
    label: 'Scheduled',
    className: 'bg-secondary text-secondary-foreground',
  },
  attended: {
    label: 'Attended',
    className: 'border-emerald-200 bg-emerald-500/10 text-emerald-700',
  },
  missed: {
    label: 'Missed',
    className: 'border-destructive/20 bg-destructive/10 text-destructive',
  },
} as const;

export default function DashboardPage() {
  const {
    greeting,
    userSummary,
    xpProgress,
    todayProgress,
    todaySessions,
    emptyState,
    featuredBadges,
    loading,
    error,
    needsOnlineBootstrap,
    markAsAttended,
  } = useDashboardData();

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border bg-gradient-to-br from-primary/[0.12] via-background to-background px-6 py-7 shadow-sm">
        <div className="absolute inset-y-0 right-0 hidden w-72 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.16),transparent_62%)] lg:block" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/70 px-3 py-1 text-xs font-medium text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Today dashboard
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{greeting.title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                {greeting.description}
              </p>
            </div>
          </div>

          <Card className="w-full max-w-sm rounded-[1.75rem] border-white/60 bg-white/80 shadow-lg backdrop-blur">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today progress</p>
                  <p className="mt-1 text-3xl font-bold">
                    {todayProgress.attended}/{todayProgress.total || 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <CalendarCheck2 className="h-6 w-6" />
                </div>
              </div>
              <Progress value={todayProgress.percent} className="h-2.5" />
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{todayProgress.scheduled} waiting</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span>{todayProgress.missed} missed</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span>{todayProgress.percent}% completed</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span>{userSummary.totalXp} XP total</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {error ? (
        <Card className="rounded-3xl border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      {needsOnlineBootstrap ? (
        <Card className="rounded-3xl border-dashed bg-secondary/20 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Connect once to start BlueStep</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              You need to be online at least once so BlueStep can create your anonymous account and sync your data.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {!needsOnlineBootstrap ? (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LevelCard
          level={userSummary.level}
          totalXp={userSummary.totalXp}
          xpToNextLevel={xpProgress.xpToNextLevel}
        />
        <StreakCard
          currentStreak={userSummary.currentStreak}
          bestStreak={userSummary.bestStreak}
        />
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Today&apos;s attendance</CardTitle>
            <CardDescription>
              {todaySessions.length > 0
                ? 'Review today classes and check in manually when you attend.'
                : 'BlueStep will show your generated attendance sessions here.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {todaySessions.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed bg-gradient-to-br from-primary/5 via-background to-secondary/40 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{emptyState.title}</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  {emptyState.description}
                </p>
                <Link
                  href={emptyState.actionHref}
                  className={cn(buttonVariants({ className: 'mt-5 rounded-full' }))}
                >
                  {emptyState.actionLabel}
                </Link>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {todaySessions.map((session) => {
                  const statusMeta = STATUS_META[session.status];
                  const sessionDate = new Date(session.date);

                  return (
                    <div
                      key={session.id}
                      className="rounded-[1.6rem] border bg-card p-4 shadow-sm transition-colors hover:bg-secondary/20"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                          <div
                            className="mt-0.5 h-12 w-1 rounded-full"
                            style={{ backgroundColor: session.color }}
                          />
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold">{session.subjectName}</h3>
                              <Badge
                                variant="outline"
                                className={cn('border-transparent', statusMeta.className)}
                              >
                                {statusMeta.label}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 className="h-4 w-4" />
                                {session.startTime} - {session.endTime}
                              </span>
                              {session.room ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4" />
                                  {session.room}
                                </span>
                              ) : null}
                              {session.teacher ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <UserRound className="h-4 w-4" />
                                  {session.teacher}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(sessionDate, 'EEEE, MMMM d')}
                              {session.checkedInAt
                                ? ` - Checked in at ${format(new Date(session.checkedInAt), 'HH:mm')}`
                                : ' - Waiting for manual confirmation'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end">
                          {session.status === 'scheduled' ? (
                            <Button
                              onClick={() => markAsAttended(session.id)}
                              className="rounded-full gap-2 shadow-sm"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {'\u0110\u00e3 \u0111i h\u1ecdc'}
                            </Button>
                          ) : (
                            <div className="text-right text-xs text-muted-foreground">
                              <p className="font-medium text-foreground">{statusMeta.label}</p>
                              <p>
                                {session.status === 'attended'
                                  ? 'Check-in saved'
                                  : 'Session closed for today'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <XpProgress
            level={userSummary.level}
            currentLevelXp={xpProgress.currentLevelXp}
            requiredXp={xpProgress.requiredXp}
            xpToNextLevel={xpProgress.xpToNextLevel}
            progressPercent={xpProgress.progressPercent}
          />

          <BadgeGrid
            badges={featuredBadges}
            compact
            title="Badge preview"
            description="Recent milestones stay visible here. The full collection is on the Progress page."
          />
        </div>
      </section>
        </>
      ) : null}
    </div>
  );
}
