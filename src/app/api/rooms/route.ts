import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() { return NextResponse.json(await prisma.room.findMany({ orderBy: { name: 'asc' } })); }
export async function POST(request: Request) {
  const { name, capacity, color } = await request.json();
  return NextResponse.json(await prisma.room.create({ data: { name, capacity: Number(capacity), color } }));
}
export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (id) await prisma.room.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
// ⭐ 회의실 수정 기능 (PUT) 추가
export async function PUT(request: Request) {
  const { id, name, capacity, color } = await request.json();
  const room = await prisma.room.update({ where: { id }, data: { name, capacity: Number(capacity), color } });
  return NextResponse.json(room);
}
