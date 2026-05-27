import { useState } from 'react';
import type { TimeOfDay } from '../../types';

interface Props {
  modifying: boolean;
  onSubmit: (text: string, date: string, timeOfDay: TimeOfDay) => void;
  onToggleModify: () => void;
}

const today = new Date().toISOString().split('T')[0];

export function ReminderForm({ modifying, onSubmit, onToggleModify }: Props) {
  const [text, setText] = useState('');
  const [date, setDate] = useState(today);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('Morning');

  function handleAdd() {
    if (!text.trim() || !date) return;
    onSubmit(text.trim(), date, timeOfDay);
    setText('');
    setDate(today);
    setTimeOfDay('Morning');
  }

  const baseCls = 'border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100';

  return (
    /* Mobile: 2-column grid. sm+: single row, no wrapping */
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-nowrap sm:items-center">
      <input
        className={`col-span-2 w-full sm:flex-1 sm:min-w-0 ${baseCls}`}
        placeholder="Add a reminder..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <input
        type="date"
        className={`w-full sm:w-auto sm:shrink-0 ${baseCls}`}
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <select
        className={`w-full sm:w-auto sm:shrink-0 ${baseCls}`}
        value={timeOfDay}
        onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
      >
        <option>Morning</option>
        <option>Afternoon</option>
        <option>Evening</option>
      </select>
      <button
        onClick={handleAdd}
        className="shrink-0 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors font-medium"
      >
        Add
      </button>
      <button
        onClick={onToggleModify}
        className={`shrink-0 px-4 py-2 text-sm rounded font-medium transition-colors ${
          modifying
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        {modifying ? 'Done' : 'Modify'}
      </button>
    </div>
  );
}
