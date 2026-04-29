import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfWeek, addDays, parseISO, isSameDay, isSameMonth, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Settings, Users, Calendar as CalendarIcon, Trash2, X, Save, Palette, Type } from 'lucide-react';
import { Reservation, Room, CustomHoliday, ViewType, cn, TIME_SLOTS, createReservation, updateReservation, deleteReservation, createRoom, deleteRoom } from './shared';

// --- Types for Components ---
interface HolidayInfo {
  date: string;
  name: string;
  isOfficial: boolean;
}

// --- CalendarHeader ---
interface HeaderProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  view: ViewType;
  setView: (view: ViewType) => void;
  onNewReservation: () => void;
  onOpenSettings: () => void;
}

export function CalendarHeader({ currentDate, setCurrentDate, view, setView, onNewReservation, onOpenSettings }: HeaderProps) {
  const handlePrev = () => setCurrentDate(view === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1));
  const handleNext = () => setCurrentDate(view === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1));
  const handleToday = () => {
    setCurrentDate(new Date());
    window.dispatchEvent(new CustomEvent('scroll-to-now'));
  };

  return (
    <nav className="flex flex-col md:flex-row md:items-center justify-between p-4 px-4 md:px-8 md:py-5 gap-4 ios-glass sticky top-0 z-[40] border-b border-gray-200">
      <div className="flex items-center justify-between md:justify-start gap-4 md:gap-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none mb-1">AMC 회의실 예약</h1>
          <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-widest leading-none">AMC Meeting Room</p>
        </div>
        
        <div className="flex bg-gray-200/50 p-1 rounded-xl shadow-inner scale-90 md:scale-100 origin-left md:origin-center">
          <button onClick={() => setView('week')} className={cn("px-4 md:px-5 py-1.5 text-[12px] md:text-sm font-semibold rounded-lg transition-all", view === 'week' ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700")}>주간</button>
          <button onClick={() => setView('month')} className={cn("px-4 md:px-5 py-1.5 text-[12px] md:text-sm font-semibold rounded-lg transition-all", view === 'month' ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700")}>월간</button>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 md:gap-2 bg-gray-100 rounded-2xl p-1 shrink-0">
          <button onClick={handlePrev} className="p-2 hover:bg-white rounded-xl transition-all"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
          <button onClick={handleToday} className="px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-white rounded-xl transition-all">오늘</button>
          <button onClick={handleNext} className="p-2 hover:bg-white rounded-xl transition-all"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
        </div>
        
        <div className="h-6 w-[1px] bg-gray-200 mr-2 hidden md:block shrink-0"></div>
        
        <div className="flex-1 md:flex-none flex items-center md:mr-[20px] shrink-0">
          <h2 className="text-lg font-bold text-gray-900 whitespace-nowrap">{format(currentDate, 'yyyy년 M월')}</h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onNewReservation} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-5 md:px-6 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap">
            <Plus className="w-5 h-5" /> <span className="inline">예약하기</span>
          </button>
          <button onClick={onOpenSettings} className="w-11 h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all active:scale-90 shrink-0"><Settings className="w-5 h-5" /></button>
        </div>
      </div>
    </nav>
  );
}

// --- RoomLegend ---
interface LegendProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelectRoom: (id: string | null) => void;
}

export function RoomLegend({ rooms, selectedRoomId, onSelectRoom }: LegendProps) {
  if (rooms.length === 0) {
    return (
      <div className="flex justify-center p-4">
        <p className="text-xs font-bold text-gray-400 bg-gray-100/50 px-6 py-3 rounded-2xl border border-dashed border-gray-200 uppercase tracking-widest">
          회의실을 먼저 등록해주세요 (우측 상단 설정)
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-end px-4 md:px-0">
      <button 
        onClick={() => onSelectRoom(null)} 
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-2xl transition-all border shadow-sm", 
          !selectedRoomId 
            ? "bg-gray-900 border-gray-900 text-white shadow-lg" 
            : "bg-white border-gray-200 hover:bg-gray-50 text-gray-500"
        )}
      >
        <div className={cn("w-2 h-2 rounded-full", !selectedRoomId ? "bg-white animate-pulse" : "bg-gray-300")}></div>
        <span className="text-xs font-bold uppercase tracking-tight">전체보기</span>
      </button>
      {rooms.map(room => {
        const isIndividualActive = selectedRoomId === room.id;
        const isAllActive = selectedRoomId === null;
        const isActive = isIndividualActive || isAllActive;
        
        // Map color to bg class
        const colorMap: {[key: string]: string} = {
          blue: 'bg-blue-500', indigo: 'bg-indigo-500', violet: 'bg-violet-500', 
          purple: 'bg-purple-500', fuchsia: 'bg-fuchsia-500', rose: 'bg-rose-500', 
          pink: 'bg-pink-500', orange: 'bg-orange-500', amber: 'bg-amber-500', 
          emerald: 'bg-emerald-500', teal: 'bg-teal-500', cyan: 'bg-cyan-500'
        };
        const colorBg = colorMap[room.color] || 'bg-blue-500';

        return (
          <button 
            key={room.id} 
            onClick={() => onSelectRoom(room.id === selectedRoomId ? null : room.id)} 
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl transition-all border shadow-sm", 
              isActive 
                ? `${colorBg} border-transparent text-white ${isIndividualActive ? 'shadow-lg scale-105 z-10' : 'opacity-90'}` 
                : "bg-white border-gray-200 hover:bg-gray-50 text-gray-400 opacity-60"
            )}
            style={isIndividualActive ? { boxShadow: `0 8px 20px -4px rgba(0,0,0,0.2)` } : {}}
          >
            <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", isActive ? "bg-white" : colorBg)}></div>
            <span className="text-xs font-bold">{room.name}</span>
            <span className={cn("text-[10px] font-medium flex items-center gap-0.5", isActive ? "text-white/80" : "text-gray-400")}>
              <Users className="w-3 h-3" /> {room.capacity}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// --- WeekView ---
interface WeekProps {
  currentDate: Date;
  reservations: Reservation[];
  selectedRoomId: string | null;
  rooms: Room[];
  holidays: HolidayInfo[];
  onSlotClick: (date: Date, time: string) => void;
  onReservationClick?: (res: Reservation) => void;
}

export function WeekView({ currentDate, reservations, selectedRoomId, rooms, holidays, onSlotClick, onReservationClick }: WeekProps) {
  const [now, setNow] = useState(new Date());
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const scrollToCurrentTime = React.useCallback(() => {
    if (scrollContainerRef.current) {
      const top = ((now.getHours() - 7) * 2 + (now.getMinutes() / 30)) * 56;
      scrollContainerRef.current.scrollTo({
        top: top - 150,
        behavior: 'smooth'
      });
    }
  }, [now]);

  useEffect(() => {
    // Initial scroll
    const timer = setTimeout(scrollToCurrentTime, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScrollEvent = () => scrollToCurrentTime();
    window.addEventListener('scroll-to-now', handleScrollEvent);
    return () => window.removeEventListener('scroll-to-now', handleScrollEvent);
  }, [scrollToCurrentTime]);

  const startOfWk = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(startOfWk, i));

  const timeSlots: string[] = [];
  for (let i = 7; i <= 20; i++) {
    timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
    if (i < 20) timeSlots.push(`${i.toString().padStart(2, '0')}:30`);
  }

  const getStyle = (start: string, end: string) => {
    const s = parseISO(start);
    const e = parseISO(end);
    const startIdx = (s.getHours() - 7) * 2 + (s.getMinutes() >= 30 ? 1 : 0);
    const endIdx = (e.getHours() - 7) * 2 + (e.getMinutes() >= 30 ? 1 : 0);
    return { top: startIdx * 56, height: Math.max(1, (endIdx - startIdx)) * 56 };
  };

  return (
    <div className="ios-card ios-shadow flex flex-col h-[650px] md:h-[750px] overflow-hidden border-none bg-white">
      <div className="flex border-b border-gray-100 bg-gray-50/80 sticky top-0 z-40 backdrop-blur-sm h-20 shrink-0">
        <div className="w-[64px] shrink-0 border-r border-gray-100 flex items-center justify-center">
          <CalendarIcon className="w-4 h-4 text-gray-300" />
        </div>
        {weekDays.map(day => {
          const dayHoliday = holidays.find(h => h.date === format(day, 'yyyy-MM-dd'));
          const isToday = isSameDay(day, now);
          return (
            <div key={day.toISOString()} className={cn("flex-1 flex flex-col items-center justify-center p-2 border-r border-gray-100 last:border-r-0", isToday ? "bg-blue-50/30" : dayHoliday ? "bg-red-50/30" : "")}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={cn("text-[14px] font-medium uppercase", dayHoliday ? "text-red-400" : isToday ? "text-blue-500" : "text-gray-400")}>{format(day, 'EEE')}</span>
                {dayHoliday && <span className="text-[10px] text-red-500 font-medium whitespace-nowrap">{dayHoliday.name}</span>}
              </div>
              <div className={cn("w-9 h-9 flex items-center justify-center rounded-full transition-all", isToday ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "")}>
                <span className="text-lg font-bold leading-none">{format(day, 'd')}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar relative bg-white">
        <div className="flex min-h-full">
          <div className="w-[64px] shrink-0 border-r border-gray-100/50 bg-white relative">
            {timeSlots.map(t => (
              <div key={t} className="h-14 border-b border-gray-100/30 relative">
                {t.endsWith(':00') && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-400 px-1 z-10 rounded">
                    {t}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex-1 flex relative">
            {isSameDay(currentDate, now) && (
              <div className="absolute left-0 right-0 z-30 pointer-events-none flex items-center" style={{ top: ((now.getHours() - 7) * 2 + (now.getMinutes() / 30)) * 56 }}>
                <div className="flex items-center absolute -left-[64px] px-1 bg-white/90 backdrop-blur-sm rounded z-40 border border-red-100 shadow-sm">
                  <span className="text-[11px] font-bold text-red-500 whitespace-nowrap">{format(now, 'HH:mm')}</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.25 shadow-[0_0_8px_rgba(239,68,68,0.5)] z-40"></div>
                <div className="flex-1 h-[1.5px] bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.3)]"></div>
              </div>
            )}
            {weekDays.map(day => (
              <div key={day.toISOString()} className={cn("flex-1 border-r border-gray-50 last:border-r-0 relative", isSameDay(day, now) ? "bg-blue-50/10" : "")}>
                {timeSlots.map(t => (
                  <div 
                    key={t} 
                    onClick={() => onSlotClick(day, t)} 
                    className={cn(
                      "h-14 border-b cursor-pointer transition-colors hover:bg-gray-100/30",
                      t.endsWith(':30') ? "border-dashed border-gray-200/40" : "border-gray-50"
                    )} 
                  />
                ))}
                {reservations.filter(r => isSameDay(parseISO(r.start_time), day)).map(res => {
                  const style = getStyle(res.start_time, res.end_time);
                  const room = rooms.find(r => r.id === res.room_id) || (rooms[0] || null);
                  if (!room) return null;
                  const left = selectedRoomId ? 2 : (rooms.findIndex(r => r.id === room.id) / rooms.length) * 96 + 2;
                  const width = selectedRoomId ? 96 : (96 / rooms.length) - 1;
                  
                  // Safe color mapping
                  const colorMap: {[key: string]: string} = {
                    blue: 'bg-blue-500', indigo: 'bg-indigo-500', violet: 'bg-violet-500', 
                    purple: 'bg-purple-500', fuchsia: 'bg-fuchsia-500', rose: 'bg-rose-500', 
                    pink: 'bg-pink-500', orange: 'bg-orange-500', amber: 'bg-amber-500', 
                    emerald: 'bg-emerald-500', teal: 'bg-teal-500', cyan: 'bg-cyan-500'
                  };
                  const colorClass = colorMap[room.color] || 'bg-blue-500';

                  return (
                    <div key={res.id} onClick={(e) => { e.stopPropagation(); onReservationClick?.(res); }} className={cn("absolute rounded-xl p-2.5 shadow-sm border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md z-10 overflow-hidden group border-white/50 backdrop-blur-[2px]")} style={{ ...style, left: `${left}%`, width: `${width}%`, backgroundColor: `rgba(0,0,0,0.03)` }}>
                      <div className={cn("absolute top-0 left-0 w-1 bottom-0", colorClass)} />
                      <div className={cn("absolute inset-0 opacity-10", colorClass)} />
                      <p className={cn("text-[11px] font-bold truncate mb-0.5 text-gray-800")}>{res.reserver}</p>
                      <p className="text-[10px] font-bold text-gray-400 truncate">{room.name}</p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MonthView ---
interface MonthProps {
  currentDate: Date;
  reservations: Reservation[];
  rooms: Room[];
  holidays: HolidayInfo[];
  onSlotClick: (date: Date, time: string) => void;
  onReservationClick?: (res: Reservation) => void;
}

export function MonthView({ currentDate, reservations, rooms, holidays, onSlotClick, onReservationClick }: MonthProps) {
  const start = startOfMonth(currentDate);
  const end = endOfMonth(start);
  const startWk = startOfWeek(start, { weekStartsOn: 0 });
  const endWk = endOfWeek(end, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startWk, end: endWk });

  return (
    <div className="ios-card ios-shadow overflow-hidden flex flex-col h-[650px] md:h-[750px] border-none">
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div key={d} className={cn("p-4 text-center text-[15px] font-medium tracking-widest", i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400")}>{d}</div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 overflow-y-auto no-scrollbar bg-gray-50/5">
        {days.map(day => {
          const resDay = reservations.filter(r => isSameDay(parseISO(r.start_time), day));
          const holiday = holidays.find(h => h.date === format(day, 'yyyy-MM-dd'));
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, start);
          return (
            <div key={day.toISOString()} onClick={() => onSlotClick(day, '09:00')} className={cn("border-r border-b border-gray-50 p-2 min-h-[110px] md:min-h-[130px] cursor-pointer flex flex-col transition-colors hover:bg-white", !isCurrentMonth && "opacity-30", isToday && "bg-blue-50/20", holiday && "bg-red-50/30")}>
              <div className="flex items-center justify-between mb-2">
                <span className={cn("w-7 h-7 flex items-center justify-center text-[13px] font-bold rounded-full transition-all", isToday ? "bg-blue-500 text-white shadow-md shadow-blue-500/30" : holiday ? "text-red-500" : day.getDay() === 0 ? "text-red-300" : day.getDay() === 6 ? "text-blue-300" : "text-gray-700")}>{format(day, 'd')}</span>
                {holiday && <span className="text-[9px] text-red-500 font-bold truncate max-w-[50px]">{holiday.name}</span>}
              </div>
              <div className="flex-1 space-y-1 overflow-hidden">
                {resDay.slice(0, 4).map(r => {
                  const room = rooms.find(rm => rm.id === r.room_id) || (rooms[0] || null);
                  const colorMap: {[key: string]: string} = {
                    blue: 'bg-blue-500', indigo: 'bg-indigo-500', violet: 'bg-violet-500', 
                    purple: 'bg-purple-500', fuchsia: 'bg-fuchsia-500', rose: 'bg-rose-500', 
                    pink: 'bg-pink-500', orange: 'bg-orange-500', amber: 'bg-amber-500', 
                    emerald: 'bg-emerald-500', teal: 'bg-teal-500', cyan: 'bg-cyan-500'
                  };
                  const colorClass = room ? (colorMap[room.color] || 'bg-blue-500') : 'bg-gray-400';
                  return room && (
                    <div key={r.id} onClick={(e) => { e.stopPropagation(); onReservationClick?.(r); }} className={cn("text-[10px] px-2 py-1 rounded-lg truncate text-white font-bold shadow-sm transition-transform hover:scale-[1.02]", colorClass)}>
                      {format(parseISO(r.start_time), 'HH:mm')} {r.reserver}
                    </div>
                  );
                })}
                {resDay.length > 4 && <div className="text-[10px] text-gray-300 font-bold text-center pt-1 italic">+{resDay.length - 4} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- ReservationModal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: Date;
  defaultTime: string;
  editingReservation?: Reservation | null;
  rooms: Room[];
  onSuccess: () => void;
}

export function ReservationModal({ isOpen, onClose, defaultDate, defaultTime, editingReservation, rooms, onSuccess }: ModalProps) {
  const [roomId, setRoomId] = useState('');
  const [reserver, setReserver] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(defaultDate, 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(defaultTime);
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      if (editingReservation) {
        setRoomId(editingReservation.room_id);
        setReserver(editingReservation.reserver);
        setDescription(editingReservation.description);
        setDate(format(parseISO(editingReservation.start_time), 'yyyy-MM-dd'));
        setStartTime(format(parseISO(editingReservation.start_time), 'HH:mm'));
        setEndTime(format(parseISO(editingReservation.end_time), 'HH:mm'));
      } else {
        setRoomId(rooms[0]?.id || '');
        setReserver('');
        setDescription('');
        setDate(format(defaultDate, 'yyyy-MM-dd'));
        setStartTime(defaultTime);
        const endDt = new Date(`2000-01-01T${defaultTime}`);
        endDt.setMinutes(endDt.getMinutes() + 60);
        setEndTime(format(endDt, 'HH:mm'));
      }
    }
  }, [isOpen, editingReservation, rooms, defaultDate, defaultTime]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = { room_id: roomId, reserver, description, start_time: `${date}T${startTime}:00`, end_time: `${date}T${endTime || startTime}:00` };
      if (editingReservation) await updateReservation(editingReservation.id, data);
      else await createReservation(data);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingReservation || !window.confirm('예약을 취소하시겠습니까?')) return;
    try {
      await deleteReservation(editingReservation.id);
      onSuccess();
      onClose();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-md" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-8 md:p-10 space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">{editingReservation ? '예약 상세 및 수정' : '회의실 신규 예약'}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"><X /></button>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-500 text-sm font-bold rounded-2xl border border-red-100">{error}</div>}
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">회의실 선택</label>
            <select value={roomId} onChange={e => setRoomId(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer">
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (수용인원: {r.capacity}명)</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">예약자</label>
              <input placeholder="성함을 입력하세요" value={reserver} onChange={e => setReserver(e.target.value)} required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/10 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">회의 날짜</label>
              <div className="relative group">
                <div className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold flex items-center gap-3 transition-colors group-hover:border-gray-200">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{format(parseISO(date), 'yyyy.MM.dd (EEE)', { locale: ko })}</span>
                </div>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">회의 내용</label>
            <input placeholder="무엇을 위한 회의인가요?" value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/10 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">시작 시간</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/10 outline-none px-3" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">종료 시간</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/10 outline-none px-3" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          {editingReservation && (
            <button type="button" onClick={handleDelete} className="flex items-center justify-center w-14 h-14 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl transition-all active:scale-90 shadow-sm">
              <Trash2 className="w-6 h-6" />
            </button>
          )}
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all text-lg tracking-wide">
            {loading ? '처리 중...' : editingReservation ? '수정사항 저장' : '예약하기'}
          </button>
        </div>
      </form>
    </div>
  );
}

// --- SettingsModal ---
interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  holidays: CustomHoliday[];
  onUpdateRooms: () => void;
  onUpdateHolidays: () => void;
}

export function SettingsModal({ isOpen, onClose, rooms, holidays, onUpdateRooms, onUpdateHolidays }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'rooms' | 'holidays'>('rooms');
  
  // Room Form
  const [rName, setRName] = useState('');
  const [rCap, setRCap] = useState(4);
  const [rColor, setRColor] = useState('blue');

  // Holiday Form
  const [hDate, setHDate] = useState('');
  const [hName, setHName] = useState('');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRoom({
      name: rName,
      capacity: rCap,
      color: rColor,
      header_bg: `bg-${rColor}-500`,
      accent_bg: `bg-${rColor}-50/50`,
      border_color: `border-${rColor}-200`,
      text_color: `text-${rColor}-700`,
      order: rooms.length + 1
    });
    setRName(''); setRCap(4);
    onUpdateRooms();
  };

  const handleDelRoom = async (id: string) => {
    if (!window.confirm('회의실을 삭제하시겠습니까? 관련 예약도 모두 보이지 않게 될 수 있습니다.')) return;
    await deleteRoom(id);
    onUpdateRooms();
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hDate || !hName) return;
    await fetch('/api/holidays', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: hDate, name: hName }) });
    setHDate(''); setHName('');
    onUpdateHolidays();
  };

  const handleDelHoliday = async (id: string) => {
    await fetch(`/api/holidays/${id}`, { method: 'DELETE' });
    onUpdateHolidays();
  };

  const colorData: {[key: string]: string} = {
    blue: '#3b82f6', indigo: '#6366f1', violet: '#8b5cf6', purple: '#a855f7', 
    fuchsia: '#d946ef', rose: '#f43f5e', pink: '#ec4899', orange: '#f97316', 
    amber: '#f59e0b', emerald: '#10b981', teal: '#14b8a6', cyan: '#06b6d4'
  };
  const colorKeys = Object.keys(colorData);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.25)] flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">설정 및 시스템 관리</h2>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">System Administration & Settings</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white hover:bg-gray-100 rounded-2xl shadow-sm transition-colors border border-gray-100"><X /></button>
        </div>
        
        <div className="flex p-3 gap-2 border-b bg-white">
          <button onClick={() => setActiveTab('rooms')} className={cn("flex-1 py-3 font-bold rounded-2xl transition-all flex items-center justify-center gap-2", activeTab === 'rooms' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50")}>
            <Users className="w-4 h-4" /> <span>회의실 관리</span>
          </button>
          <button onClick={() => setActiveTab('holidays')} className={cn("flex-1 py-3 font-bold rounded-2xl transition-all flex items-center justify-center gap-2", activeTab === 'holidays' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50")}>
            <CalendarIcon className="w-4 h-4" /> <span>공휴일 관리</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-gray-50/20">
          {activeTab === 'rooms' ? (
            <div className="space-y-6">
              <form onSubmit={handleAddRoom} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">새 회의실 등록</p>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                   <input placeholder="이름 (예: 대회의실)" value={rName} onChange={e => setRName(e.target.value)} required className="p-3 bg-gray-50 rounded-xl font-bold border border-gray-100 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                   <input type="number" min="1" placeholder="인원" value={rCap} onChange={e => setRCap(parseInt(e.target.value))} required className="p-3 bg-gray-50 rounded-xl font-bold border border-gray-100 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                   
                   <div className="relative group">
                     <select 
                       value={rColor} 
                       onChange={e => setRColor(e.target.value)} 
                       className="w-full p-3 bg-gray-50 rounded-xl font-bold border border-gray-100 text-sm appearance-none outline-none cursor-pointer pr-10"
                     >
                       {colorKeys.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                     </select>
                     <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                       <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: colorData[rColor] }} />
                     </div>
                   </div>

                   <button type="submit" className="bg-gray-900 hover:bg-black text-white rounded-xl flex items-center justify-center gap-2 font-bold shadow-md transition-all active:scale-95 text-sm py-3 md:py-0">
                     <Plus className="w-4 h-4" /> <span>추가</span>
                   </button>
                 </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rooms.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-xl shadow-inner flex items-center justify-center transition-transform group-hover:scale-105", r.header_bg)}>
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-800">{r.name}</span>
                        <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">{r.capacity} PEOPLE</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelRoom(r.id)} className="w-8 h-8 rounded-lg text-gray-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleAddHoliday} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">공휴일 추가</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="date" value={hDate} onChange={e => setHDate(e.target.value)} required className="p-3 bg-gray-50 rounded-xl font-bold border-none text-sm" />
                  <div className="flex gap-2">
                    <input placeholder="휴일 명칭" value={hName} onChange={e => setHName(e.target.value)} required className="flex-1 p-3 bg-gray-50 rounded-xl font-bold border-none text-sm" />
                    <button type="submit" className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center shrink-0"><Plus /></button>
                  </div>
                </div>
              </form>

              <div className="space-y-2">
                {holidays.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-4 h-4 text-gray-300" />
                      <span className="font-bold text-sm text-gray-700">{h.date} - {h.name}</span>
                    </div>
                    <button onClick={() => handleDelHoliday(h.id)} className="w-8 h-8 rounded-lg text-red-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
