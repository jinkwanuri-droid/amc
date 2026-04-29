import { useCalendarStore } from '@/store/useCalendarStore';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday, isSameDay } from 'date-fns';
import { getHolidays } from '@/lib/holidays';

export default function MonthView() {
  const { currentDate, reservations, customHolidays, openResModal } = useCalendarStore();
  const monthStart = startOfMonth(currentDate); const startDate = startOfWeek(monthStart); const endDate = endOfWeek(endOfMonth(monthStart));
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const baseHolidays = getHolidays(currentDate.getFullYear());
  const allHolidays = [...baseHolidays, ...customHolidays.map(h => ({ date: format(new Date(h.date), 'yyyy-MM-dd'), name: h.name }))];
  const getHoliday = (date: Date) => allHolidays.find(h => h.date === format(date, 'yyyy-MM-dd'));

  return (
    <div className="flex flex-col h-full bg-white/50">
      {/* 헤더 높이 h-[80px] 로 고정 */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white/60 backdrop-blur-sm h-[80px] items-center">
        {weekDays.map((day, i) => (<div key={day} className={`text-center text-sm font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>{day}</div>))}
      </div>

      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart); const isDayToday = isToday(day); const holiday = getHoliday(day);
          const isSunday = day.getDay() === 0; const isSaturday = day.getDay() === 6;
          const textColor = holiday || isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-700';
          const dayReservations = reservations.filter(res => isSameDay(new Date(res.startTime), day));

          return (
            // 빈칸 클릭 시 예약 모달 열기
            <div key={day.toString()} onClick={() => openResModal(day)} className={`border-r border-b border-gray-200/50 p-2 flex flex-col cursor-pointer hover:bg-blue-50/50 transition ${isDayToday ? 'bg-yellow-50/80' : 'bg-white/40'} ${!isCurrentMonth ? 'opacity-40' : ''}`}>
              <div className="flex justify-between items-start mb-1">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isDayToday ? 'bg-blue-600 text-white' : textColor}`}>{format(day, 'd')}</span>
                {holiday && <span className="text-[10px] font-bold text-red-500 bg-red-100/80 px-1.5 py-0.5 rounded-md border border-red-200/50 truncate max-w-[80px]">{holiday.name}</span>}
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 hide-scrollbar pr-1">
                {dayReservations.map((res) => (
                  <div key={res.id} onClick={(e) => e.stopPropagation()} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md truncate border border-blue-200/60 shadow-sm">
                    <span className="font-bold mr-1">{format(new Date(res.startTime), 'HH:mm')}</span>{res.reserver}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
