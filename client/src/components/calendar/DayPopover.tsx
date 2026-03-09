import { useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarInstance } from '../../types';
import ChoreChip from './ChoreChip';

interface Props {
  date: string;
  instances: CalendarInstance[];
  onToggle: (instance: CalendarInstance) => void;
  onClose: () => void;
}

export default function DayPopover({ date, instances, onToggle, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div className="day-popover" ref={ref}>
      <div className="popover-header">
        <span>{format(parseISO(date), 'EEEE, MMMM d')}</span>
        <button className="popover-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="popover-body">
        {instances.length === 0 ? (
          <p className="popover-empty">No chores</p>
        ) : (
          instances.map((inst) => (
            <ChoreChip
              key={`${inst.choreId}:${inst.instanceDate}`}
              instance={inst}
              onToggle={onToggle}
            />
          ))
        )}
      </div>
    </div>
  );
}
