import { useCalendarStore } from '@/store/useCalendarStore';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Settings, Plus } from 'lucide-react';

export default function Header() {
  // 여기서 모달 여는 함수 2개를 가져옵니다 (openResModal, setSetModalOpen)
  const { currentDate, viewMode, setViewMode, goNext, goPrev, goToday, openResModal, setSetModalOpen } = useCalendarStore();

  return (
    <header className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AMC 회의실 예약</h1>
          <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider">AMC Meeting Room</p>
        </div>
        <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-xl shadow-sm border border-white/60">
          <button onClick={() => setViewMode('week')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>주간</button>
          <button onClick={() => setViewMode('month')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>월간</button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button onClick={goPrev} className="p-2 hover:bg-white/50 rounded-full transition"><ChevronLeft size={20} /></button>
        <button onClick={goToday} className="text-sm font-medium hover:bg-white/50 px-3 py-1 rounded-md transition">오늘</button>
        <button onClick={goNext} className="p-2 hover:bg-white/50 rounded-full transition"><ChevronRight size={20} /></button>
        <span className="text-lg font-bold w-32 text-center">{format(currentDate, 'yyyy년 M월')}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* ⭐ 수정된 부분: 그냥 openResModal()을 실행하도록 바꿈 */}
        <button onClick={() => openResModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all">
          <Plus size={18} /> 예약하기
        </button>
        <button onClick={() => setSetModalOpen(true)} className="p-2.5 bg-white/60 hover:bg-white border border-white rounded-xl shadow-sm transition-all text-gray-600">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
