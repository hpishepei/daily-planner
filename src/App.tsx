import { useRef } from 'react';
import { useNotes } from './hooks/useNotes';
import { useReminders } from './hooks/useReminders';
import { NotesList } from './components/notes/NotesList';
import { RemindersList } from './components/reminders/RemindersList';
import type { Note, Reminder } from './types';

const FILE_PICKER_OPTS = {
  suggestedName: 'planner.json',
  startIn: 'downloads' as const,
  types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
};

export default function App() {
  const { notes, addNote, deleteNote, updateNote, reorderNotes, replaceNotes } = useNotes();
  const { reminders, addReminder, deleteReminder, updateReminder, reorderReminders, replaceReminders } = useReminders();
  const importRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    const data = JSON.stringify({ notes, reminders }, null, 2);
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker(FILE_PICKER_OPTS);
        const writable = await handle.createWritable();
        await writable.write(data);
        await writable.close();
        return;
      } catch (e: any) {
        if (e.name === 'AbortError') return;
      }
    }
    // Fallback for browsers without File System Access API
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'planner.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportClick() {
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          startIn: 'downloads' as const,
          types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
        });
        const file = await handle.getFile();
        parseImportFile(file);
        return;
      } catch (e: any) {
        if (e.name === 'AbortError') return;
      }
    }
    importRef.current?.click();
  }

  function parseImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (Array.isArray(parsed.notes)) replaceNotes(parsed.notes as Note[]);
        if (Array.isArray(parsed.reminders)) replaceReminders(parsed.reminders as Reminder[]);
      } catch {
        alert('Invalid file — could not import data.');
      }
    };
    reader.readAsText(file);
  }

  function handleImportFallback(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) parseImportFile(file);
    e.target.value = '';
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-y-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Daily Planner</h1>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-1.5 border border-gray-400 text-gray-700 text-sm rounded hover:bg-gray-100 transition-colors"
            >
              Export
            </button>
            <button
              onClick={handleImportClick}
              className="px-4 py-1.5 border border-gray-400 text-gray-700 text-sm rounded hover:bg-gray-100 transition-colors"
            >
              Import
            </button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImportFallback} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <RemindersList
            reminders={reminders}
            onAdd={addReminder}
            onDelete={deleteReminder}
            onUpdate={updateReminder}
            onReorder={reorderReminders}
          />
          <NotesList
            notes={notes}
            onAdd={addNote}
            onDelete={deleteNote}
            onUpdate={updateNote}
            onReorder={reorderNotes}
          />
        </div>
      </div>
    </div>
  );
}
