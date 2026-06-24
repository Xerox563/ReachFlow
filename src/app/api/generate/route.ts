import { NextResponse } from 'next/server';
import { 
  generateLinkedInPost, 
  generateHooks, 
  generateVariations, 
  editPost,
  generateComment
} from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, ...params } = body;

    let result;
    switch(type) {
      case 'post':
        result = await generateLinkedInPost(params);
        break;
      case 'hooks':
        result = await generateHooks(params);
        break;
      case 'variations':
        result = await generateVariations(params);
        break;
      case 'edit':
        result = await editPost(params);
        break;
      case 'comment':
          const { postContent, goal } = params;
          const comments = await generateComment({ postContent, goal });
          return NextResponse.json({ comments });
      default:
        throw new Error('Invalid generation type');
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("AI Generation failed:", error);
    return NextResponse.json({ error: error.message || "Failed to generate" }, { status: 500 });
  }
}
