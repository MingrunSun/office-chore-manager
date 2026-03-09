import { useState, useEffect, useCallback } from 'react';
import {
  format, addMonths, subMonths, addWeeks, subWeeks,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
} from 'date-fns';
import { CalendarInstance, ViewMode } from '../../types';
import { getCalendar, markComplete, unmarkComplete } from '../../api';
import MonthView from './MonthView';
import WeekView from './WeekView';

const POLL_INTERVAL = 30_000;

export default function CalendarContainer() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('month');
  const [instances, setInstances] = useState<CalendarInstance[]>([]);
  const [loading, setLoading] = useState(true);

  const getRange = useCallback(() => {
    if (view === 'month') {
      const ms = startOfMonth(currentDate);
      const me = endOfMonth(currentDate);
      return {
        start: format(startOfWeek(ms, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
        end: format(endOfWeek(me, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
      };
    } else {
      return {
        start: format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
        end: format(endOfWeek(currentDate, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
      };
    }
  }, [currentDate, view]);

  const fetchInstances = useCallback(async () => {
    const { start, end } = getRange();
    try {
      const data = await getCalendar(start, end);
      setInstances(data);
    } catch (err) {
      console.error('Calendar fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [getRange]);

  useEffect(() => {
    setLoading(true);
    fetchInstances();
    const timer = setInterval(fetchInstances, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchInstances]);

  const handleToggle = async (instance: CalendarInstance) => {
    try {
      if (instance.isComplete && instance.completionId != null) {
        await unmarkComplete(instance.completionId);
      } else {
        await markComplete(instance.choreId, instance.instanceDate);
      }
      await fetchInstances();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const prevPeriod = () => {
    setCurrentDate((d) => (view === 'month' ? subMonths(d, 1) : subWeeks(d, 1)));
  };

  const nextPeriod = () => {
    setCurrentDate((d) => (view === 'month' ? addMonths(d, 1) : addWeeks(d, 1)));
  };

  const label =
    view === 'month'
      ? format(currentDate, 'MMMM yyyy')
      : `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`;

  return (
    <div className="calendar-container">
      <div className="calendar-toolbar">
        <div className="toolbar-nav">
          <button onClick={prevPeriod} className="nav-btn" aria-label="Previous">&#8249;</button>
          <span className="toolbar-label">{label}</span>
          <button onClick={nextPeriod} className="nav-btn" aria-label="Next">&#8250;</button>
        </div>
        <div className="view-toggle">
          <button
            className={`view-btn ${view === 'month' ? 'active' : ''}`}
            onClick={() => setView('month')}
          >
            Month
          </button>
          <button
            className={`view-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => setView('week')}
          >
            Week
          </button>
        </div>
        <button
          className="today-btn"
          onClick={() => setCurrentDate(new Date())}
        >
          Today
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : view === 'month' ? (
        <MonthView currentDate={currentDate} instances={instances} onToggle={handleToggle} />
      ) : (
        <WeekView currentDate={currentDate} instances={instances} onToggle={handleToggle} />
      )}
    </div>
  );
}
