import React, { useState, useEffect, useMemo } from 'react';
import { CalendarHeader, WeekView, MonthView, ReservationModal, RoomLegend, SettingsModal } from './components';
import { ViewType, Reservation, Room, CustomHoliday, fetchReservations, fetchRooms, fetchHolidays, cn } from './shared';
import { format, addMinutes } from 'date-fns';
import Holidays from 'date-holidays';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('week');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [customHolidays, setCustomHolidays] = useState<CustomHoliday[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modalDate, setModalDate] = useState(new Date());
  const [modalTime, setModalTime] = useState('09:00');
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  const hd = useMemo(() => new Holidays('KR'), []);

  const loadData = async () => {
    try {
      const [resData, roomsData, holidaysData] = await Promise.all([
        fetchReservations(''),
        fetchRooms(),
        fetchHolidays(),
      ]);
      setReservations(resData);
      setRooms(roomsData);
      setCustomHolidays(holidaysData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time updates via SSE
  useEffect(() => {
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (e) => {
      if (e.data === 'update') {
        loadData();
      }
    };
    return () => {
      eventSource.close();
    };
  }, []);

  // Combine official holidays and custom holidays
  const allHolidays = useMemo(() => {
    const year = currentDate.getFullYear();
    const official = hd.getHolidays(year).map(h => ({
      date: h.date.split(' ')[0], // YYYY-MM-DD
      name: h.name,
      isOfficial: true
    }));
    const custom = customHolidays.map(h => ({
      date: h.date,
      name: h.name,
      isOfficial: false
    }));
    return [...official, ...custom];
  }, [currentDate, customHolidays, hd]);

  const handleSlotClick = (date: Date, time: string) => {
    setEditingReservation(null);
    setModalDate(date);
    setModalTime(time);
    setIsModalOpen(true);
  };

  const handleReservationClick = (res: Reservation) => {
    setEditingReservation(res);
    setIsModalOpen(true);
  };

  const handleGeneralReserve = () => {
    setEditingReservation(null);
    const now = new Date();
    // Round to next 30 min snippet
    const mins = now.getMinutes();
    const addMins = mins < 30 ? 30 - mins : 60 - mins;
    const nextSlot = addMinutes(now, addMins);
    
    setModalDate(nextSlot);
    setModalTime(format(nextSlot, 'HH:mm'));
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-[100dvh] bg-[#F2F2F7] relative overflow-hidden flex flex-col font-sans">
      {/* Background Orbs */}
      <div className="fixed -top-20 -left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 pointer-events-none"></div>
      <div className="fixed top-1/2 -right-20 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 pointer-events-none"></div>

      <main className="flex-1 overflow-auto p-4 md:p-6 z-10 flex flex-col items-center w-full">
        <div className="flex-1 w-full max-w-[1200px] flex flex-col h-full gap-4 min-w-0">
          <CalendarHeader 
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            view={view}
            setView={setView}
            onNewReservation={handleGeneralReserve}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          <RoomLegend 
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
          />
          
          <div className="flex-1 min-h-[600px]">
             {view === 'week' ? (
                <WeekView 
                  currentDate={currentDate} 
                  reservations={selectedRoomId ? reservations.filter(r => r.room_id === selectedRoomId) : reservations} 
                  selectedRoomId={selectedRoomId}
                  rooms={rooms}
                  holidays={allHolidays}
                  onSlotClick={handleSlotClick}
                  onReservationClick={handleReservationClick}
                />
              ) : (
                <MonthView 
                  currentDate={currentDate} 
                  reservations={selectedRoomId ? reservations.filter(r => r.room_id === selectedRoomId) : reservations} 
                  rooms={rooms}
                  holidays={allHolidays}
                  onSlotClick={handleSlotClick}
                  onReservationClick={handleReservationClick}
                />
              )}
          </div>
        </div>
      </main>

      <footer className="h-8 px-8 flex items-center justify-between text-[10px] text-gray-400 bg-white/30 backdrop-blur-sm border-t border-white/20 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          Status: Relational Persistent Layer (Vercel Postgres/Neon)
        </div>
        <div>Last cloud sync: {format(new Date(), 'HH:mm:ss')}</div>
      </footer>

      <ReservationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultDate={modalDate}
        defaultTime={modalTime}
        editingReservation={editingReservation}
        rooms={rooms}
        onSuccess={() => {
          loadData();
        }}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        rooms={rooms}
        holidays={customHolidays}
        onUpdateRooms={loadData}
        onUpdateHolidays={loadData}
      />
    </div>
  );
}

