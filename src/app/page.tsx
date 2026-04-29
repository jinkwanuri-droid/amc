"use client"
import { useCalendarStore } from '@/store/useCalendarStore'
import Header from '@/components/Header'
import MonthView from '@/components/MonthView'
import WeekView from '@/components/WeekView'
import ReservationModal from '@/components/ReservationModal'
import SettingsModal from '@/components/SettingsModal'

export default function Home() {
  const { viewMode, isResModalOpen, isSetModalOpen } = useCalendarStore();

  return (
    <main className="h-screen flex flex-col p-6 max-w-7xl mx-auto overflow-hidden">
      <Header />
      
      {/* 캘린더 영역 (카드섹션 안에서만 스크롤되도록 설정) */}
      <div className="flex-1 bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl overflow-hidden flex flex-col">
        {viewMode === 'month' ? <MonthView /> : <WeekView />}
      </div>

      {/* 모달창 렌더링 */}
      {isResModalOpen && <ReservationModal />}
      {isSetModalOpen && <SettingsModal />}
    </main>
  )
}
