import { useEffect, useState } from 'react';
import type { NoteGroup, Note } from '../types';
import { storageGet, storageSet } from '../utils/storage';

const KEY = 'app:note-groups';

export function useNoteGroups() {
  const [groups, setGroups] = useState<NoteGroup[]>(() =>
    storageGet<NoteGroup[]>(KEY, []),
  );

  useEffect(() => {
    storageSet(KEY, groups);
  }, [groups]);

  function addGroup(): void {
    const group: NoteGroup = {
      id: crypto.randomUUID(),
      title: 'New Notes',
      notes: [],
      createdAt: Date.now(),
    };
    setGroups((prev) => [...prev, group]);
  }

  function deleteGroup(id: string): void {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }

  function renameGroup(id: string, title: string): void {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, title: title.trim() || g.title } : g)),
    );
  }

  function addNote(groupId: string, text: string): void {
    if (!text.trim()) return;
    const note: Note = { id: crypto.randomUUID(), text: text.trim(), createdAt: Date.now() };
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, notes: [...g.notes, note] } : g)),
    );
  }

  function deleteNote(groupId: string, noteId: string): void {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, notes: g.notes.filter((n) => n.id !== noteId) } : g,
      ),
    );
  }

  function updateNote(groupId: string, noteId: string, text: string): void {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, notes: g.notes.map((n) => (n.id === noteId ? { ...n, text: text.trim() || n.text } : n)) }
          : g,
      ),
    );
  }

  function reorderNotes(groupId: string, fromIndex: number, toIndex: number): void {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const next = [...g.notes];
        const [item] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, item);
        return { ...g, notes: next };
      }),
    );
  }

  function replaceGroups(incoming: NoteGroup[]): void {
    setGroups(incoming);
  }

  return { groups, addGroup, deleteGroup, renameGroup, addNote, deleteNote, updateNote, reorderNotes, replaceGroups };
}
