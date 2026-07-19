import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured, getDeviceId } from './supabaseClient';
import type { Task, Reminder, Note } from '../types';

type AnyTask = Task & { [k: string]: any };
type AnyReminder = Reminder & { [k: string]: any };
type AnyNote = Note & { [k: string]: any };

const DEVICE_ID = getDeviceId();

function mapTaskToRow(t: AnyTask) {
  return {
    id: t.id,
    device_id: DEVICE_ID,
    title: t.title,
    notes: t.notes ?? '',
    priority: t.priority,
    due_at: t.dueAt ?? '',
    completed: t.completed,
    tags: t.tags ?? [],
    completed_at: t.completedAt ?? '',
    archived: t.archived ?? false,
    reminder_at: t.reminderAt ?? '',
    category: t.category ?? '',
    created_at: t.createdAt ?? '',
    attachment: t.attachment ?? '',
    sub_tasks: t.subTasks ?? [],
    recurring: t.recurring ?? 'none',
  };
}

function mapRowToTask(r: any): Task {
  return {
    id: r.id,
    title: r.title,
    notes: r.notes ?? '',
    priority: r.priority,
    dueAt: r.due_at ?? '',
    completed: r.completed,
    tags: r.tags ?? [],
    completedAt: r.completed_at ?? '',
    archived: r.archived ?? false,
    reminderAt: r.reminder_at ?? '',
    category: r.category ?? '',
    createdAt: r.created_at ?? '',
    attachment: r.attachment ?? '',
    subTasks: r.sub_tasks ?? [],
    recurring: r.recurring ?? 'none',
  };
}

function mapReminderToRow(r: AnyReminder) {
  return {
    id: r.id,
    device_id: DEVICE_ID,
    title: r.title,
    remind_at: r.remindAt,
    repeat: r.repeat,
    completed: r.completed,
  };
}

function mapRowToReminder(r: any): Reminder {
  return {
    id: r.id,
    title: r.title,
    remindAt: r.remind_at,
    repeat: r.repeat,
    completed: r.completed,
  };
}

function mapNoteToRow(n: AnyNote) {
  return {
    id: n.id,
    device_id: DEVICE_ID,
    title: n.title,
    content: n.content ?? '',
    created_at: n.createdAt ?? '',
    tags: n.tags ?? [],
  };
}

function mapRowToNote(r: any): Note {
  return {
    id: r.id,
    title: r.title,
    content: r.content ?? '',
    createdAt: r.created_at ?? '',
    tags: r.tags ?? [],
  };
}

export interface PersistenceHook {
  loadTasks: () => Promise<Task[]>;
  loadReminders: () => Promise<Reminder[]>;
  loadNotes: () => Promise<Note[]>;
}

export function useNeoraPersistence(
  tasks: Task[],
  reminders: Reminder[],
  notes: Note[],
  opts: { enabled: boolean },
) {
  const enabled = opts.enabled && isSupabaseConfigured;
  const firstRun = useRef(true);

  // Initial load
  useEffect(() => {
    if (!enabled) return;
    // Load handled by caller via exported loaders below; nothing to do here.
  }, [enabled]);

  // Save tasks on change
  useEffect(() => {
    if (!enabled || firstRun.current) return;
    if (!supabase) return;
    const rows = tasks.map(mapTaskToRow);
    const cancelled = { current: false };
    (async () => {
      try {
        await supabase.from('neora_tasks').upsert(rows, { onConflict: 'id' });
        // Delete removed
        const ids = rows.map((r) => r.id);
        if (ids.length === 0) {
          await supabase.from('neora_tasks').delete().eq('device_id', DEVICE_ID);
        } else {
          await supabase.from('neora_tasks').delete().eq('device_id', DEVICE_ID).not('id', 'in', `(${ids.join(',')})`);
        }
      } catch (e) {
        console.warn('Neora persistence: tasks save failed', e);
      } finally {
        if (!cancelled.current) {
        }
      }
    })();
    return () => { cancelled.current = true; };
  }, [tasks, enabled]);

  useEffect(() => {
    if (!enabled || firstRun.current) return;
    if (!supabase) return;
    const rows = reminders.map(mapReminderToRow);
    (async () => {
      try {
        await supabase.from('neora_reminders').upsert(rows, { onConflict: 'id' });
        const ids = rows.map((r) => r.id);
        if (ids.length === 0) {
          await supabase.from('neora_reminders').delete().eq('device_id', DEVICE_ID);
        } else {
          await supabase.from('neora_reminders').delete().eq('device_id', DEVICE_ID).not('id', 'in', `(${ids.join(',')})`);
        }
      } catch (e) {
        console.warn('Neora persistence: reminders save failed', e);
      }
    })();
  }, [reminders, enabled]);

  useEffect(() => {
    if (!enabled || firstRun.current) return;
    if (!supabase) return;
    const rows = notes.map(mapNoteToRow);
    (async () => {
      try {
        await supabase.from('neora_notes').upsert(rows, { onConflict: 'id' });
        const ids = rows.map((r) => r.id);
        if (ids.length === 0) {
          await supabase.from('neora_notes').delete().eq('device_id', DEVICE_ID);
        } else {
          await supabase.from('neora_notes').delete().eq('device_id', DEVICE_ID).not('id', 'in', `(${ids.join(',')})`);
        }
      } catch (e) {
        console.warn('Neora persistence: notes save failed', e);
      }
    })();
  }, [notes, enabled]);

  // Clear firstRun after initial mount
  useEffect(() => {
    const t = setTimeout(() => { firstRun.current = false; }, 1500);
    return () => clearTimeout(t);
  }, []);

  return {
    loadTasks: async (): Promise<Task[]> => {
      if (!enabled || !supabase) return [];
      const { data, error } = await supabase
        .from('neora_tasks')
        .select('*')
        .eq('device_id', DEVICE_ID)
        .order('created_at', { ascending: false });
      if (error) { console.warn('load tasks', error); return []; }
      return (data ?? []).map(mapRowToTask);
    },
    loadReminders: async (): Promise<Reminder[]> => {
      if (!enabled || !supabase) return [];
      const { data, error } = await supabase
        .from('neora_reminders')
        .select('*')
        .eq('device_id', DEVICE_ID);
      if (error) { console.warn('load reminders', error); return []; }
      return (data ?? []).map(mapRowToReminder);
    },
    loadNotes: async (): Promise<Note[]> => {
      if (!enabled || !supabase) return [];
      const { data, error } = await supabase
        .from('neora_notes')
        .select('*')
        .eq('device_id', DEVICE_ID);
      if (error) { console.warn('load notes', error); return []; }
      return (data ?? []).map(mapRowToNote);
    },
  };
}
