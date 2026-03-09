import { useState } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, format, isSameMonth, isToday,
} from 'date-fns';
import { CalendarInstance } from '../../types';
import ChoreChip from './ChoreChip';
import DayPopover from './DayPopover';

interface Props {
  currentDate: Date;
  instances: CalendarInstance[];
  onToggle: (instance: CalendarInstance) => void;
}

export default function MonthView({ currentDate, instances, onToggle }: Props) {
  const [popoverDate, setPopoverDate] = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let cur = gridStart;
  while (cur <= gridEnd) {
    days.push(cur);
    cur = addDays(cur, 1);
  }

  const byDate = new Map<string, CalendarInstance[]>();
  for (const inst of instances) {
    const list = byDate.get(inst.instanceDate) ?? [];
    list.push(inst);
    byDate.set(inst.instanceDate, list);
  }

  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="month-view">
      <div className="month-header-row">
        {DOW.map((d) => <div key={d} className="month-dow">{d}</div>)}
      </div>
      <div className="month-grid">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayInstances = byDate.get(dateStr) ?? [];
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);

          return (
            <div
              key={dateStr}
              className={`month-cell ${inMonth ? '' : 'other-month'} ${today ? 'today' : ''}`}
              onClick={() => setPopoverDate(dateStr)}
            >
              <div className="cell-date-num">{format(day, 'd')}</div>
              <div className="cell-chips">
                {dayInstances.slice(0, 3).map((inst) => (
                  <ChoreChip
                    key={`${inst.choreId}:${inst.instanceDate}`}
                    instance={inst}
                    onToggle={onToggle}
                  />
                ))}
                {dayInstances.length > 3 && (
                  <div className="more-chip">+{dayInstances.length - 3} more</div>
                )}
              </div>
              {popoverDate === dateStr && (
                <DayPopover
                  date={dateStr}
                  instances={dayInstances}
                  onToggle={onToggle}
                  onClose={() => setPopoverDate(null)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
