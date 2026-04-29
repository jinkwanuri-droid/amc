import { create } from 'zustand';
import { addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';

interface CalendarState {
  currentDate: Date;
  viewMode: 'month' | 'week';
  setViewMode: (mode: 'month' | 'week') => void;
  setCurrentDate: (date: Date) => void;
  goNext: () => void;
  goPrev: () => void;
  goToday: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  currentDate: new Date(),
  viewMode: 'month',
  setViewMode: (mode) => set({ viewMode: mode }),
  setCurrentDate: (date) => set({ currentDate: date }),
  goNext: () => set((state) => ({
    currentDate: state.viewMode === 'month' ? addMonths(state.currentDate, 1) : addWeeks(state.currentDate, 1)
  })),
  goPrev: () => set((state) => ({
    currentDate: state.viewMode === 'month' ? subMonths(state.currentDate, 1) : subWeeks(state.currentDate, 1)
  })),
  goToday: () => set({ currentDate: new Date() })
}));
