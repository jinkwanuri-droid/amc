import { useCalendarStore } from '@/store/useCalendarStore';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday } from 'date-fns';
import { getHolidays } from '@hyunseob/korean-holidays'; // 공휴일 라이브러리

export default function MonthView() {
  const { currentDate } = useCalendarStore();
  
  const monthStart = startOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(endOfMonth(monthStart));
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 현재 연도의 공휴일 데이터 가져오기
  const holidays = getHolidays(currentDate.getFullYear());
  const getHoliday = (date: Date) => holidays.find(h => h.date === format(date, 'yyyy-MM-dd'));

  return (
    <div className="flex flex-col h-full bg-white/50">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white/60 backdrop-blur-sm">
        {weekDays.map((day, i) => (
          <div key={day} className={`text-center py-3 text-sm font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 (화면에 꽉 차게 flex-1 적용) */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);
          const holiday = getHoliday(day);
          
          const isSunday = day.getDay() === 0;
          const isSaturday = day.getDay() === 6;
          // 일요일이거나 공휴일이면 빨간색, 토요일이면 파란색
          const textColor = holiday || isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-700';

          return (
            <div key={day.toString()} className={`border-r border-b border-gray-200/50 p-2 flex flex-col 
              ${isDayToday ? 'bg-yellow-50/80' : 'bg-white/40'} 
              ${!isCurrentMonth ? 'opacity-40' : ''}`}>
              
              {/* 날짜 숫자 & 공휴일 이름 */}
              <div className="flex justify-between items-start">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isDayToday ? 'bg-blue-600 text-white' : textColor}`}>
                  {format(day, 'd')}
                </span>
                {holiday && (
                  <span className="text-[10px] font-bold text-red-500 bg-red-100/80 px-1.5 py-0.5 rounded-md border border-red-200/50">
                    {holiday.name}
                  </span>
                )}
              </div>

              {/* 예약 블록이 들어갈 빈 공간 */}
              <div className="flex-1 mt-1 overflow-y-auto space-y-1"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
