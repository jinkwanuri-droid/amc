import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  return NextResponse.json(await prisma.reservation.findMany({ include: { room: true }, orderBy: { startTime: 'asc' } }));
}

export async function POST(request: Request) {
  const { reserver, description, startTime, endTime, roomId } = await request.json();
  const start = new Date(startTime); const end = new Date(endTime);
  const overlapping = await prisma.reservation.findFirst({ where: { roomId, AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }] } });
  if (overlapping) return NextResponse.json({ error: '해당 시각에는 이미 예약이 있습니다.' }, { status: 400 });
  return NextResponse.json(await prisma.reservation.create({ data: { reserver, description, startTime: start, endTime: end, roomId } }));
}

// ⭐ 예약 수정 기능 (PUT) 추가
export async function PUT(request: Request) {
  const { id, reserver, description, startTime, endTime, roomId } = await request.json();
  const start = new Date(startTime); const end = new Date(endTime);
  const overlapping = await prisma.reservation.findFirst({ where: { id: { not: id }, roomId, AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }] } });
  if (overlapping) return NextResponse.json({ error: '해당 시각에는 이미 예약이 있습니다.' }, { status: 400 });
  return NextResponse.json(await prisma.reservation.update({ where: { id }, data: { reserver, description, startTime: start, endTime: end, roomId } }));
}

// ⭐ 예약 삭제 기능 (DELETE) 추가
export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (id) await prisma.reservation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
