import { useCalendarStore } from '@/store/useCalendarStore';

export default function SettingsModal() {
  const { setSetModalOpen } = useCalendarStore();

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[600px] shadow-2xl">
        <h2 className="text-xl font-bold mb-4">설정 (회의실 및 공휴일 관리)</h2>
        <p className="text-gray-500 mb-6">여기에 설정 기능이 들어갑니다.</p>
        <div className="mt-6 flex justify-end">
          <button onClick={() => setSetModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">닫기</button>
        </div>
      </div>
    </div>
  );
}
