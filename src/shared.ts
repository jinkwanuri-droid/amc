import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
export interface Reservation {
  id: string;
  room_id: string;
  reserver: string;
  description: string;
  start_time: string;
  end_time: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  color: string;
  header_bg: string;
  accent_bg: string;
  border_color: string;
  text_color: string;
  order: number;
}

export interface CustomHoliday {
  id: string;
  date: string;
  name: string;
}

export type ViewType = 'week' | 'month';

// --- Constants ---
export const TIME_SLOTS = Array.from({ length: 23 }).map((_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const min = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${min}`;
});

// --- API Functions ---
export const fetchDebugInfo = async () => {
  const res = await fetch('/api/debug');
  if (!res.ok) return { databaseConnected: false, dbProvider: 'Unknown' };
  return res.json();
};

export const fetchReservations = async (roomId: string): Promise<Reservation[]> => {
  const res = await fetch(`/api/reservations?roomId=${roomId}`);
  if (!res.ok) throw new Error('Failed to fetch reservations');
  return res.json();
};

export const fetchRooms = async (): Promise<Room[]> => {
  const res = await fetch('/api/rooms');
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return res.json();
};

export const fetchHolidays = async (): Promise<CustomHoliday[]> => {
  const res = await fetch('/api/holidays');
  if (!res.ok) throw new Error('Failed to fetch holidays');
  return res.json();
};

export const createReservation = async (data: Omit<Reservation, 'id'>) => {
  const res = await fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create reservation');
  }
  return res.json();
};

export const updateReservation = async (id: string, data: Omit<Reservation, 'id'>) => {
  const res = await fetch(`/api/reservations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update reservation');
  }
  return res.json();
};

export const createRoom = async (data: Omit<Room, 'id'>) => {
  const res = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create room');
  return res.json();
};

export const deleteRoom = async (id: string) => {
  const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete room');
  return res.json();
};

export const deleteReservation = async (id: string) => {
  const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete reservation');
  return res.json();
};
