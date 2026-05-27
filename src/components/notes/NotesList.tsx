import { useEffect, useRef, useState } from 'react';
import type { Note } from '../../types';

interface NoteRowProps {
  note: Note;
  index: number;
  modifying: boolean;
  dragOverIndex: number | null;
  onDelete: () => void;
  onUpdate: (text: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  onDragEnd: () => void;
}

function NoteRow({
  note, index, modifying, dragOverIndex,
  onDelete, onUpdate, onDragStart, onDragOver, onDrop, onDragEnd,
}: NoteRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.text);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      const el = inputRef.current;
      if (!el) return;
      el.select();
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, [editing]);

  useEffect(() => {
    if (!editing) setDraft(note.text);
  }, [note.text, editing]);

  function startEditing() {
    if (!modifying) return;
    setDraft(note.text);
    setEditing(true);
  }

  function save() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== note.text) onUpdate(trimmed);
    setEditing(false);
  }

  function cancel() {
    setDraft(note.text);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDraft(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  }

  const isDragTarget = dragOverIndex === index;

  return (
    <li
      className={`flex items-start gap-2 py-2 px-2 rounded-lg bg-gray-50 border border-gray-100 transition-colors ${
        isDragTarget && modifying ? 'border-t-2 border-blue-400' : ''
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
      <span className="shrink-0 text-gray-400 w-5 mt-0.5">{index + 1}.</span>

      {editing ? (
        <textarea
          ref={inputRef}
          rows={1}
          className="flex-1 min-w-0 text-sm text-gray-800 bg-transparent border-b-2 border-green-400 focus:outline-none py-0.5 resize-none overflow-hidden leading-relaxed"
          value={draft}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={save}
        />
      ) : (
        <span
          className={`flex-1 text-sm text-gray-800 leading-relaxed break-words min-w-0 ${
            modifying ? 'cursor-text hover:text-blue-600' : ''
          }`}
          onClick={startEditing}
        >
          {note.text}
        </span>
      )}

      {modifying && (
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 transition-colors shrink-0 text-xl leading-none px-1"
          title="Delete"
        >
          ×
        </button>
      )}
    </li>
  );
}

interface Props {
  title?: string;
  notes: Note[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onTitleChange?: (title: string) => void;
  onDeleteGroup?: () => void;
}

export function NotesList({ title = "Today's Notes", notes, onAdd, onDelete, onUpdate, onReorder, onTitleChange, onDeleteGroup }: Props) {
  const [draft, setDraft] = useState('');
  const [modifying, setModifying] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTitleDraft(title); }, [title]);
  useEffect(() => { if (editingTitle) titleInputRef.current?.select(); }, [editingTitle]);

  function saveTitle() {
    const trimmed = titleDraft.trim();
    if (trimmed && onTitleChange) onTitleChange(trimmed);
    setEditingTitle(false);
  }

  function handleAdd() {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  }

  function handleDragStart(index: number) { setDragIndex(index); }
  function handleDragOver(e: React.DragEvent, index: number) { e.preventDefault(); setDragOverIndex(index); }
  function handleDrop(index: number) {
    if (dragIndex !== null) onReorder(dragIndex, index);
    setDragIndex(null);
    setDragOverIndex(null);
  }
  function handleDragEnd() { setDragIndex(null); setDragOverIndex(null); }

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        {editingTitle && onTitleChange ? (
          <input
            ref={titleInputRef}
            className="text-xl font-semibold text-gray-800 bg-transparent border-b-2 border-blue-400 focus:outline-none flex-1"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
            onBlur={saveTitle}
          />
        ) : (
          <h2
            className={`text-xl font-semibold text-gray-800 flex-1 ${onTitleChange ? 'cursor-text hover:text-blue-600' : ''}`}
            onClick={() => onTitleChange && setEditingTitle(true)}
            title={onTitleChange ? 'Click to rename' : undefined}
          >
            {title}
          </h2>
        )}
        {onDeleteGroup && (
          <button
            onClick={onDeleteGroup}
            className="text-gray-300 hover:text-red-500 transition-colors text-2xl leading-none px-1"
            title="Delete this section"
          >
            ×
          </button>
        )}
      </div>

      {modifying && (
        <div className="mb-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 italic">
          Edit mode — click any item to edit, drag to reorder, × to delete
        </div>
      )}

      <textarea
        className="w-full border border-gray-300 rounded px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none h-24"
        placeholder="Write a note... (Enter to save, Shift+Enter for newline)"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleAdd}
          className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors font-medium"
        >
          Add
        </button>
        <button
          onClick={() => setModifying((v) => !v)}
          className={`flex-1 sm:flex-none px-4 py-2 text-sm rounded font-medium transition-colors ${
            modifying
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {modifying ? 'Done' : 'Modify'}
        </button>
      </div>

      {notes.length > 0 && (
        <ol className="mt-4 space-y-1.5 list-none">
          {notes.map((note, i) => (
            <NoteRow
              key={note.id}
              note={note}
              index={i}
              modifying={modifying}
              dragOverIndex={dragOverIndex}
              onDelete={() => onDelete(note.id)}
              onUpdate={(text) => onUpdate(note.id, text)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
