import { useCalendarStore } from '@/store/useCalendarStore';
import { startOfWeek, addDays, format, isToday } from 'date-fns';

export default function WeekView() {
  const { currentDate } = useCalendarStore();
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(startOfCurrentWeek, i));
  const times = Array.from({ length: 12 }).map((_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

  return (
    <div className="w-full flex flex-col h-[700px]">
      <div className="grid grid-cols-6 border-b border-gray-100 pb-4">
        <div className="w-16"></div>
        {weekDays.map((day) => (
          <div key={day.toString()} className="flex flex-col items-center justify-center">
            <span className="text-xs text-gray-400 font-semibold mb-1">{format(day, 'EEE').toUpperCase()}</span>
            <span className={`text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700'}`}>
              {format(day, 'd')}
            </span>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto relative mt-4">
        {times.map((time) => (
          <div key={time} className="flex grid grid-cols-6 group h-[60px]">
            <div className="w-16 text-xs text-gray-400 font-medium text-right pr-4 -mt-2">{time}</div>
            {weekDays.map((day, i) => (
              <div key={i} className="border-t border-r border-gray-100/50 relative"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
