export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening';

export interface Reminder {
  id: string;
  text: string;
  date: string;       // YYYY-MM-DD
  timeOfDay: TimeOfDay;
  createdAt: number;
}

export interface Note {
  id: string;
  text: string;
  createdAt: number;
}

export interface NoteGroup {
  id: string;
  title: string;
  notes: Note[];
  createdAt: number;
}
