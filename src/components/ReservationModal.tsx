import { useState, useEffect } from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 07:00 ~ 18:00 30분 단위 옵션
const TIME_OPTIONS: string[] = [];
for (let i = 7; i <= 18; i++) {
  TIME_OPTIONS.push(`${i.toString().padStart(2, '0')}:00`);
  if (i !== 18) TIME_OPTIONS.push(`${i.toString().padStart(2, '0')}:30`);
}

export default function ReservationModal() {
  const { closeResModal, fetchReservations, currentDate, selectedDateForModal, selectedTimeForModal, rooms, selectedReservation, setSelectedReservation } = useCalendarStore();
  
  const isEditMode = !!selectedReservation;

  // 폼 상태 (수정 모드일 땐 기존 데이터, 아니면 기본값)
  const [roomId, setRoomId] = useState(isEditMode ? selectedReservation.roomId : '');
  const [reserver, setReserver] = useState(isEditMode ? selectedReservation.reserver : ''); 
  const [description, setDescription] = useState(isEditMode ? selectedReservation.description : '');
  
  const initialDate = isEditMode ? format(new Date(selectedReservation.startTime), 'yyyy-MM-dd') : (selectedDateForModal ? format(selectedDateForModal, 'yyyy-MM-dd') : format(currentDate, 'yyyy-MM-dd'));
  const [date, setDate] = useState(initialDate);
  
  const [startHour, setStartHour] = useState(isEditMode ? format(new Date(selectedReservation.startTime), 'HH:mm') : (selectedTimeForModal || '09:00')); 
  const [endHour, setEndHour] = useState(isEditMode ? format(new Date(selectedReservation.endTime), 'HH:mm') : (selectedTimeForModal ? `${parseInt(selectedTimeForModal.split(':')[0]) + 1}:00` : '10:00'));

  useEffect(() => { if (rooms.length > 0 && !roomId) setRoomId(rooms[0].id); }, [rooms, roomId]);

  const handleClose = () => {
    setSelectedReservation(null); // 수정 모드 초기화
    closeResModal();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) return alert("회의실을 선택해 주세요.");

    const startTime = new Date(`${date}T${startHour}:00`); 
    const endTime = new Date(`${date}T${endHour}:00`);
    if (startTime >= endTime) return alert("종료 시각은 시작 시각보다 늦어야 합니다.");
    
    // 수정(PUT)인지 생성(POST)인지 판단
    const method = isEditMode ? 'PUT' : 'POST';
    const bodyPayload = isEditMode 
      ? { id: selectedReservation.id, reserver, description, startTime, endTime, roomId }
      : { reserver, description, startTime, endTime, roomId };

    const res = await fetch('/api/reservations', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyPayload) });
    
    if (!res.ok) alert((await res.json()).error);
    else { await fetchReservations(); handleClose(); }
  };

  const selectStyle = "w-full p-3 bg-gray-50/50 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer font-bold text-gray-700 transition hover:bg-gray-50";
  const selectArrow = { backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[70]">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-7 w-[500px] shadow-[0_20px_60px_rgb(0,0,0,0.15)] border border-white">
        <h2 className="text-2xl font-extrabold mb-6 text-gray-800">{isEditMode ? '회의실 예약 수정' : '회의실 예약하기'}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-extrabold text-gray-500 mb-1.5 ml-1">회의실 선택</label>
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className={selectStyle} style={selectArrow}>
              {rooms.length === 0 ? <option value="">회의실을 추가해주세요</option> : null}
              {rooms.map(room => (<option key={room.id} value={room.id}>{room.name} ({room.capacity}명)</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-extrabold text-gray-500 mb-1.5 ml-1">예약자</label>
              <input required value={reserver} onChange={(e) => setReserver(e.target.value)} type="text" className="w-full p-3 bg-gray-50/50 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-gray-800 placeholder-gray-400 transition hover:bg-gray-50" placeholder="이름 입력" />
            </div>
            <div>
              <label className="block text-[13px] font-extrabold text-gray-500 mb-1.5 ml-1">예약 날짜</label>
              <div className="relative">
                <input required value={date} onChange={(e) => setDate(e.target.value)} type="date" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="w-full p-3 bg-gray-50/50 border border-gray-200/80 rounded-xl font-bold flex justify-between items-center text-gray-700 transition hover:bg-gray-50">
                  {format(new Date(date), 'yyyy.MM.dd (E)', { locale: ko })}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-extrabold text-gray-500 mb-1.5 ml-1">시작 시각</label>
              <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className={selectStyle} style={selectArrow}>
                {TIME_OPTIONS.map(time => <option key={`start-${time}`} value={time}>{time}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-extrabold text-gray-500 mb-1.5 ml-1">종료 시각</label>
              <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className={selectStyle} style={selectArrow}>
                {TIME_OPTIONS.map(time => <option key={`end-${time}`} value={time}>{time}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-extrabold text-gray-500 mb-1.5 ml-1">회의 내용</label>
            <input required value={description} onChange={(e) => setDescription(e.target.value)} type="text" className="w-full p-3 bg-gray-50/50 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-gray-800 placeholder-gray-400 transition hover:bg-gray-50" placeholder="회의 내용을 입력해 주세요" />
          </div>
          <div className="mt-8 flex justify-end gap-2 pt-5 border-t border-gray-200/50">
            <button type="button" onClick={handleClose} className="px-6 py-3 text-gray-500 font-extrabold hover:bg-gray-100 rounded-xl transition">취소</button>
            <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.3)] transition transform hover:-translate-y-0.5">{isEditMode ? '수정 완료' : '예약 완료'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
