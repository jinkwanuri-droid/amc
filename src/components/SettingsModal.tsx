import { useState, useEffect } from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function SettingsModal() {
  const { setSetModalOpen, rooms, customHolidays, fetchRooms, fetchCustomHolidays } = useCalendarStore();
  const [activeTab, setActiveTab] = useState<'rooms' | 'holidays'>('rooms');

  // 회의실 폼 상태
  const [roomName, setRoomName] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [color, setColor] = useState('#3b82f6');

  // 공휴일 폼 상태
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayName, setHolidayName] = useState('');

  // ESC 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setSetModalOpen(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSetModalOpen]);

  // 회의실 추가 및 삭제
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: roomName, capacity, color }) });
    setRoomName(''); fetchRooms();
  };
  const handleDeleteRoom = async (id: string) => {
    if (confirm('이 회의실을 삭제하시겠습니까? 관련 예약도 삭제될 수 있습니다.')) {
      await fetch(`/api/rooms?id=${id}`, { method: 'DELETE' }); fetchRooms();
    }
  };

  // 공휴일 추가 및 삭제
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/custom-holidays', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: holidayDate, name: holidayName }) });
    setHolidayDate(''); setHolidayName(''); fetchCustomHolidays();
  };
  const handleDeleteHoliday = async (id: string) => {
    if (confirm('이 공휴일을 삭제하시겠습니까?')) {
      await fetch(`/api/custom-holidays?id=${id}`, { method: 'DELETE' }); fetchCustomHolidays();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[600px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* 헤더 및 탭 */}
        <div className="p-6 border-b border-gray-100 pb-0">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">시스템 설정</h2>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('rooms')} className={`pb-3 px-2 font-bold text-sm border-b-2 transition ${activeTab === 'rooms' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>회의실 관리</button>
            <button onClick={() => setActiveTab('holidays')} className={`pb-3 px-2 font-bold text-sm border-b-2 transition ${activeTab === 'holidays' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>공휴일 관리</button>
          </div>
        </div>

        {/* 탭 내용 (스크롤) */}
        <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1 custom-scrollbar">
          {activeTab === 'rooms' ? (
            <div className="space-y-6">
              <form onSubmit={handleAddRoom} className="flex items-end gap-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1">회의실명</label><input required value={roomName} onChange={(e) => setRoomName(e.target.value)} type="text" className="w-full p-2 border rounded-lg text-sm" placeholder="예: 10층 대회의실" /></div>
                <div className="w-20"><label className="block text-xs font-bold text-gray-500 mb-1">수용인원</label><input required value={capacity} onChange={(e) => setCapacity(e.target.value)} type="number" min="1" className="w-full p-2 border rounded-lg text-sm" /></div>
                <div className="w-16"><label className="block text-xs font-bold text-gray-500 mb-1">컬러</label><input required value={color} onChange={(e) => setColor(e.target.value)} type="color" className="w-full h-9 p-1 border rounded-lg cursor-pointer" /></div>
                <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold h-[38px]">추가</button>
              </form>
              <div className="space-y-2">
                {rooms.map(room => (
                  <div key={room.id} className="flex items-center justify-between bg-white p-3 border rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: room.color }}></div>
                      <span className="font-bold text-gray-700">{room.name}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{room.capacity}명</span>
                    </div>
                    <button onClick={() => handleDeleteRoom(room.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleAddHoliday} className="flex items-end gap-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-40"><label className="block text-xs font-bold text-gray-500 mb-1">날짜</label><input required value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} type="date" className="w-full p-2 border rounded-lg text-sm" /></div>
                <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1">공휴일명</label><input required value={holidayName} onChange={(e) => setHolidayName(e.target.value)} type="text" className="w-full p-2 border rounded-lg text-sm" placeholder="예: 회사 창립기념일" /></div>
                <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold h-[38px]">추가</button>
              </form>
              <div className="space-y-2">
                {customHolidays.map(holiday => (
                  <div key={holiday.id} className="flex items-center justify-between bg-white p-3 border rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">{format(new Date(holiday.date), 'yyyy-MM-dd')}</span>
                      <span className="font-bold text-gray-700">{holiday.name}</span>
                    </div>
                    <button onClick={() => handleDeleteHoliday(holiday.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 푸터 (닫기 버튼) */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
          <button onClick={() => setSetModalOpen(false)} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">닫기</button>
        </div>
      </div>
    </div>
  );
}
