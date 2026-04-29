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

  reservations: [],
  fetchReservations: async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      
      // ⭐ 방어 코드: DB가 정상적으로 '배열'을 주었을 때만 적용, 아니면 빈 배열로 처리
      if (Array.isArray(data)) {
        set({ reservations: data });
      } else {
        console.error("DB에서 데이터를 가져오지 못했습니다:", data);
        set({ reservations: [] }); // 에러 나도 화면 안 죽게 빈 배열 세팅
      }
    } catch (error) {
      console.error("네트워크 에러:", error);
      set({ reservations: [] });
    }
  }
}));
