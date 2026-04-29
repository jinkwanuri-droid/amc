import { useEffect, useState } from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { startOfWeek, addDays, format, isToday, isSameDay, differenceInMinutes } from 'date-fns';
import { getHolidays } from '@/lib/holidays';

export default function WeekView() {
  const { currentDate, reservations, customHolidays } = useCalendarStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(startOfCurrentWeek, i));
  const times = Array.from({ length: 12 }).map((_, i) => i + 7);

  // 기본 공휴일 + DB 공휴일 합치기
  const baseHolidays = getHolidays(currentDate.getFullYear());
  const allHolidays = [...baseHolidays, ...customHolidays.map(h => ({ date: format(new Date(h.date), 'yyyy-MM-dd'), name: h.name }))];
  const getHoliday = (date: Date) => allHolidays.find(h => h.date === format(date, 'yyyy-MM-dd'));

  const currentHour = now.getHours(); const currentMinute = now.getMinutes();
  const isWorkingHours = currentHour >= 7 && currentHour <= 18;
  const lineTop = (currentHour - 7) * 60 + currentMinute;

  return (
    <div className="flex flex-col h-full bg-white/50">
      <div className="flex border-b border-gray-200 bg-white/60 backdrop-blur-sm pr-2">
        <div className="w-20 border-r border-gray-200/50"></div>
        <div className="flex-1 grid grid-cols-5">
          {weekDays.map((day) => {
            const isDayToday = isToday(day); const holiday = getHoliday(day);
            return (
              <div key={day.toString()} className={`flex flex-col items-center justify-center py-3 border-r border-gray-200/50 ${isDayToday ? 'bg-yellow-50/80' : ''}`}>
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-bold ${holiday ? 'text-red-500' : 'text-gray-400'}`}>{format(day, 'EEE').toUpperCase()}</span>
                  {holiday && <span className="text-[10px] font-bold text-red-500 bg-red-100/80 px-1 rounded border border-red-200/50">{holiday.name}</span>}
                </div>
                <span className={`text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full mt-1 ${isDayToday ? 'bg-blue-600 text-white shadow-md' : (holiday ? 'text-red-500' : 'text-gray-700')}`}>{format(day, 'd')}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative custom-scrollbar">
        <div className="flex min-h-max pb-10">
          <div className="w-20 border-r border-gray-200/50 flex flex-col bg-white/40">
            {times.map((hour) => (<div key={hour} className="h-[60px] relative"><span className="absolute -top-2.5 right-3 text-xs font-bold text-gray-400">{hour.toString().padStart(2, '0')}:00</span></div>))}
          </div>
          <div className="flex-1 grid grid-cols-5 relative">
            {weekDays.map((day, i) => {
              const dayReservations = reservations.filter(res => isSameDay(new Date(res.startTime), day));
              return (
                <div key={i} className={`border-r border-gray-200/50 relative ${isToday(day) ? 'bg-yellow-50/80' : 'bg-white/20'}`}>
                  {times.map((hour) => (<div key={hour} className="h-[60px] border-t border-gray-200/50"></div>))}
                  {dayReservations.map((res) => {
                    const start = new Date(res.startTime); const end = new Date(res.endTime);
                    const topPos = (start.getHours() - 7) * 60 + start.getMinutes();
                    const heightPos = differenceInMinutes(end, start);
                    return (
                      <div key={res.id} className="absolute left-1 right-1 bg-blue-100 border-l-4 border-l-blue-500 border border-blue-200/80 rounded shadow-sm p-1.5 overflow-hidden z-10 hover:bg-blue-200 transition cursor-pointer" style={{ top: `${topPos}px`, height: `${heightPos}px` }}>
                        <div className="text-[11px] font-bold text-blue-800 leading-tight">{format(start, 'HH:mm')} - {format(end, 'HH:mm')}</div>
                        <div className="text-xs font-bold text-gray-900 mt-0.5">{res.reserver}</div>
                        <div className="text-[10px] text-gray-600 truncate mt-0.5">{res.description}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {isWorkingHours && (
              <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${lineTop}px` }}>
                <div className="absolute -left-[70px] -top-3 bg-red-50 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded shadow-sm border border-red-200">{now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}</div>
                <div className="w-full border-t border-red-500 border-solid relative"><div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-500 shadow-sm border-2 border-white"></div></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
