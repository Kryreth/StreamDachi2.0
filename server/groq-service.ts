```ts
// GroqCloud AI Service - Migrated from OpenAI
import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface SentimentAnalysisResult {
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  toxicity: boolean;
  categories: string[];
  emotions: string[];
  primaryEmotion: string;
  emotionIntensity: number;
  intent: string;
  intentConfidence: number;
  isQuestion: boolean;
  isCommand: boolean;
  requiresResponse: boolean;
}

export interface EnhancedSpeechResult {
  original: string;
  enhanced: string;
}

export type PersonalityStyle = "Neutral" | "Quirky" | "Funny" | "Sarcastic" | "Professional";

const PERSONALITY_PROMPTS: Record<PersonalityStyle, string> = {
  Neutral:
    "Rephrase the spoken text to make it sound natural and conversational. Remove stutters and filler words (um, uh, like). Preserve the original meaning, intent, and tone as closely as possible. Make only minimal edits for clarity. Output only the rephrased text, nothing else.",
  Quirky:
    "Rephrase the spoken text in a quirky, playful, and energetic tone. Remove stutters and filler words. Add exclamation marks and enthusiastic language where appropriate. Use fun expressions and upbeat phrasing. Keep the core message intact but make it sound more vibrant and playful. Output only the rephrased text, nothing else.",
  Funny:
    "Rephrase the spoken text in a humorous and lighthearted way. Remove stutters and filler words. Add witty commentary or amusing phrasing where it fits naturally. Make it entertaining without changing the main point. Output only the rephrased text, nothing else.",
  Sarcastic:
    "Rephrase the spoken text with a sarcastic, deadpan, and witty tone. Remove stutters and filler words. Add dry humor and ironic phrasing where appropriate. Keep the core message but deliver it with a sarcastic edge. Output only the rephrased text, nothing else.",
  Professional:
    "Rephrase the spoken text in a polished, professional, and articulate manner. Remove stutters and filler words. Use clear, formal language and proper grammar. Maintain professionalism while preserving the original meaning. Output only the rephrased text, nothing else.",
};

export async function analyzeChatMessage(message: string): Promise<SentimentAnalysisResult> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing Twitch chat messages for deep emotional and intentional understanding.

Analyze each message and provide comprehensive insights about:
1. Basic sentiment and toxicity
2. ALL emotions present (can have multiple)
3. Primary/dominant emotion
4. User's intent (what they're trying to do/say)
5. Context clues (is it a question, command, etc.)

Respond with JSON as described.`,
        },
        { role: "user", content: `Analyze this Twitch chat message: "${message}"` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      sentiment: result.sentiment || "neutral",
      sentimentScore: Math.max(1, Math.min(5, result.sentimentScore || 3)),
      toxicity: result.toxicity || false,
      categories: result.categories || [],
      emotions: result.emotions || [],
      primaryEmotion: result.primaryEmotion || "neutral",
      emotionIntensity: Math.max(1, Math.min(10, result.emotionIntensity || 5)),
      intent: result.intent || "chatting_casually",
      intentConfidence: Math.max(1, Math.min(10, result.intentConfidence || 5)),
      isQuestion: result.isQuestion || false,
      isCommand: result.isCommand || false,
      requiresResponse: result.requiresResponse || false,
    };
  } catch (error) {
    console.error("Error analyzing message with Groq:", error);
    return {
      sentiment: "neutral",
      sentimentScore: 3,
      toxicity: false,
      categories: ["error"],
      emotions: [],
      primaryEmotion: "neutral",
      emotionIntensity: 5,
      intent: "unknown",
      intentConfidence: 1,
      isQuestion: false,
      isCommand: false,
      requiresResponse: false,
    };
  }
}

export async function generateAiResponse(prompt: string, userMessage: string): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Unable to generate response.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Sorry, I couldn't process that request.";
  }
}

export interface DachiStreamSettings {
  model: string;
  temperature: number;
  maxChars: number;
  energy: string;
  personality: string;
  topicAllowlist: string[];
  topicBlocklist: string[];
  streamerVoiceOnlyMode: boolean;
}

