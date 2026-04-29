import { create } from 'zustand';
import { addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';

interface CalendarState {
  currentDate: Date; viewMode: 'month' | 'week';
  setViewMode: (mode: 'month' | 'week') => void; setCurrentDate: (date: Date) => void;
  goNext: () => void; goPrev: () => void; goToday: () => void;
  
  isResModalOpen: boolean; selectedDateForModal: Date | null; selectedTimeForModal: string | null;
  openResModal: (date?: Date, time?: string) => void; closeResModal: () => void;
  
  isSetModalOpen: boolean; setSetModalOpen: (open: boolean) => void;

  // ⭐ 예약 상세/수정 창 상태 추가
  selectedReservation: any | null;
  setSelectedReservation: (res: any | null) => void;

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
  
  isResModalOpen: false, selectedDateForModal: null, selectedTimeForModal: null,
  openResModal: (date, time) => set({ isResModalOpen: true, selectedDateForModal: date || null, selectedTimeForModal: time || null }),
  closeResModal: () => set({ isResModalOpen: false, selectedDateForModal: null, selectedTimeForModal: null }),

  isSetModalOpen: false, setSetModalOpen: (open) => set({ isSetModalOpen: open }),

  selectedReservation: null, setSelectedReservation: (res) => set({ selectedReservation: res }),

  reservations: [], fetchReservations: async () => { const res = await fetch('/api/reservations'); set({ reservations: Array.isArray(await res.json()) ? await res.json() : [] }); },
  rooms: [], fetchRooms: async () => { const res = await fetch('/api/rooms'); set({ rooms: Array.isArray(await res.json()) ? await res.json() : [] }); },
  customHolidays: [], fetchCustomHolidays: async () => { const res = await fetch('/api/custom-holidays'); set({ customHolidays: Array.isArray(await res.json()) ? await res.json() : [] }); }
}));
