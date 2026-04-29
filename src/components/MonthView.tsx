import { useCalendarStore } from '@/store/useCalendarStore';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday, isSameDay } from 'date-fns';
import { getHolidays } from '@/lib/holidays';

export default function MonthView() {
  const { currentDate, reservations, customHolidays, openResModal, setSelectedReservation } = useCalendarStore();
  const monthStart = startOfMonth(currentDate); const startDate = startOfWeek(monthStart); const endDate = endOfWeek(endOfMonth(monthStart));
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const baseHolidays = getHolidays(currentDate.getFullYear());
  const allHolidays = [...baseHolidays, ...customHolidays.map(h => ({ date: format(new Date(h.date), 'yyyy-MM-dd'), name: h.name }))];
  const getHoliday = (date: Date) => allHolidays.find(h => h.date === format(date, 'yyyy-MM-dd'));

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* 높이 h-[70px] 축소 */}
      <div className="grid grid-cols-7 border-b border-gray-200/50 h-[70px] items-center">
        {/* 요일 크기 text-base로 확대 */}
        {weekDays.map((day, i) => (<div key={day} className={`text-center text-base font-extrabold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'}`}>{day}</div>))}
      </div>

      <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-white/30 backdrop-blur-md rounded-xl border border-white/50 shadow-inner overflow-hidden mt-2">
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart); const isDayToday = isToday(day); const holiday = getHoliday(day);
          const isSunday = day.getDay() === 0; const isSaturday = day.getDay() === 6;
          const textColor = holiday || isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-700';
          const dayReservations = reservations.filter(res => isSameDay(new Date(res.startTime), day));

          return (
            <div key={day.toString()} onClick={() => openResModal(day)} className={`border-r border-b border-gray-200/50 p-2 flex flex-col cursor-pointer hover:bg-white/60 transition ${isDayToday ? 'bg-blue-50/40' : ''} ${!isCurrentMonth ? 'opacity-40' : ''}`}>
              <div className="flex justify-between items-start mb-1">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isDayToday ? 'bg-blue-600 text-white shadow-md' : textColor}`}>{format(day, 'd')}</span>
                {holiday && <span className="text-[10px] font-bold text-red-500 bg-red-100/80 px-1.5 py-0.5 rounded-md border border-red-200/50 truncate max-w-[80px]">{holiday.name}</span>}
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 hide-scrollbar pr-1 mt-1">
                {dayReservations.map((res) => (
                  // ⭐ 클릭 시 상세 모달창 띄우기 & 텍스트 포맷 (10층 14:00)
                  <div key={res.id} onClick={(e) => { e.stopPropagation(); setSelectedReservation(res); }} 
                       className="text-xs px-2 py-1.5 rounded-lg truncate shadow-sm cursor-pointer transition transform hover:-translate-y-px hover:shadow-md border border-white/60 text-white font-medium"
                       style={{ backgroundColor: res.room?.color || '#3b82f6' }}>
                    <span className="font-extrabold mr-1.5 drop-shadow-sm">{res.room?.name}</span>
                    <span className="opacity-90">{format(new Date(res.startTime), 'HH:mm')}</span>
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
