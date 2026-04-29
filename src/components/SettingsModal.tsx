import { useState, useEffect } from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { Trash2, Check, Edit2, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const PRESET_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'];

export default function SettingsModal() {
  const { setSetModalOpen, rooms, customHolidays, fetchRooms, fetchCustomHolidays } = useCalendarStore();
  const [activeTab, setActiveTab] = useState<'rooms' | 'holidays'>('rooms');

  // 회의실 폼 상태 (수정 모드 지원)
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState(''); 
  const [capacity, setCapacity] = useState('4');
  const [color, setColor] = useState(PRESET_COLORS[6]); 

  const [holidayDate, setHolidayDate] = useState(format(new Date(), 'yyyy-MM-dd')); 
  const [holidayName, setHolidayName] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setSetModalOpen(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSetModalOpen]);

  // 회의실 제출 (추가 or 수정)
  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoomId) {
      await fetch('/api/rooms', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingRoomId, name: roomName, capacity, color }) });
    } else {
      await fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: roomName, capacity, color }) });
    }
    cancelRoomEdit(); fetchRooms();
  };

  const startRoomEdit = (room: any) => {
    setEditingRoomId(room.id); setRoomName(room.name); setCapacity(room.capacity.toString()); setColor(room.color);
  };
  const cancelRoomEdit = () => {
    setEditingRoomId(null); setRoomName(''); setCapacity('4'); setColor(PRESET_COLORS[6]);
  };

  const handleDeleteRoom = async (id: string) => {
    if (confirm('회의실을 삭제하시겠습니까? 관련된 예약 정보도 함께 삭제됩니다.')) { await fetch(`/api/rooms?id=${id}`, { method: 'DELETE' }); fetchRooms(); }
  };

  // 공휴일 로직
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/custom-holidays', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: holidayDate, name: holidayName }) });
    setHolidayDate(format(new Date(), 'yyyy-MM-dd')); setHolidayName(''); fetchCustomHolidays();
  };
  const handleDeleteHoliday = async (id: string) => {
    if (confirm('공휴일을 삭제하시겠습니까?')) { await fetch(`/api/custom-holidays?id=${id}`, { method: 'DELETE' }); fetchCustomHolidays(); }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl w-[600px] shadow-[0_20px_60px_rgb(0,0,0,0.1)] flex flex-col max-h-[80vh] overflow-hidden border border-white">
        <div className="p-7 border-b border-gray-100 pb-0">
          <h2 className="text-2xl font-extrabold mb-6 text-gray-800">시스템 설정</h2>
          <div className="flex gap-4">
            <button onClick={() => {setActiveTab('rooms'); cancelRoomEdit();}} className={`pb-3 px-2 font-extrabold text-sm border-b-[3px] transition ${activeTab === 'rooms' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>회의실 관리</button>
            <button onClick={() => setActiveTab('holidays')} className={`pb-3 px-2 font-extrabold text-sm border-b-[3px] transition ${activeTab === 'holidays' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>공휴일 관리</button>
          </div>
        </div>

        <div className="p-7 overflow-y-auto bg-gray-50/50 flex-1 hide-scrollbar">
          {activeTab === 'rooms' ? (
            <div className="space-y-6">
              <form onSubmit={handleRoomSubmit} className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-extrabold text-gray-700">{editingRoomId ? '회의실 수정하기' : '새 회의실 추가'}</span>
                  {editingRoomId && <button type="button" onClick={cancelRoomEdit} className="text-xs text-gray-400 hover:text-gray-600 font-bold flex items-center gap-1"><X size={14}/> 취소</button>}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1"><input required value={roomName} onChange={(e) => setRoomName(e.target.value)} type="text" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="회의실명 (예: 10층 대회의실)" /></div>
                  <div className="w-24"><input required value={capacity} onChange={(e) => setCapacity(e.target.value)} type="number" min="1" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="인원" /></div>
                  <button type="submit" className={`px-5 rounded-xl text-sm font-extrabold text-white transition shadow-md ${editingRoomId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}>{editingRoomId ? '저장' : '추가'}</button>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-400 mb-2">테마 컬러 선택</label>
                  <div className="flex gap-2">
                    {PRESET_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setColor(c)} className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${color===c ? 'scale-125 shadow-md' : 'hover:scale-110'}`} style={{ backgroundColor: c }}>{color === c && <Check size={12} color="white" strokeWidth={3} />}</button>
                    ))}
                  </div>
                </div>
              </form>
              <div className="space-y-2">
                {rooms.map(room => (
                  <div key={room.id} className={`flex items-center justify-between bg-white p-3.5 border rounded-2xl transition ${editingRoomId === room.id ? 'border-blue-400 shadow-md' : 'border-gray-100 shadow-sm'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: room.color }}></div>
                      <span className="font-extrabold text-gray-800">{room.name}</span>
                      <span className="text-xs text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-md">{room.capacity}명</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startRoomEdit(room)} className="text-gray-400 hover:text-blue-600 p-1.5 transition"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteRoom(room.id)} className="text-gray-400 hover:text-red-500 p-1.5 transition"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <div className="space-y-6">
              <form onSubmit={handleAddHoliday} className="flex items-end gap-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-40">
                  <label className="block text-xs font-extrabold text-gray-500 mb-1.5">날짜</label>
                  <div className="relative">
                    <input required value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} type="date" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800">{format(new Date(holidayDate || new Date()), 'yyyy.MM.dd (E)', { locale: ko })}</div>
                  </div>
                </div>
                <div className="flex-1"><label className="block text-xs font-extrabold text-gray-500 mb-1.5">공휴일명</label><input required value={holidayName} onChange={(e) => setHolidayName(e.target.value)} type="text" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="예: 회사 창립기념일" /></div>
                <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-5 rounded-xl text-sm font-extrabold h-[42px] shadow-md transition">추가</button>
              </form>
              <div className="space-y-2">
                {customHolidays.map(holiday => (
                  <div key={holiday.id} className="flex items-center justify-between bg-white p-3.5 border border-gray-100 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3"><span className="text-[13px] font-extrabold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">{format(new Date(holiday.date), 'yyyy-MM-dd')}</span><span className="font-extrabold text-gray-800">{holiday.name}</span></div>
                    <button onClick={() => handleDeleteHoliday(holiday.id)} className="text-gray-400 hover:text-red-500 p-1.5 transition"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-gray-100 bg-white flex justify-end"><button onClick={() => setSetModalOpen(false)} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold rounded-xl transition">닫기</button></div>
      </div>
    </div>
  );
}
