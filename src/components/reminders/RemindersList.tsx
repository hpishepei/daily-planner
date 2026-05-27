import { useState } from 'react';
import type { Reminder, TimeOfDay } from '../../types';
import { ReminderForm } from './ReminderForm';
import { ReminderItem } from './ReminderItem';

interface Props {
  reminders: Reminder[];
  onAdd: (text: string, date: string, timeOfDay: TimeOfDay) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, fields: Partial<Omit<Reminder, 'id' | 'createdAt'>>) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const PAGE_SIZES = [10, 20, 50];

export function RemindersList({ reminders, onAdd, onDelete, onUpdate, onReorder }: Props) {
  const [modifying, setModifying] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(reminders.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * pageSize;
  const end = Math.min(start + pageSize, reminders.length);
  const visible = reminders.slice(start, end);

  function handleDragStart(index: number) { setDragIndex(start + index); }
  function handleDragOver(e: React.DragEvent, index: number) { e.preventDefault(); setDragOverIndex(start + index); }
  function handleDrop(index: number) {
    if (dragIndex !== null) onReorder(dragIndex, start + index);
    setDragIndex(null);
    setDragOverIndex(null);
  }
  function handleDragEnd() { setDragIndex(null); setDragOverIndex(null); }
  function handlePageSize(size: number) { setPageSize(size); setPage(0); }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Reminders</h2>

      {modifying && (
        <div className="mb-3 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded text-sm text-yellow-800 dark:text-yellow-300 italic">
          Edit mode — click any item to edit, drag to reorder, × to delete
        </div>
      )}

      <ReminderForm
        modifying={modifying}
        onSubmit={onAdd}
        onToggleModify={() => setModifying((v) => !v)}
      />

      <div className="mt-4">
        {reminders.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm py-4">No reminders yet.</p>
        ) : (
          <>
            <div className="space-y-1.5">
            {visible.map((r, i) => (
              <ReminderItem
                key={r.id}
                reminder={r}
                index={i}
                modifying={modifying}
                dragOverIndex={dragOverIndex !== null ? dragOverIndex - start : null}
                onDelete={() => onDelete(r.id)}
                onUpdate={(fields) => onUpdate(r.id, fields)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
              />
            ))}
            </div>

            {/* Pagination — stacks vertically on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="shrink-0">Rows per page:</span>
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handlePageSize(size)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      pageSize === size ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{reminders.length === 0 ? '0' : `${start + 1}–${end}`} of {reminders.length}</span>
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 text-lg"
                >‹</button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage >= totalPages - 1}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 text-lg"
                >›</button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
