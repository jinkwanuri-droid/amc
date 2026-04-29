import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 1. 예약 목록 불러오기 (GET)
export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: { room: true },
      orderBy: { startTime: 'asc' },
    });
    return NextResponse.json(reservations);
  } catch (error) {
    return NextResponse.json({ error: '데이터를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

// 2. 새로운 예약 저장하기 (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reserver, description, startTime, endTime, roomId } = body;

    // 시간 변환
    const start = new Date(startTime);
    const end = new Date(endTime);

    // *안전장치: 아직 생성된 회의실이 없다면 '기본 회의실'을 자동으로 하나 만듭니다.
    let targetRoomId = roomId;
    if (!targetRoomId) {
      let defaultRoom = await prisma.room.findFirst();
      if (!defaultRoom) {
        defaultRoom = await prisma.room.create({
          data: { name: '대회의실', capacity: 12, color: '#3b82f6' } // 파란색
        });
      }
      targetRoomId = defaultRoom.id;
    }

    // ⭐ 핵심: 중복 예약 검사 (기존 예약의 시작시간 < 새 종료시간 AND 기존 종료시간 > 새 시작시간)
    const overlapping = await prisma.reservation.findFirst({
      where: {
        roomId: targetRoomId,
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } }
        ]
      }
    });

    if (overlapping) {
      return NextResponse.json({ error: '해당 시각에는 이미 예약이 있습니다.' }, { status: 400 });
    }

    // 예약 저장
    const reservation = await prisma.reservation.create({
      data: { reserver, description, startTime: start, endTime: end, roomId: targetRoomId },
    });

    return NextResponse.json(reservation);
  } catch (error) {
    return NextResponse.json({ error: '예약 저장에 실패했습니다.' }, { status: 500 });
  }
}
