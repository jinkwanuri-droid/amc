"use client"
import { useEffect } from 'react'
import { useCalendarStore } from '@/store/useCalendarStore'
import Header from '@/components/Header'
import MonthView from '@/components/MonthView'
import WeekView from '@/components/WeekView'
import ReservationModal from '@/components/ReservationModal'
import SettingsModal from '@/components/SettingsModal'
import ReservationDetailModal from '@/components/ReservationDetailModal' // 신규 추가

export default function Home() {
  const { viewMode, isResModalOpen, isSetModalOpen, selectedReservation, fetchReservations, fetchRooms, fetchCustomHolidays } = useCalendarStore();

  useEffect(() => { fetchReservations(); fetchRooms(); fetchCustomHolidays(); }, [fetchReservations, fetchRooms, fetchCustomHolidays]);

  return (
    <main className="h-screen flex flex-col p-6 max-w-7xl mx-auto overflow-hidden">
      <Header />
      {/* 딥 글래스모피즘 적용 + 좌/우/하 내부 여백 15px 추가 */}
      <div className="flex-1 bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden flex flex-col px-[15px] pb-[15px]">
        {viewMode === 'month' ? <MonthView /> : <WeekView />}
      </div>
      {isResModalOpen && <ReservationModal />}
      {isSetModalOpen && <SettingsModal />}
      {selectedReservation && <ReservationDetailModal />}
    </main>
  )
}
