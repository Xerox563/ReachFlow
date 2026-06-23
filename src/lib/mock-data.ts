import { ReferencePost } from "@/types";

export const mockReferencePosts: ReferencePost[] = [
  {
    id: '1',
    content: "The secret to growing a SaaS isn't more features. It's more conversations.\n\nI spent 3 years building in silence.\nResult: 0 users.\n\nI spent 3 months talking to customers.\nResult: $10k MRR.\n\nDon't build. Talk.",
    category: 'Founder',
    tags: {
      hook: "Contrarian truth",
      structure: "Problem/Solution/Insight",
      contentType: "Business Lesson"
    },
    author: "Jane Doe",
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    content: "AI won't replace you. But a person using AI will.\n\nHere are 5 ways I use Claude to save 10 hours a week:\n\n1. Meeting summaries\n2. Email drafting\n3. Code debugging\n4. Content brainstorming\n5. Market research\n\nStart using it today or get left behind.",
    category: 'AI',
    tags: {
      hook: "Urgency/FOMO",
      structure: "Listicle",
      contentType: "Educational"
    },
    author: "John Smith",
    createdAt: new Date().toISOString()
  }
];
