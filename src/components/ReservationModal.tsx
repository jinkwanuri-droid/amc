import { useState, useEffect } from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale'; // 한국어 요일 표시용

// 07:00 부터 18:00 까지 30분 단위 배열 생성
const TIME_OPTIONS: string[] = [];
for (let i = 7; i <= 18; i++) {
  TIME_OPTIONS.push(`${i.toString().padStart(2, '0')}:00`);
  if (i !== 18) TIME_OPTIONS.push(`${i.toString().padStart(2, '0')}:30`);
}

export default function ReservationModal() {
  const { closeResModal, fetchReservations, currentDate, selectedDateForModal, selectedTimeForModal, rooms } = useCalendarStore();
  
  const [reserver, setReserver] = useState(''); 
  const [description, setDescription] = useState('');
  const [roomId, setRoomId] = useState('');

  // 회의실 목록이 로드되면 첫 번째 회의실을 기본값으로 세팅
  useEffect(() => {
    if (rooms.length > 0 && !roomId) setRoomId(rooms[0].id);
  }, [rooms, roomId]);
  
  const initialDate = selectedDateForModal ? format(selectedDateForModal, 'yyyy-MM-dd') : format(currentDate, 'yyyy-MM-dd');
  const [date, setDate] = useState(initialDate);
  
  const [startHour, setStartHour] = useState(selectedTimeForModal || '09:00'); 
  const [endHour, setEndHour] = useState(selectedTimeForModal ? `${parseInt(selectedTimeForModal.split(':')[0]) + 1}:00` : '10:00');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeResModal(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeResModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) return alert("회의실을 먼저 생성하거나 선택해 주세요.");

    // 시간 포맷 강제 고정 (브라우저 버그 방지)
    const startTime = new Date(`${date}T${startHour}:00`); 
    const endTime = new Date(`${date}T${endHour}:00`);
    
    if (startTime >= endTime) return alert("종료 시각은 시작 시각보다 늦어야 합니다.");
    
    const res = await fetch('/api/reservations', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ reserver, description, startTime, endTime, roomId }) 
    });
    
    if (!res.ok) alert((await res.json()).error);
    else { await fetchReservations(); closeResModal(); }
  };

  // 공통 드롭다운 스타일 (iOS 스타일의 화살표 포함)
  const selectStyle = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer font-medium";
  const selectArrow = { backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px' };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[500px] shadow-2xl border border-white/50">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">회의실 예약하기</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 회의실 선택 추가 */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">회의실 선택</label>
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className={selectStyle} style={selectArrow}>
              {rooms.length === 0 ? <option value="">회의실을 설정에서 추가해주세요</option> : null}
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name} ({room.capacity}명)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">예약자</label>
              <input required value={reserver} onChange={(e) => setReserver(e.target.value)} type="text" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" placeholder="이름을 입력해 주세요" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">예약 날짜</label>
              {/* 커스텀 달력 뷰 트릭 */}
              <div className="relative">
                <input required value={date} onChange={(e) => setDate(e.target.value)} type="date" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium flex justify-between items-center text-gray-800">
                  {format(new Date(date), 'yyyy.MM.dd (E)', { locale: ko })}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">시작 시각</label>
              <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className={selectStyle} style={selectArrow}>
                {TIME_OPTIONS.map(time => <option key={`start-${time}`} value={time}>{time}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">종료 시각</label>
              <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className={selectStyle} style={selectArrow}>
                {TIME_OPTIONS.map(time => <option key={`end-${time}`} value={time}>{time}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">회의 내용</label>
            <input required value={description} onChange={(e) => setDescription(e.target.value)} type="text" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" placeholder="내용을 입력해 주세요" />
          </div>
          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={closeResModal} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">취소</button>
            <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition">예약 완료</button>
          </div>
        </form>
      </div>
    </div>
  );
}
