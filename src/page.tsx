"use client"
import { useCalendarStore } from '@/store/useCalendarStore'
import Header from '@/components/Header'
import RoomFilter from '@/components/RoomFilter'
import MonthView from '@/components/MonthView'
import WeekView from '@/components/WeekView'

export default function Home() {
  const { viewMode } = useCalendarStore();

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      <Header />
      <RoomFilter />
      
      {/* Glassmorphism 컨테이너 */}
      <div className="mt-6 bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl overflow-hidden p-6">
        {viewMode === 'month' ? <MonthView /> : <WeekView />}
      </div>
    </main>
  )
}
