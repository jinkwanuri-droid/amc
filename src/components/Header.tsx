import { useCalendarStore } from '@/store/useCalendarStore';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Settings, Plus } from 'lucide-react';

export default function Header() {
  const { currentDate, viewMode, setViewMode, goNext, goPrev, goToday, openResModal, setSetModalOpen } = useCalendarStore();
  return (
    <header className="flex items-center justify-between mb-4 px-2">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">AMC 회의실 예약</h1>
          <p className="text-[11px] text-blue-500 font-bold uppercase tracking-wider mt-0.5">AMC Meeting Room</p>
        </div>
        <div className="flex bg-white/60 backdrop-blur-xl p-1 rounded-xl shadow-sm border border-white/80">
          <button onClick={() => setViewMode('week')} className={`px-4 py-1.5 rounded-lg text-sm transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700 font-medium'}`}>주간</button>
          <button onClick={() => setViewMode('month')} className={`px-4 py-1.5 rounded-lg text-sm transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700 font-medium'}`}>월간</button>
        </div>
      </div>
      <div className="flex items-center gap-4 bg-white/40 backdrop-blur-xl px-4 py-1.5 rounded-2xl border border-white/60 shadow-sm">
        <button onClick={goPrev} className="p-1 hover:bg-white/60 rounded-full transition"><ChevronLeft size={20} className="text-gray-600"/></button>
        <button onClick={goToday} className="text-sm font-bold hover:bg-white/60 px-3 py-1 rounded-md transition text-gray-700">오늘</button>
        <button onClick={goNext} className="p-1 hover:bg-white/60 rounded-full transition"><ChevronRight size={20} className="text-gray-600"/></button>
        <span className="text-lg font-extrabold w-28 text-center text-gray-800">{format(currentDate, 'yyyy년 M월')}</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => openResModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"><Plus size={18} /> 예약하기</button>
        <button onClick={() => setSetModalOpen(true)} className="p-2.5 bg-white/60 hover:bg-white border border-white/80 rounded-2xl shadow-sm transition-all text-gray-600"><Settings size={20} /></button>
      </div>
    </header>
  );
}
