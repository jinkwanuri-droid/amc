import { useEffect, useState } from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { startOfWeek, addDays, format, isToday, isSameDay, differenceInMinutes } from 'date-fns';
import { getHolidays } from '@/lib/holidays';

export default function WeekView() {
  const { currentDate, reservations, customHolidays, openResModal, setSelectedReservation } = useCalendarStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer); }, []);

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(startOfCurrentWeek, i));
  const times = Array.from({ length: 12 }).map((_, i) => i + 7);

  const allHolidays = [...getHolidays(currentDate.getFullYear()), ...customHolidays.map(h => ({ date: format(new Date(h.date), 'yyyy-MM-dd'), name: h.name }))];
  const getHoliday = (date: Date) => allHolidays.find(h => h.date === format(date, 'yyyy-MM-dd'));

  const currentHour = now.getHours(); const currentMinute = now.getMinutes();
  const isWorkingHours = currentHour >= 7 && currentHour <= 18;
  const lineTop = (currentHour - 7) * 60 + currentMinute;

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* 높이 h-[70px] 로 축소 */}
      <div className="flex border-b border-gray-200/50 h-[70px] pr-2">
        <div className="w-20"></div>
        <div className="flex-1 grid grid-cols-5">
          {weekDays.map((day) => {
            const isDayToday = isToday(day); const holiday = getHoliday(day);
            return (
              <div key={day.toString()} className={`flex flex-col items-center justify-center ${isDayToday ? 'bg-blue-50/40 rounded-t-xl' : ''}`}>
                <div className="flex items-center gap-1">
                  {/* 요일 1pt 축소 (text-[10px]) */}
                  <span className={`text-[10px] font-extrabold ${holiday ? 'text-red-500' : 'text-gray-400'}`}>{format(day, 'EEE').toUpperCase()}</span>
                  {holiday && <span className="text-[9px] font-bold text-red-500 bg-red-100/80 px-1 rounded border border-red-200/50">{holiday.name}</span>}
                </div>
                {/* 날짜 2pt 축소 (text-lg) */}
                <span className={`text-lg font-extrabold w-14 h-7 mt-0.5 flex items-center justify-center rounded-full ${isDayToday ? 'bg-blue-600 text-white shadow-md' : (holiday ? 'text-red-500' : 'text-gray-700')}`}>{format(day, 'M/d')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 내부 배경 및 여백 설정 */}
      <div className="flex-1 overflow-y-auto relative hide-scrollbar bg-white/30 backdrop-blur-md rounded-xl border border-white/50 shadow-inner mt-2">
        {/* 상단 07:00 텍스트 잘림 방지 + 여백 10px 추가 (mt-[22px]) */}
        <div className="flex min-h-max pb-10 mt-[22px]">
          <div className="w-20 border-r border-gray-200/50 flex flex-col">
            {times.map((hour) => (<div key={hour} className="h-[60px] relative"><span className="absolute -top-2.5 right-3 text-[11px] font-bold text-gray-400">{hour.toString().padStart(2, '0')}:00</span></div>))}
          </div>
          <div className="flex-1 grid grid-cols-5 relative">
            {weekDays.map((day, i) => {
              const dayReservations = reservations.filter(res => isSameDay(new Date(res.startTime), day));
              return (
                <div key={i} className={`border-r border-gray-200/50 relative ${isToday(day) ? 'bg-blue-50/20' : ''}`}>
                  {times.map((hour) => (
                    <div key={hour} className="h-[60px] relative">
                      <div onClick={() => openResModal(day, `${hour.toString().padStart(2, '0')}:00`)} className="absolute top-0 w-full h-[30px] border-t border-gray-200/50 cursor-pointer hover:bg-white/50 transition"></div>
                      <div onClick={() => openResModal(day, `${hour.toString().padStart(2, '0')}:30`)} className="absolute top-[30px] w-full h-[30px] border-t border-dashed border-gray-200/50 cursor-pointer hover:bg-white/50 transition"></div>
                    </div>
                  ))}
                  {dayReservations.map((res) => {
                    const start = new Date(res.startTime); const end = new Date(res.endTime);
                    const topPos = (start.getHours() - 7) * 60 + start.getMinutes(); const heightPos = differenceInMinutes(end, start);
                    const rColor = res.room?.color || '#3b82f6';
                    return (
                      // ⭐ 클릭 시 상세 모달창 & 텍스트 포맷 변경 ("예약시각(10층)" / "회의내용" 볼드)
                      <div key={res.id} onClick={(e) => { e.stopPropagation(); setSelectedReservation(res); }} 
                           className="absolute left-1 right-1 border-l-[3px] rounded-r-lg shadow-sm p-2 overflow-hidden z-10 cursor-pointer transition transform hover:-translate-y-px hover:shadow-md border-y border-r border-white/60 bg-white/80 backdrop-blur-sm" 
                           style={{ top: `${topPos}px`, height: `${heightPos}px`, borderLeftColor: rColor }}>
                        <div className="text-[10px] font-bold text-gray-500 leading-tight mb-0.5">
                          {format(start, 'HH:mm')} - {format(end, 'HH:mm')} <span style={{color: rColor}}>({res.room?.name})</span>
                        </div>
                        <div className="text-xs font-extrabold text-gray-800 truncate">{res.description}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {isWorkingHours && (
              <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${lineTop}px` }}>
                <div className="absolute -left-[64px] -top-2.5 bg-red-50 text-red-600 text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm border border-red-200">{now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}</div>
                <div className="w-full border-t border-red-500 border-solid relative"><div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500 shadow-sm"></div></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
