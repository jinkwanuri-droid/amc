import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const rooms = await prisma.room.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(rooms);
}

export async function POST(request: Request) {
  const { name, capacity, color } = await request.json();
  const room = await prisma.room.create({ data: { name, capacity: Number(capacity), color } });
  return NextResponse.json(room);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) await prisma.room.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
