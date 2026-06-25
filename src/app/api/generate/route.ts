import { NextResponse } from "next/server";

// We'll redefine the AI functions here to accept an optional API key parameter

// Single source of truth for the model fallback. If AI_MODEL_NAME isn't set,
// this is used instead. Picked a known-good, currently-available paid model
// (extremely cheap — fractions of a cent per request) rather than a free
// model, since free ":free" slugs on OpenRouter get rate-limited or retired
// without notice (confirmed while debugging this on 2026-06-25).
const DEFAULT_MODEL = "deepseek/deepseek-chat-v3.1";

function getModel() {
  return process.env.AI_MODEL_NAME || DEFAULT_MODEL;
}

function openRouterHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
    "X-Title": process.env.SITE_NAME || "ReachFlow",
    "Content-Type": "application/json",
  };
}

// Helper function with retries.
// NOTE: previously this only threw a generic "HTTP error! status: 404"
// message, which hid OpenRouter's actual (very informative) error body —
// e.g. "This model is unavailable for free, use X instead" or rate-limit
// details with retry_after_seconds. We now read and surface that body.
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  delay = 1000,
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      let detail = "";
      try {
        const errBody = await response.clone().json();
        detail = errBody?.error?.message ? ` - ${errBody.error.message}` : "";
      } catch {
        // response body wasn't JSON; ignore and use status only
      }
      throw new Error(`HTTP error! status: ${response.status}${detail}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(
        `Retrying request (${retries} attempts left)... ${error instanceof Error ? error.message : ""}`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

async function callOpenRouter(prompt: string, apiKey: string) {
  const response = await fetchWithRetry(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: openRouterHeaders(apiKey),
      body: JSON.stringify({
        model: getModel(),
        messages: [{ role: "user", content: prompt }],
      }),
    },
  );

  const data = await response.json();
  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error("Invalid response from AI");
  }
  return data.choices[0].message.content as string;
}

async function generateLinkedInPostWithKey({
  topic,
  keyPoints,
  audience,
  style,
  voiceSamples,
  apiKey,
}: any) {
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY not set - returning demo LinkedIn post");
    return `I lost a $50,000 client last month. 
Best thing that happened to my agency all year. 
Here's why: 
They wanted us to "just post more." No strategy. No targeting. Just volume. 
We said no. 
3 days later, they signed with someone who promised exactly that. 
Last week I checked their LinkedIn page. 
47 posts. 12 likes total. Zero leads mentioned. 
Meanwhile, we picked up 2 new clients that same month — both from referrals off a single post that took me 20 minutes to write. 
Here's what I'd tell anyone starting out on LinkedIn: 
→ Volume without a point of view is just noise 
→ One honest post beats ten generic ones 
→ Saying no to the wrong client protects the work you actually want to be known for 
We didn't lose a client. We avoided years of work we'd have hated. 
Have you ever turned down a deal that turned out to be the right call?`;
  }

  const voiceContext = voiceSamples
    ? `
    MATCH USER VOICE: Here are examples of the user's writing style - match this tone and voice:
    ${voiceSamples.map((s: string) => `- ${s}`).join("\n")}
  `
    : "";

  const prompt = `
    You are an expert LinkedIn content creator trained in RevenueZen's proven methodology for high-performing posts.
    
    WHY THESE POSTS WORK (per RevenueZen's data):
    - No links, videos, or images in posts — authenticity beats recycled content
    - 2-3% engagement (engagements/views) is considered a good rate
    - Build a small group of engaged connections and reciprocate their engagement

    10 PROVEN POST TYPES/ANGLES TO CHOOSE FROM:
    1. BE PERSONAL: I-centric posts work against typical sales advice. People follow individuals, not generic content
    2. BE RELEVANT/TIMELY: Write about what's affecting your specific network right now, not generic news
    3. SELF-DEPRECATING INSTEAD OF SELF-PROMOTIONAL: Use your accomplishment as the hook, then subvert it with a counterintuitive point
    4. SHORT + A POINTED QUESTION: Only use once you have an engaged audience (don't overuse)
    5. BE CONTROVERSIAL (WITH NUANCE): Challenge commonly accepted wisdom with nuance
    6. TELL A STORY: Same advice delivered as something that happened to you becomes far more engaging
    7. EDUCATE WITH A HARD TRUTH: Walk the line between challenging misconception and negativity
    8. TEASE SOMETHING COMING: Hint at a launch without "feature spitting," add humility
    9. CONCRETE NUMBERS + AN OFFER: Real strategies + "DM me" only when specific
    10. SHOW RESULTS, DON'T STATE THEM: Share specifics of how you got the result

    COMPLETE CHECKLIST:
    - Length: 150-300 words (1,300-2,000 characters) for most
    - HOOK: Only line that matters — contrarian, vulnerable, numbers-based, or curiosity-driven
    - Format: Short lines, lots of white space, bullets/arrows for lists, 3-5 hashtags ONLY AT END, NO LINKS IN BODY
    - Voice: First-person, specific, NOT "thought leader" generic
    - CTA: Real, answerable question — NOT "thoughts?"

    FULL EXAMPLE POST:
    I lost a $50,000 client last month.
    Best thing that happened to my agency all year.
    Here's why:
    They wanted us to "just post more." No strategy. No targeting. Just volume.
    We said no.
    3 days later, they signed with someone who promised exactly that.
    Last week I checked their LinkedIn page.
    47 posts. 12 likes total. Zero leads mentioned.
    Meanwhile, we picked up 2 new clients that same month — both from referrals off a single post that took me 20 minutes to write.
    Here's what I'd tell anyone starting out on LinkedIn:
    → Volume without a point of view is just noise
    → One honest post beats ten generic ones
    → Saying no to the wrong client protects the work you actually want to be known for
    We didn't lose a client. We avoided years of work we'd have hated.
    Have you ever turned down a deal that turned out to be the right call?

    NOW, CREATE A POST USING THIS STYLE:
    ${style.content}
    
    CATEGORY: ${style.category}
    HOOK TYPE: ${style.tags.hook}
    STRUCTURE: ${style.tags.structure}
    ${voiceContext}
    
    USER TOPIC: ${topic}
    KEY POINTS:
    ${keyPoints.map((p: string) => `- ${p}`).join("\n")}
    
    TARGET AUDIENCE: ${audience}
    
    INSTRUCTIONS:
    1. Choose ONE of the 10 post types above that fits the topic
    2. Follow ALL the checklist rules strictly
    3. Match the tone, pacing, and formatting of the reference style
    4. If voice samples provided, match that writing style closely
    5. Keep it 150-300 words
    6. NO LINKS IN POST, add "First comment for the link" if needed
    7. 3-5 hashtags ONLY AT THE END
    8. END WITH A REAL, ANSWERABLE QUESTION
    
    OUTPUT: Only the LinkedIn post content.
  `;

  return callOpenRouter(prompt, apiKey);
}

async function generateHooksWithKey({ topic, count = 10, apiKey }: any) {
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY not set - returning demo hooks");
    return [
      `What if I told you something about ${topic} that changed everything?`,
      `I used to think X about ${topic} — until I learned this.`,
      `Here's the biggest mistake I see with ${topic}.`,
      `What nobody tells you about ${topic}.`,
      `The moment I realized I was wrong about ${topic}.`,
    ];
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

  const hooksString = await callOpenRouter(prompt, apiKey);
  return hooksString
    .split("\n")
    .filter((h: string) => h.trim().startsWith("- "))
    .map((h: string) => h.replace(/^-\s*/, ""));
}

async function generateVariationsWithKey({ content, apiKey }: any) {
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY not set - returning demo variations");
    return {
      story: "Demo story version of your post.",
      professional: "Demo professional version.",
      engaging: "Demo engaging version.",
    };
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

  const resultText = await callOpenRouter(prompt, apiKey);

  const variations = { story: "", professional: "", engaging: "" };

  const storyMatch = resultText.match(
    /STORY VERSION:([\s\S]*?)(?=PROFESSIONAL VERSION:|$)/i,
  );
  const professionalMatch = resultText.match(
    /PROFESSIONAL VERSION:([\s\S]*?)(?=ENGAGING VERSION:|$)/i,
  );
  const engagingMatch = resultText.match(/ENGAGING VERSION:([\s\S]*)$/i);

  if (storyMatch) variations.story = storyMatch[1].trim();
  if (professionalMatch) variations.professional = professionalMatch[1].trim();
  if (engagingMatch) variations.engaging = engagingMatch[1].trim();

  return variations;
}

async function editPostWithKey({ content, action, apiKey }: any) {
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY not set - returning demo edit");
    if (action === "rewrite") {
      return "Let me rewrite that for you, better: \n\nI used to think shipping features fast was the goal.\n\nUntil we shipped 3 features that no one used. \n\nThe hard truth? Building the wrong thing is worse than building nothing. \n\nNow we spend 50% of our time before coding. \n\nTalking to users. \n\nUnderstanding the problem. \n\nAnd we've cut our waste by 70%. \n\nBuild fast, but only after you understand. \n\nHow do you validate before building? 👇";
    }
    if (action === "shorten") {
      return "Building the wrong thing is worse than building nothing. \n\nTalk to users first. \n\nIt will save you months. \n\n---\n\nThis took us 3 years to learn. Don't make the same mistake. 👇";
    }
    if (action === "expand") {
      return "I used to think shipping features fast was the only measure of success. \n\nUntil we spent 3 months building a feature request from 2 clients. \n\nLaunched it. \n\nOnly one of them used it. \n\nAnd even they stopped after 2 weeks. \n\nThat's when we changed everything. \n\nNow we spend: \n\n50% of time just talking to users \n\n25% defining the problem \n\n25% coding the solution \n\nOur last 3 features? \n\nUsed by 80%+ of clients within 30 days. \n\nHere's the lesson: \n\nUnderstanding the problem is the real work. \n\nThe coding is easy. \n\nWhat's a feature you built that no one used? 👇";
    }
    if (action === "professional") {
      return "Product Development Lessons From 3 Years of Building. \n\nKey Learnings:\n1. 80% of successful features come from user interviews, not internal ideas\n2. The cost of building the wrong thing is 10x more than the cost of validation\n3. Speed matters—but only when it's the right speed \n\nOur Process:\n1. Talk to 5 users\n2. Define the problem in 1 sentence\n3. Prototype in 1 week\n4. Launch, measure, iterate\n\nWhat's your validation process? 👇";
    }
    if (action === "viral") {
      return 'This might get hate. \n\nBut I\'m going to say it anyway. \n\nStop building features first. \n\nStart talking to users first. \n\nWe spent 3 months building something that died. \n\nAll because we didn\'t ask: "Do you actually need this?"\n\nSince changing our process: \n\n- 80% of our features stick\n- Support tickets down 40% \n- Churn down 35%\n\nWant to know what we do instead? \n\nComment "PROCESS" and I\'ll send it to you 👇';
    }
    return content;
  }

  let actionPrompt = "";
  switch (action) {
    case "rewrite":
      actionPrompt = "Rewrite this post to improve clarity and flow";
      break;
    case "shorten":
      actionPrompt = "Shorten this post while keeping the key message";
      break;
    case "expand":
      actionPrompt = "Expand this post with more details and examples";
      break;
    case "professional":
      actionPrompt = "Make this post more professional and polished";
      break;
    case "viral":
      actionPrompt = "Optimize this post for maximum engagement and virality";
      break;
  }

  const prompt = `
    ${actionPrompt}:
    
    Original Post:
    ${content}
  `;

  return callOpenRouter(prompt, apiKey);
}

