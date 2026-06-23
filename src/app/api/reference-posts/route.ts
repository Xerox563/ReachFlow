import { NextResponse } from 'next/server';
import { mockReferencePosts } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(mockReferencePosts);
}

export async function POST(request: Request) {
  const body = await request.json();
  // In a real app, save to DB. For now, we'll just return success.
  return NextResponse.json({ success: true, data: body });
}
