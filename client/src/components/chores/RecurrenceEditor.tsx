interface RecurData {
  recur_freq: string;
  recur_interval: number;
  recur_days: number[];
  recur_start: string;
  recur_end: string;
}

interface Props {
  value: RecurData;
  onChange: (v: RecurData) => void;
}

const WEEKDAYS = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 7 },
];

export default function RecurrenceEditor({ value, onChange }: Props) {
  const toggleDay = (day: number) => {
    const days = value.recur_days.includes(day)
      ? value.recur_days.filter((d) => d !== day)
      : [...value.recur_days, day].sort();
    onChange({ ...value, recur_days: days });
  };

  return (
    <div className="recurrence-editor">
      <div className="form-row">
        <label>Frequency</label>
        <select
          value={value.recur_freq}
          onChange={(e) => onChange({ ...value, recur_freq: e.target.value })}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="custom">Custom (specific days)</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="form-row">
        <label>Every</label>
        <input
          type="number"
          min={1}
          max={99}
          value={value.recur_interval}
          onChange={(e) => onChange({ ...value, recur_interval: Math.max(1, parseInt(e.target.value) || 1) })}
          style={{ width: 60 }}
        />
        <span style={{ marginLeft: 6 }}>
          {value.recur_freq === 'daily' ? 'day(s)' : value.recur_freq === 'monthly' ? 'month(s)' : 'week(s)'}
        </span>
      </div>

      {(value.recur_freq === 'weekly' || value.recur_freq === 'custom') && (
        <div className="form-row">
          <label>On days</label>
          <div className="weekday-picker">
            {WEEKDAYS.map((wd) => (
              <button
                key={wd.value}
                type="button"
                className={`wd-btn ${value.recur_days.includes(wd.value) ? 'selected' : ''}`}
                onClick={() => toggleDay(wd.value)}
              >
                {wd.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="form-row">
        <label>Start date</label>
        <input
          type="date"
          value={value.recur_start}
          onChange={(e) => onChange({ ...value, recur_start: e.target.value })}
        />
      </div>

      <div className="form-row">
        <label>End date</label>
        <input
          type="date"
          value={value.recur_end}
          onChange={(e) => onChange({ ...value, recur_end: e.target.value })}
        />
        <span className="hint">(optional)</span>
      </div>
    </div>
  );
}