async function generateCommentWithKey({
  postContent,
  goal = "engage",
  apiKey,
}: any) {
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY not set - returning demo comments");
    return [
      "That's a great perspective! Thanks for sharing.",
      "Really insightful post, thanks for the value!",
      "Love this! Definitely something to think about.",
    ];
  }

  let goalPrompt = "";
  switch (goal) {
    case "network":
      goalPrompt =
        "Networking-focused: Build a connection, mention common ground, suggest follow-up";
      break;
    case "engage":
      goalPrompt =
        "Engagement-focused: Ask a follow-up question, encourage discussion";
      break;
    case "insightful":
      goalPrompt =
        "Insightful: Add value, share a related thought or experience";
      break;
  }

  const prompt = `
    Read this LinkedIn post and generate 3 high-quality comments (${goalPrompt}):
    
    POST CONTENT:
    ${postContent}
    
    INSTRUCTIONS:
    - Each comment should be 2-3 sentences
    - Sound natural and authentic (not AI-generated)
    - Add genuine value
    - Match the tone of the post
    - No hashtags or excessive emojis
    
    OUTPUT: 3 comments, each on a new line, labeled 1., 2., 3.
  `;

  const commentsString = await callOpenRouter(prompt, apiKey);

  const comments = commentsString
    .split("\n")
    .filter((line: string) => line.trim().match(/^\d\./))
    .map((line: string) => line.replace(/^\d\.\s*/, "").trim());

  return comments.length > 0
    ? comments
    : [
        "That's a great perspective! Thanks for sharing.",
        "Really insightful post, thanks for the value!",
        "Love this! Definitely something to think about.",
      ];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, apiKey, ...params } = body;

    // Use user-provided key or fall back to environment variable.
    // NOTE: if apiKey is sent as an empty string "" from the frontend,
    // it's falsy, so this correctly falls through to the env var — that's
    // fine. Just flagging it so it's not a silent surprise if a form field
    // is left blank vs. omitted.
    const finalApiKey = apiKey || process.env.OPENROUTER_API_KEY;

    let result;
    switch (type) {
      case "post":
        result = await generateLinkedInPostWithKey({
          ...params,
          apiKey: finalApiKey,
        });
        break;
      case "hooks":
        result = await generateHooksWithKey({ ...params, apiKey: finalApiKey });
        break;
      case "variations":
        result = await generateVariationsWithKey({
          ...params,
          apiKey: finalApiKey,
        });
        break;
      case "edit":
        result = await editPostWithKey({ ...params, apiKey: finalApiKey });
        break;
      case "comment": {
        const { postContent, goal } = params;
        const comments = await generateCommentWithKey({
          postContent,
          goal,
          apiKey: finalApiKey,
        });
        return NextResponse.json({ comments });
      }
      default:
        throw new Error("Invalid generation type");
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("AI Generation failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate" },
      { status: 500 },
    );
  }
}