export async function generateDachiStreamResponse(
  userMessage: string,
  context: string,
  settings: DachiStreamSettings
): Promise<string> {
  try {
    const systemParts: string[] = [];

    const personalityPrompts: Record<string, string> = {
      Casual: "You are DachiDachi, a friendly and relaxed AI chat companion. Respond casually.",
      Comedy: "You are DachiDachi, a witty and humorous AI chat companion.",
      Quirky: "You are DachiDachi, a unique and playful AI chat companion.",
      Serious: "You are DachiDachi, a professional and focused AI chat companion.",
      Gaming: "You are DachiDachi, an energetic gamer AI companion.",
      Professional: "You are DachiDachi, a polished and business-like AI chat companion.",
    };

    const basePersonality = personalityPrompts[settings.personality] || personalityPrompts.Casual;
    let energyModifier = "";
    if (settings.energy === "High") energyModifier = " Respond with extra energy!";
    else if (settings.energy === "Low") energyModifier = " Keep responses calm.";

    const topicRules = [];
    if (settings.topicAllowlist.length > 0) {
      topicRules.push(
        `ALLOWED TOPICS: You should mainly discuss ${settings.topicAllowlist.join(", ")}.`
      );
    }
    if (settings.topicBlocklist.length > 0) {
      topicRules.push(
        `BLOCKED TOPICS: NEVER discuss ${settings.topicBlocklist.join(", ")}.`
      );
    }

    const generalGuidelines =
      "GUIDELINES:\n" +
      "- Be authentic and conversational\n" +
      "- Reference chat context when relevant\n" +
      "- Use the user's personality info to personalize your response\n" +
      "- Avoid repetitive phrases\n" +
      "- Don't apologize excessively\n" +
      "- If you can't help with something, be direct and brief";

    systemParts.push(
      basePersonality + energyModifier,
      ...topicRules,
      `RESPONSE LENGTH: Keep your response under ${settings.maxChars} characters.`,
      generalGuidelines
    );

    const systemMessage = systemParts.join("\n\n");
    const fullUserMessage = context
      ? `${context}\n\n---\n\nRESPOND TO: ${userMessage}`
      : `RESPOND TO: ${userMessage}`;

    const response = await groq.chat.completions.create({
      model: settings.model,
      temperature: settings.temperature,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: fullUserMessage },
      ],
      max_tokens: Math.ceil(settings.maxChars / 3),
    });

    const aiResponse = response.choices[0].message.content || "Unable to generate response.";
    if (aiResponse.includes("SKIP_RESPONSE")) return "";
    return aiResponse.length > settings.maxChars
      ? aiResponse.substring(0, settings.maxChars - 3) + "..."
      : aiResponse;
  } catch (error) {
    console.error("Error generating DachiStream response:", error);
    return "";
  }
}

export async function cleanupSpeechText(rawText: string): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a speech-to-text cleanup assistant. Fix grammar, remove filler words, and make it concise.",
        },
        { role: "user", content: rawText },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    return response.choices[0].message.content || rawText;
  } catch (error) {
    console.error("Error cleaning up speech text:", error);
    return rawText;
  }
}

export async function enhanceSpeechForChat(
  rawText: string,
  personality: PersonalityStyle = "Neutral"
): Promise<EnhancedSpeechResult> {
  try {
    const systemPrompt = PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS.Neutral;
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: rawText },
      ],
      max_tokens: 150,
      temperature: personality === "Neutral" || personality === "Professional" ? 0.5 : 0.7,
    });

    const enhanced = response.choices[0].message.content || rawText;
    return { original: rawText, enhanced: enhanced.trim() };
  } catch (error) {
    console.error("Error enhancing speech:", error);
    return { original: rawText, enhanced: rawText };
  }
}

export async function transcribeAudio(audioFile: File): Promise<string> {
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      language: "en",
      response_format: "json",
      temperature: 0,
    });
    return transcription.text;
  } catch (error) {
    console.error("Error transcribing audio with Groq Whisper:", error);
    throw error;
  }
}