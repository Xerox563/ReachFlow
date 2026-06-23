export type Category = 'Founder' | 'Storytelling' | 'Career Growth' | 'AI' | 'Sales' | 'Marketing';

export interface ReferencePost {
  id: string;
  content: string;
  category: Category;
  tags: {
    hook: string;
    structure: string;
    contentType: string;
  };
  author?: string;
  createdAt: string;
}

export interface PostVariation {
  id: string;
  type: 'Story' | 'Professional' | 'Engaging';
  content: string;
}

export interface GeneratedPost {
  id: string;
  topic: string;
  keyPoints: string[];
  audience: string;
  selectedStyleId: string;
  content: string;
  variations: PostVariation[];
  hookOptions: string[];
  selectedHook?: string;
  createdAt: string;
}
