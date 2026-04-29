import { useState } from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { format } from 'date-fns';

export default function ReservationModal() {
  const { setResModalOpen, fetchReservations, currentDate } = useCalendarStore();
  
  // 폼 상태 관리
  const [reserver, setReserver] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(currentDate, 'yyyy-MM-dd'));
  const [startHour, setStartHour] = useState('09:00');
  const [endHour, setEndHour] = useState('10:00');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const startTime = new Date(`${date}T${startHour}:00`);
    const endTime = new Date(`${date}T${endHour}:00`);

    if (startTime >= endTime) {
      alert("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    // API로 전송 (DB 저장)
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reserver, description, startTime, endTime })
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert(errorData.error); // "해당 시각에는 이미 예약이 있습니다." 알림창
    } else {
      await fetchReservations(); // 성공시 데이터 새로고침
      setResModalOpen(false);    // 모달 닫기
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[500px] shadow-2xl border border-white/50">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">회의실 예약하기</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">예약자</label>
              <input required value={reserver} onChange={(e) => setReserver(e.target.value)} type="text" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="홍길동 대리" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">예약 날짜</label>
              <input required value={date} onChange={(e) => setDate(e.target.value)} type="date" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">시작 시간</label>
              <input required value={startHour} onChange={(e) => setStartHour(e.target.value)} type="time" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">종료 시간</label>
              <input required value={endHour} onChange={(e) => setEndHour(e.target.value)} type="time" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">회의 내용</label>
            <input required value={description} onChange={(e) => setDescription(e.target.value)} type="text" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="주간 업무 보고" />
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setResModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">취소</button>
            <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition">예약 완료</button>
          </div>
        </form>
      </div>
    </div>
  );
}
