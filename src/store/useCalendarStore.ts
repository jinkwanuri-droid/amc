import { create } from 'zustand';
import { addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';

interface CalendarState {
  currentDate: Date;
  viewMode: 'month' | 'week';
  setViewMode: (mode: 'month' | 'week') => void;
  setCurrentDate: (date: Date) => void;
  goNext: () => void; goPrev: () => void; goToday: () => void;
  
  isResModalOpen: boolean; setResModalOpen: (open: boolean) => void;
  isSetModalOpen: boolean; setSetModalOpen: (open: boolean) => void;

  // DB 연동 추가 부분
  reservations: any[];
  fetchReservations: () => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  currentDate: new Date(),
  viewMode: 'month',
  setViewMode: (mode) => set({ viewMode: mode }),
  setCurrentDate: (date) => set({ currentDate: date }),
  goNext: () => set((state) => ({ currentDate: state.viewMode === 'month' ? addMonths(state.currentDate, 1) : addWeeks(state.currentDate, 1) })),
  goPrev: () => set((state) => ({ currentDate: state.viewMode === 'month' ? subMonths(state.currentDate, 1) : subWeeks(state.currentDate, 1) })),
  goToday: () => set({ currentDate: new Date() }),
  
  isResModalOpen: false, setResModalOpen: (open) => set({ isResModalOpen: open }),
  isSetModalOpen: false, setSetModalOpen: (open) => set({ isSetModalOpen: open }),

  // API에서 데이터 가져오기
  reservations: [],
  fetchReservations: async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      set({ reservations: data });
    } catch (error) {
      console.error("예약 데이터를 불러오지 못했습니다.");
    }
  }
}));
