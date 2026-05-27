import { useEffect, useState } from 'react';
import type { Reminder, TimeOfDay } from '../types';
import { storageGet, storageSet } from '../utils/storage';

const KEY = 'app:reminders';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(() =>
    storageGet<Reminder[]>(KEY, []),
  );

  useEffect(() => {
    storageSet(KEY, reminders);
  }, [reminders]);

  function addReminder(text: string, date: string, timeOfDay: TimeOfDay): void {
    if (!text.trim() || !date) return;
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      text: text.trim(),
      date,
      timeOfDay,
      createdAt: Date.now(),
    };
    setReminders((prev) => [reminder, ...prev]);
  }

  function deleteReminder(id: string): void {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }

  function updateReminder(id: string, fields: Partial<Omit<Reminder, 'id' | 'createdAt'>>): void {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...fields } : r)),
    );
  }

  function reorderReminders(fromIndex: number, toIndex: number): void {
    setReminders((prev) => {
      if (fromIndex === toIndex) return prev;
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  }

  function replaceReminders(incoming: Reminder[]): void {
    setReminders(incoming);
  }

  return { reminders, addReminder, deleteReminder, updateReminder, reorderReminders, replaceReminders };
}
