import { useEffect, useState } from 'react';
import type { Note } from '../types';
import { storageGet, storageSet } from '../utils/storage';

const KEY = 'app:notes';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => storageGet<Note[]>(KEY, []));

  useEffect(() => {
    storageSet(KEY, notes);
  }, [notes]);

  function addNote(text: string): void {
    if (!text.trim()) return;
    const note: Note = {
      id: crypto.randomUUID(),
      text: text.trim(),
      createdAt: Date.now(),
    };
    setNotes((prev) => [...prev, note]);
  }

  function deleteNote(id: string): void {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function updateNote(id: string, text: string): void {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, text: text.trim() || n.text } : n)),
    );
  }

  function reorderNotes(fromIndex: number, toIndex: number): void {
    setNotes((prev) => {
      if (fromIndex === toIndex) return prev;
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  }

  function replaceNotes(incoming: Note[]): void {
    setNotes(incoming);
  }

  return { notes, addNote, deleteNote, updateNote, reorderNotes, replaceNotes };
}
