import { ReferencePost, Category } from "@/types";

export async function generateLinkedInPost({
  topic,
  keyPoints,
  audience,
  style,
}: {
  topic: string;
  keyPoints: string[];
  audience: string;
  style: ReferencePost;
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.AI_MODEL_NAME || 'anthropic/claude-3-sonnet';

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const prompt = `
    You are an expert LinkedIn content creator. Your goal is to write a high-performing LinkedIn post.
    
    REFERENCE STYLE TO MATCH:
    ${style.content}
    
    CATEGORY: ${style.category}
    HOOK TYPE: ${style.tags.hook}
    STRUCTURE: ${style.tags.structure}
    
    USER TOPIC: ${topic}
    KEY POINTS:
    ${keyPoints.map(p => `- ${p}`).join('\n')}
    
    TARGET AUDIENCE: ${audience}
    
    INSTRUCTIONS:
    1. Match the tone, pacing, and formatting of the reference style.
    2. Use the specified hook type to grab attention.
    3. Follow the structure of the reference post.
    4. Ensure the content is relevant to the topic and audience.
    5. Keep it concise and impactful.
    
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
