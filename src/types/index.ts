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
  story: string;
  professional: string;
  engaging: string;
}

export interface GeneratedPost {
  id: string;
  topic: string;
  keyPoints: string[];
  audience: string;
  selectedStyleId: string;
  content: string;
  hookOptions: string[];
  selectedHook?: string;
  variations?: PostVariation;
  createdAt: string;
}

export interface SavedPost {
  id: string;
  topic: string;
  keyPoints: string[];
  audience: string;
  selectedStyle: ReferencePost;
  content: string;
  hookOptions: string[];
  selectedHook?: string;
  variations?: PostVariation;
  createdAt: string;
}
