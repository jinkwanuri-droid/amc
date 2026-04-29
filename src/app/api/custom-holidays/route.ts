import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const holidays = await prisma.customHoliday.findMany({ orderBy: { date: 'asc' } });
  return NextResponse.json(holidays);
}

export async function POST(request: Request) {
  const { date, name } = await request.json();
  const holiday = await prisma.customHoliday.create({ data: { date: new Date(date), name } });
  return NextResponse.json(holiday);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) await prisma.customHoliday.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
