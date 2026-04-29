import { useCalendarStore } from '@/store/useCalendarStore';

export default function ReservationModal() {
  const { setResModalOpen } = useCalendarStore();

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[500px] shadow-2xl">
        <h2 className="text-xl font-bold mb-4">예약하기</h2>
        <div className="space-y-4">
          <input type="text" placeholder="예약자명" className="w-full p-2 border rounded-md" />
          <input type="text" placeholder="예약 내용" className="w-full p-2 border rounded-md" />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setResModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg">취소</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">예약 완료</button>
        </div>
      </div>
    </div>
  );
}
