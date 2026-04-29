"use client"
import { useEffect } from 'react'
import { useCalendarStore } from '@/store/useCalendarStore'
import Header from '@/components/Header'
import MonthView from '@/components/MonthView'
import WeekView from '@/components/WeekView'
import ReservationModal from '@/components/ReservationModal'
import SettingsModal from '@/components/SettingsModal'

export default function Home() {
  const { viewMode, isResModalOpen, isSetModalOpen, fetchReservations, fetchRooms, fetchCustomHolidays } = useCalendarStore();

  useEffect(() => {
    fetchReservations(); fetchRooms(); fetchCustomHolidays();
  }, [fetchReservations, fetchRooms, fetchCustomHolidays]);

  return (
    <main className="h-screen flex flex-col p-6 max-w-7xl mx-auto overflow-hidden">
      <Header />
      {/* 상단바와 본문 사이 간격 조정 (mt-4 -> mt-8) */}
      <div className="mt-8 flex-1 bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl overflow-hidden flex flex-col">
        {viewMode === 'month' ? <MonthView /> : <WeekView />}
      </div>
      {isResModalOpen && <ReservationModal />}
      {isSetModalOpen && <SettingsModal />}
    </main>
  )
}
