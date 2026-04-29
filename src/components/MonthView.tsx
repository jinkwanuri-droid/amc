import { useCalendarStore } from '@/store/useCalendarStore';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday } from 'date-fns';

export default function MonthView() {
  const { currentDate } = useCalendarStore();
  const monthStart = startOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(endOfMonth(monthStart));
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 border-b border-gray-100 pb-4">
        {weekDays.map((day, i) => (
          <div key={day} className={`text-center text-sm font-semibold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-l border-t border-gray-100/50 mt-4">
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);
          return (
            <div key={day.toString()} className="min-h-[120px] border-r border-b border-gray-100/50 p-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${!isCurrentMonth ? 'text-gray-300' : ''} ${isDayToday ? 'bg-blue-500 text-white' : ''} ${isCurrentMonth && !isDayToday && day.getDay() === 0 ? 'text-red-500' : ''} ${isCurrentMonth && !isDayToday && day.getDay() === 6 ? 'text-blue-500' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
