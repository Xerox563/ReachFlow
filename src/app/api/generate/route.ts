import { NextResponse } from 'next/server';
import { generateLinkedInPost } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, keyPoints, audience, style } = body;

    if (!topic || !style) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const content = await generateLinkedInPost({
      topic,
      keyPoints,
      audience,
      style,
    });

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("AI Generation failed:", error);
    return NextResponse.json({ error: error.message || "Failed to generate post" }, { status: 500 });
  }
}
