import { CalendarInstance } from '../../types';

const PALETTE = [
  '#4f86c6', '#e07b54', '#5caa68', '#9b6bb5',
  '#d4a843', '#5bb8c4', '#c45c7a', '#7a9e4f',
];

interface Props {
  instance: CalendarInstance;
  onToggle: (instance: CalendarInstance) => void;
}

export default function ChoreChip({ instance, onToggle }: Props) {
  const color = instance.memberColor ?? PALETTE[instance.choreId % PALETTE.length];
  const bgColor = `${color}28`; // ~16% opacity tint

  return (
    <div
      className={`chore-chip ${instance.isComplete ? 'complete' : ''}`}
      style={{ borderLeftColor: color, backgroundColor: bgColor }}
      title={`${instance.title}${instance.memberName ? ` — ${instance.memberName}` : ''}`}
    >
      <input
        type="checkbox"
        checked={instance.isComplete}
        onChange={() => onToggle(instance)}
        onClick={(e) => e.stopPropagation()}
        className="chip-check"
        aria-label={`Mark ${instance.title} ${instance.isComplete ? 'incomplete' : 'complete'}`}
      />
      <span className="chip-title">{instance.title}</span>
      {instance.dueTime && <span className="chip-time">{instance.dueTime}</span>}
    </div>
  );
}
