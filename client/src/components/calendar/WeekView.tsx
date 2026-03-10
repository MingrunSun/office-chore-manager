import {
  startOfWeek, endOfWeek, addDays, format, isToday,
} from 'date-fns';
import { CalendarInstance } from '../../types';
import ChoreChip from './ChoreChip';

interface Props {
  currentDate: Date;
  instances: CalendarInstance[];
  onToggle: (instance: CalendarInstance) => void;
  onCellClick?: (date: string, time: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function WeekView({ currentDate, instances, onToggle, onCellClick }: Props) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

  const days: Date[] = [];
  let cur = weekStart;
  while (cur <= weekEnd) {
    days.push(cur);
    cur = addDays(cur, 1);
  }

  // Partition by date
  const allDay = new Map<string, CalendarInstance[]>();
  const timed = new Map<string, CalendarInstance[]>();

  for (const inst of instances) {
    if (inst.dueTime) {
      const list = timed.get(inst.instanceDate) ?? [];
      list.push(inst);
      timed.set(inst.instanceDate, list);
    } else {
      const list = allDay.get(inst.instanceDate) ?? [];
      list.push(inst);
      allDay.set(inst.instanceDate, list);
    }
  }

  return (
    <div className="week-view">
      {/* Header row */}
      <div className="week-header">
        <div className="week-gutter" />
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          return (
            <div key={dateStr} className={`week-col-header ${isToday(day) ? 'today' : ''}`}>
              <div className="week-dow">{format(day, 'EEE')}</div>
              <div className="week-day-num">{format(day, 'd')}</div>
            </div>
          );
        })}
      </div>

      {/* All-day strip */}
      <div className="week-allday-row">
        <div className="week-gutter allday-label">All day</div>
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const items = allDay.get(dateStr) ?? [];
          return (
            <div key={dateStr} className="week-allday-cell">
              {items.map((inst) => (
                <ChoreChip
                  key={`${inst.choreId}:${inst.instanceDate}`}
                  instance={inst}
                  onToggle={onToggle}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="week-time-grid">
        {HOURS.map((hour) => (
          <div key={hour} className="week-time-row">
            <div className="week-gutter time-label">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const items = (timed.get(dateStr) ?? []).filter((inst) => {
                const h = parseInt(inst.dueTime!.split(':')[0]);
                return h === hour;
              });
              return (
                <div
                  key={dateStr}
                  className="week-time-cell"
                  onClick={() => onCellClick?.(dateStr, `${String(hour).padStart(2, '0')}:00`)}
                >
                  {items.map((inst) => (
                    <ChoreChip
                      key={`${inst.choreId}:${inst.instanceDate}`}
                      instance={inst}
                      onToggle={onToggle}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
