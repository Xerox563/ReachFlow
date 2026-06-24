import { ReferencePost, Category } from "@/types";

export async function generateLinkedInPost({
  topic,
  keyPoints,
  audience,
  style,
  voiceSamples,
}: {
  topic: string;
  keyPoints: string[];
  audience: string;
  style: ReferencePost;
  voiceSamples?: string[];
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.AI_MODEL_NAME || 'anthropic/claude-3-sonnet';

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const voiceContext = voiceSamples ? `
    MATCH USER VOICE: Here are examples of the user's writing style - match this tone and voice:
    ${voiceSamples.map(s => `- ${s}`).join('\n')}
  ` : '';

  const prompt = `
    You are an expert LinkedIn content creator. Your goal is to write a high-performing LinkedIn post.
    
    REFERENCE STYLE TO MATCH:
    ${style.content}
    
    CATEGORY: ${style.category}
    HOOK TYPE: ${style.tags.hook}
    STRUCTURE: ${style.tags.structure}
    ${voiceContext}
    
    USER TOPIC: ${topic}
    KEY POINTS:
    ${keyPoints.map(p => `- ${p}`).join('\n')}
    
    TARGET AUDIENCE: ${audience}
    
    INSTRUCTIONS:
    1. Match the tone, pacing, and formatting of the reference style.
    2. Use the specified hook type to grab attention.
    3. Follow the structure of the reference post.
    4. If voice samples are provided, match that writing style closely.
    5. Ensure the content is relevant to the topic and audience.
    6. Keep it concise and impactful.
    
    OUTPUT: Only the LinkedIn post content.
  `;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
      "X-Title": process.env.SITE_NAME || "ReachFlow",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateHooks({
  topic,
  count = 10,
}: {
  topic: string;
  count?: number;
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.AI_MODEL_NAME || 'anthropic/claude-3-sonnet';

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const prompt = `
    Generate ${count} attention-grabbing LinkedIn post hooks for this topic: "${topic}"
    
    Hook types to include:
    - Bold statement
    - Question
    - Contrarian take
    - Surprising fact
    - Personal story
    - Numbered list opener
    
    Output format: Each hook on a new line, prefixed with "- ". No extra text.
  `;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
      "X-Title": process.env.SITE_NAME || "ReachFlow",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();
  const hooksString = data.choices[0].message.content;
  return hooksString.split('\n').filter((h: string) => h.trim().startsWith('- ')).map((h: string) => h.replace(/^-\s*/, ''));
}

export async function generateVariations({
  content,
}: {
  content: string;
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.AI_MODEL_NAME || 'anthropic/claude-3-sonnet';

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const prompt = `
    Take this LinkedIn post and generate 3 distinct variations:
    
    Original Post:
    ${content}
    
    Variations to create:
    1. Story Version - Tell it as a personal story/anecdote
    2. Professional Version - More formal, data-focused
    3. Engaging Version - More conversational, ask questions, encourage interaction
    
    Output each variation clearly labeled with "STORY VERSION:", "PROFESSIONAL VERSION:", "ENGAGING VERSION:"
  `;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
      "X-Title": process.env.SITE_NAME || "ReachFlow",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();
  const resultText = data.choices[0].message.content;
  
  // Parse the variations
  const variations = {
    story: '',
    professional: '',
    engaging: ''
  };
  
  const storyMatch = resultText.match(/STORY VERSION:([\s\S]*?)(?=PROFESSIONAL VERSION:|$)/i);
  const professionalMatch = resultText.match(/PROFESSIONAL VERSION:([\s\S]*?)(?=ENGAGING VERSION:|$)/i);
  const engagingMatch = resultText.match(/ENGAGING VERSION:([\s\S]*)$/i);
  
  if (storyMatch) variations.story = storyMatch[1].trim();
  if (professionalMatch) variations.professional = professionalMatch[1].trim();
  if (engagingMatch) variations.engaging = engagingMatch[1].trim();
  
  return variations;
}

export async function editPost({
  content,
  action,
}: {
  content: string;
  action: 'rewrite' | 'shorten' | 'expand' | 'professional' | 'viral';
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.AI_MODEL_NAME || 'anthropic/claude-3-sonnet';

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  let actionPrompt = '';
  switch(action) {
    case 'rewrite':
      actionPrompt = 'Rewrite this post to improve clarity and flow';
      break;
    case 'shorten':
      actionPrompt = 'Shorten this post while keeping the key message';
      break;
    case 'expand':
      actionPrompt = 'Expand this post with more details and examples';
      break;
    case 'professional':
      actionPrompt = 'Make this post more professional and polished';
      break;
    case 'viral':
      actionPrompt = 'Optimize this post for maximum engagement and virality';
      break;
  }

  const prompt = `
    ${actionPrompt}:
    
    Original Post:
    ${content}
  `;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
      "X-Title": process.env.SITE_NAME || "ReachFlow",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateComment({
  postContent,
  goal = 'engage',
}: {
  postContent: string;
  goal?: 'network' | 'engage' | 'insightful';
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.AI_MODEL_NAME || 'anthropic/claude-3-sonnet';

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const goalPrompt = goal === 'network' ? 'Focus on building a connection with the author' :
                      goal === 'insightful' ? 'Share a thoughtful insight or perspective' :
                      'Encourage engagement and conversation';

  const prompt = `
    You are a LinkedIn engagement expert. Generate 3 different, high-quality comments for the following post.
    The goal of the comments is: ${goalPrompt}.
    
    Post Content:
    ${postContent}
    
    Requirements:
    1. Each comment should be unique.
    2. Keep them professional yet conversational.
    3. Include a mix of praise, insightful questions, and personal perspective.
    4. Format the output as a JSON array of 3 strings.
    
    Example output: ["comment 1", "comment 2", "comment 3"]
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": process.env.SITE_NAME || "ReachFlow",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(text.substring(text.indexOf('['), text.lastIndexOf(']') + 1));
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return text.split('\n').filter((h: string) => h.trim().length > 10).slice(0, 3);
    }
    return [text];
  } catch (error) {
    console.error("Error generating comment:", error);
    return [
      "That's a great perspective! Thanks for sharing.",
      "Really insightful post, thanks for the value!",
      "Love this! Definitely something to think about."
    ];
  }
}
