import { useEffect, useState } from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { startOfWeek, addDays, format, isToday } from 'date-fns';
import { getHolidays } from '@hyunseob/korean-holidays';

export default function WeekView() {
  const { currentDate } = useCalendarStore();
  const [now, setNow] = useState(new Date());

  // 1분마다 현재 시각 업데이트 (빨간선 이동용)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 }); // 월요일 시작
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(startOfCurrentWeek, i));
  const times = Array.from({ length: 12 }).map((_, i) => i + 7); // 07:00 ~ 18:00

  const holidays = getHolidays(currentDate.getFullYear());
  const getHoliday = (date: Date) => holidays.find(h => h.date === format(date, 'yyyy-MM-dd'));

  // 현재 시각 빨간선 위치 계산 (1시간 = 60px)
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isWorkingHours = currentHour >= 7 && currentHour <= 18;
  const lineTop = (currentHour - 7) * 60 + currentMinute;

  return (
    <div className="flex flex-col h-full bg-white/50">
      {/* 주간 요일 헤더 */}
      <div className="flex border-b border-gray-200 bg-white/60 backdrop-blur-sm pr-2">
        <div className="w-20 border-r border-gray-200/50"></div> {/* Y축 여백 */}
        <div className="flex-1 grid grid-cols-5">
          {weekDays.map((day) => {
            const isDayToday = isToday(day);
            const holiday = getHoliday(day);
            const textColor = holiday ? 'text-red-500' : 'text-gray-700';

            return (
              <div key={day.toString()} className={`flex flex-col items-center justify-center py-3 border-r border-gray-200/50 ${isDayToday ? 'bg-yellow-50/80' : ''}`}>
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-bold ${holiday ? 'text-red-500' : 'text-gray-400'}`}>
                    {format(day, 'EEE').toUpperCase()}
                  </span>
                  {holiday && <span className="text-[10px] font-bold text-red-500 bg-red-100/80 px-1 rounded border border-red-200/50">{holiday.name}</span>}
                </div>
                <span className={`text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full mt-1 ${isDayToday ? 'bg-blue-600 text-white shadow-md' : textColor}`}>
                  {format(day, 'd')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 타임라인 바디 (이 부분만 스크롤 됨) */}
      <div className="flex-1 overflow-y-auto relative custom-scrollbar">
        <div className="flex min-h-max pb-10">
          
          {/* Y축 시간 표시 (넓이 w-20 부여하여 잘림 방지) */}
          <div className="w-20 border-r border-gray-200/50 flex flex-col bg-white/40">
            {times.map((hour) => (
              <div key={hour} className="h-[60px] relative">
                <span className="absolute -top-2.5 right-3 text-xs font-bold text-gray-400">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* 메인 그리드 셀 */}
          <div className="flex-1 grid grid-cols-5 relative">
            {/* 세로줄 & 오늘 날짜 노란 배경 */}
            {weekDays.map((day, i) => (
              <div key={i} className={`border-r border-gray-200/50 relative ${isToday(day) ? 'bg-yellow-50/80' : 'bg-white/20'}`}>
                {times.map((hour) => (
                  <div key={hour} className="h-[60px] border-t border-gray-200/50"></div>
                ))}
              </div>
            ))}

            {/* 현재 시각 빨간 가로선 & 텍스트 */}
            {isWorkingHours && (
              <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${lineTop}px` }}>
                {/* 텍스트 박스 */}
                <div className="absolute -left-[70px] -top-3 bg-red-50 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded shadow-sm border border-red-200">
                  {now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}
                </div>
                {/* 점선 및 동그라미 */}
                <div className="w-full border-t border-red-500 border-solid relative">
                  <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-500 shadow-sm border-2 border-white"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
