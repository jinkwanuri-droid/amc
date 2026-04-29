import { create } from 'zustand';
import { addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';

interface CalendarState {
  currentDate: Date; viewMode: 'month' | 'week';
  setViewMode: (mode: 'month' | 'week') => void; setCurrentDate: (date: Date) => void;
  goNext: () => void; goPrev: () => void; goToday: () => void;
  
  isResModalOpen: boolean; 
  selectedDateForModal: Date | null;
  selectedTimeForModal: string | null;
  openResModal: (date?: Date, time?: string) => void;
  closeResModal: () => void;
  
  isSetModalOpen: boolean; setSetModalOpen: (open: boolean) => void;

  reservations: any[]; fetchReservations: () => Promise<void>;
  rooms: any[]; fetchRooms: () => Promise<void>;
  customHolidays: any[]; fetchCustomHolidays: () => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  currentDate: new Date(), viewMode: 'month',
  setViewMode: (mode) => set({ viewMode: mode }), setCurrentDate: (date) => set({ currentDate: date }),
  goNext: () => set((state) => ({ currentDate: state.viewMode === 'month' ? addMonths(state.currentDate, 1) : addWeeks(state.currentDate, 1) })),
  goPrev: () => set((state) => ({ currentDate: state.viewMode === 'month' ? subMonths(state.currentDate, 1) : subWeeks(state.currentDate, 1) })),
  goToday: () => set({ currentDate: new Date() }),
  
  isResModalOpen: false,
  selectedDateForModal: null,
  selectedTimeForModal: null,
  openResModal: (date, time) => set({ isResModalOpen: true, selectedDateForModal: date || null, selectedTimeForModal: time || null }),
  closeResModal: () => set({ isResModalOpen: false, selectedDateForModal: null, selectedTimeForModal: null }),

  isSetModalOpen: false, setSetModalOpen: (open) => set({ isSetModalOpen: open }),

  reservations: [], fetchReservations: async () => { const res = await fetch('/api/reservations'); const data = await res.json(); set({ reservations: Array.isArray(data) ? data : [] }); },
  rooms: [], fetchRooms: async () => { const res = await fetch('/api/rooms'); const data = await res.json(); set({ rooms: Array.isArray(data) ? data : [] }); },
  customHolidays: [], fetchCustomHolidays: async () => { const res = await fetch('/api/custom-holidays'); const data = await res.json(); set({ customHolidays: Array.isArray(data) ? data : [] }); }
}));
