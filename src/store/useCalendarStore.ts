import { create } from 'zustand'

interface CalendarState {
  currentDate: Date;
  viewMode: 'month' | 'week';
  setViewMode: (mode: 'month' | 'week') => void;
  setCurrentDate: (date: Date) => void;
  nextPeriod: () => void; // 다음 달 or 다음 주
  prevPeriod: () => void; // 이전 달 or 이전 주
}

export const useCalendarStore = create<CalendarState>((set) => ({
  currentDate: new Date(),
  viewMode: 'month',
  setViewMode: (mode) => set({ viewMode: mode }),
  setCurrentDate: (date) => set({ currentDate: date }),
  // ... 날짜 계산 로직 추가
}))
