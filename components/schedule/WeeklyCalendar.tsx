'use client';

import { useMemo } from 'react';
import { Subject } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface WeeklyCalendarProps {
  subjects: Subject[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 to 21:00

export function WeeklyCalendar({ subjects }: WeeklyCalendarProps) {
  const schedule = useMemo(() => {
    const grid: { [key: number]: Subject[] } = {};
    for (let i = 0; i < 7; i++) {
      grid[i] = subjects.filter(s => s.weekday === i).sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return grid;
  }, [subjects]);

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const getEventStyle = (subject: Subject) => {
    const startMins = timeToMinutes(subject.startTime);
    const endMins = timeToMinutes(subject.endTime);
    const duration = endMins - startMins;
    const startOffset = startMins - (7 * 60); // Offset from 7:00 AM

    return {
      top: `${(startOffset / 60) * 4}rem`, // 4rem per hour
      height: `${(duration / 60) * 4}rem`,
      backgroundColor: subject.color,
      opacity: 0.9,
    };
  };

  return (
    <Card className="rounded-3xl shadow-sm overflow-hidden border">
      <ScrollArea className="w-full whitespace-nowrap rounded-3xl">
        <div className="min-w-[800px] p-4">
          <div className="grid grid-cols-8 gap-4">
            {/* Time Column */}
            <div className="col-span-1 pt-12">
              {HOURS.map(hour => (
                <div key={hour} className="h-16 text-right pr-4 text-xs text-muted-foreground font-medium relative">
                  <span className="absolute -top-2 right-4">{hour}:00</span>
                </div>
              ))}
            </div>

            {/* Days Columns */}
            {WEEKDAYS.map((day, dayIndex) => (
              <div key={dayIndex} className="col-span-1 relative">
                <div className="h-12 flex items-center justify-center font-bold text-sm border-b mb-2">
                  {day}
                </div>
                
                <div className="relative h-[60rem]"> {/* 15 hours * 4rem */}
                  {/* Grid lines */}
                  {HOURS.map(hour => (
                    <div key={hour} className="h-16 border-t border-dashed border-border/50 w-full absolute" style={{ top: `${(hour - 7) * 4}rem` }} />
                  ))}

                  {/* Events */}
                  {schedule[dayIndex]?.map(subject => (
                    <div
                      key={subject.id}
                      className="absolute w-full rounded-xl p-2 text-white shadow-sm overflow-hidden transition-all hover:opacity-100 hover:z-10 hover:scale-[1.02] cursor-pointer"
                      style={getEventStyle(subject)}
                    >
                      <div className="text-xs font-bold truncate leading-tight">{subject.name}</div>
                      <div className="text-[10px] opacity-90 truncate mt-1">
                        {subject.startTime} - {subject.endTime}
                      </div>
                      {subject.room && (
                        <div className="text-[10px] opacity-80 truncate mt-0.5">{subject.room}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
}
