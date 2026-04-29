import { useEffect } from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MapPin, Clock, AlignLeft, User, Edit2, Trash2, X } from 'lucide-react';

export default function ReservationDetailModal() {
  const { selectedReservation, setSelectedReservation, setResModalOpen, fetchReservations } = useCalendarStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedReservation(null); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedReservation]);

  if (!selectedReservation) return null;

  const start = new Date(selectedReservation.startTime);
  const end = new Date(selectedReservation.endTime);
  const room = selectedReservation.room;

  const handleDelete = async () => {
    if (confirm('이 예약을 정말 삭제하시겠습니까?')) {
      await fetch(`/api/reservations?id=${selectedReservation.id}`, { method: 'DELETE' });
      await fetchReservations();
      setSelectedReservation(null);
    }
  };

  const handleEdit = () => {
    // 상세창 닫고 예약 폼 열기 (수정 모드로 진입)
    setSelectedReservation(selectedReservation);
    setResModalOpen(true);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[60]">
      <div className="bg-white/80 backdrop-blur-2xl rounded-3xl w-[400px] shadow-[0_20px_60px_rgb(0,0,0,0.1)] border border-white overflow-hidden transform transition-all">
        {/* 헤더 영역 (회의실 테마 컬러 배경) */}
        <div className="px-6 py-5 relative" style={{ backgroundColor: room?.color || '#3b82f6' }}>
          <button onClick={() => setSelectedReservation(null)} className="absolute top-4 right-4 text-white/80 hover:text-white transition"><X size={24} /></button>
          <div className="flex items-center gap-2 text-white/90 mb-1">
            <MapPin size={16} /> <span className="text-sm font-bold">{room?.name}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white line-clamp-2 leading-tight">{selectedReservation.description}</h2>
        </div>

        {/* 상세 정보 영역 */}
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0"><Clock size={20} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 mb-0.5">예약 일시</p>
              <p className="text-gray-800 font-extrabold">{format(start, 'yyyy.MM.dd (E)', { locale: ko })}</p>
              <p className="text-gray-600 font-medium">{format(start, 'HH:mm')} ~ {format(end, 'HH:mm')}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0"><User size={20} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 mb-0.5">예약자</p>
              <p className="text-gray-800 font-extrabold">{selectedReservation.reserver}</p>
            </div>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={handleDelete} className="px-4 py-2 text-red-500 hover:bg-red-50 font-bold rounded-xl flex items-center gap-1.5 transition"><Trash2 size={16} /> 삭제</button>
          <button onClick={handleEdit} className="px-5 py-2 bg-gray-800 hover:bg-black text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md transition"><Edit2 size={16} /> 수정하기</button>
        </div>
      </div>
    </div>
  );
}
