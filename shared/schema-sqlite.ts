```tsx
import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { randomUUID } from "crypto";

// Helper for UUID generation in SQLite
const uuid = () => randomUUID();

// User Profiles Table - Track VIP/Mod/Subscriber status + Personality Profiling
export const userProfiles = sqliteTable("user_profiles", {
  id: text("id").primaryKey().$defaultFn(() => uuid()),
  userId: text("user_id").notNull().unique(), // Twitch user ID
  username: text("username").notNull(),
  isVip: integer("is_vip", { mode: "boolean" }).notNull().default(false),
  isMod: integer("is_mod", { mode: "boolean" }).notNull().default(false),
  isSubscriber: integer("is_subscriber", { mode: "boolean" })
    .notNull()
    .default(false),
  channelPointsBalance: integer("channel_points_balance").default(0),
  wasAnonymous: integer("was_anonymous", { mode: "boolean" })
    .notNull()
    .default(false),
  firstSeen: integer("first_seen", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  lastSeen: integer("last_seen", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  shoutoutLastGiven: integer("shoutout_last_given", { mode: "timestamp" }),

  // Personality Tracking (1-10 scale, measured over time by AI)
  humorLevel: integer("humor_level").default(5),
  knowledgeLevel: integer("knowledge_level").default(5),
  bluntnessLevel: integer("bluntness_level").default(5),
  rudenessLevel: integer("rudeness_level").default(5),

  // Profile Information (NO PII - usernames, roles, preferences only)
  timezone: text("timezone"),
  twitchUrl: text("twitch_url"),
  previousNames: text("previous_names", { mode: "json" })
    .$type<string[]>()
    .default(sql`'[]'`),
  hobbies: text("hobbies", { mode: "json" }).$type<string[]>().default(sql`'[]'`),
  likes: text("likes", { mode: "json" }).$type<string[]>().default(sql`'[]'`),
  dislikes: text("dislikes", { mode: "json" }).$type<string[]>().default(sql`'[]'`),

  // Social Media & Links (URLs only, no PII)
  profilePictureUrl: text("profile_picture_url"),
  socials: text("socials", { mode: "json" })
    .$type<Record<string, string>>()
    .default(sql`'{}'`),
  customLinks: text("custom_links", { mode: "json" })
    .$type<Array<{ title: string; url: string }>>()
    .default(sql`'[]'`),
});

// User Insights Table - AI Learning Engine
export const userInsights = sqliteTable("user_insights", {
  userId: text("user_id").primaryKey(),
  summary: text("summary"),
  lastUpdated: integer("last_updated", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  totalMessages: integer("total_messages").notNull().default(0),
  recentTags: text("recent_tags", { mode: "json" })
    .$type<string[]>()
    .default(sql`'[]'`),
});

// Chat Messages Table - Enhanced with stream tracking
export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey().$defaultFn(() => uuid()),
  userId: text("user_id"),
  username: text("username").notNull(),
  message: text("message").notNull(),
  channel: text("channel").notNull(),
  streamId: text("stream_id"),
  eventType: text("event_type").notNull().default("chat"),
  timestamp: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  userColor: text("user_color"),
  badges: text("badges", { mode: "json" }).$type<Record<string, string>>(),
  emotes: text("emotes", { mode: "json" }),
  metadata: text("metadata", { mode: "json" }),
});

// AI Analysis Table - Enhanced with emotions and intent
export const aiAnalysis = sqliteTable("ai_analysis", {
  id: text("id").primaryKey().$defaultFn(() => uuid()),
  messageId: text("message_id")
    .notNull()
    .references(() => chatMessages.id, { onDelete: "cascade" }),
  sentiment: text("sentiment").notNull(),
  sentimentScore: integer("sentiment_score").notNull(),
  toxicity: integer("toxicity", { mode: "boolean" }).notNull().default(false),
  categories: text("categories", { mode: "json" }).$type<string[]>(),

  // Enhanced Emotion Analysis
  emotions: text("emotions", { mode: "json" })
    .$type<string[]>()
    .default(sql`'[]'`), // All detected emotions
  primaryEmotion: text("primary_emotion"), // Main emotion: comedy, serious, playful, sarcastic, angry, excited, supportive, confused, etc.
  emotionIntensity: integer("emotion_intensity").default(5), // 1-10 scale

  // Intent Detection
  intent: text("intent"), // joking, asking_question, being_supportive, trolling, sharing_info, requesting_help, etc.
  intentConfidence: integer("intent_confidence").default(5), // 1-10 confidence scale

  // Context Understanding
  isQuestion: integer("is_question", { mode: "boolean" }).default(false),
  isCommand: integer("is_command", { mode: "boolean" }).default(false),
  requiresResponse: integer("requires_response", { mode: "boolean" }).default(false),

  timestamp: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
