import { useEffect, useRef, useState } from 'react';
import type { Reminder } from '../../types';

interface Props {
  reminder: Reminder;
  index: number;
  modifying: boolean;
  dragOverIndex: number | null;
  onDelete: () => void;
  onUpdate: (fields: Partial<Omit<Reminder, 'id' | 'createdAt'>>) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  onDragEnd: () => void;
}

const badgeColors: Record<string, string> = {
  Morning: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
  Afternoon: 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300',
  Evening: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
};

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${m}/${d}/${y}`;
}

export function ReminderItem({
  reminder, index, modifying, dragOverIndex,
  onDelete, onUpdate, onDragStart, onDragOver, onDrop, onDragEnd,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reminder.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  // Keep draft in sync if reminder text changes externally
  useEffect(() => {
    if (!editing) setDraft(reminder.text);
  }, [reminder.text, editing]);

  function startEditing() {
    if (!modifying) return;
    setDraft(reminder.text);
    setEditing(true);
  }

  function save() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== reminder.text) onUpdate({ text: trimmed });
    setEditing(false);
  }

  function cancel() {
    setDraft(reminder.text);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); save(); }
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  }

  const isDragTarget = dragOverIndex === index;

  return (
    <div
      className={`flex items-start gap-2 py-3 px-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 transition-colors ${
        isDragTarget && modifying ? 'border-t-2 border-t-blue-400' : ''
      }`}
      draggable={modifying && !editing}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      onDragEnd={onDragEnd}
    >
      {modifying && (
        <span
          className="text-gray-300 cursor-grab active:cursor-grabbing text-lg select-none shrink-0 mt-0.5"
          title="Drag to reorder"
        >
          ⠿
        </span>
      )}

      <div className="flex flex-col xs:flex-row sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(reminder.date)}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap ${badgeColors[reminder.timeOfDay]}`}>
            {reminder.timeOfDay.toLowerCase()}
          </span>
        </div>

        {editing ? (
          <input
            ref={inputRef}
            className="flex-1 min-w-0 text-sm text-gray-800 dark:text-gray-100 bg-transparent border-b-2 border-blue-400 focus:outline-none py-0.5"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={save}
          />
        ) : (
          <span
            className={`text-sm text-gray-800 dark:text-gray-100 break-words min-w-0 ${
              modifying ? 'cursor-text hover:text-blue-600' : ''
            }`}
            onClick={startEditing}
          >
            {reminder.text}
          </span>
        )}
      </div>

      {modifying && (
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 transition-colors shrink-0 text-xl leading-none px-1 mt-0.5"
          title="Delete"
        >
          ×
        </button>
      )}
    </div>
  );
}
