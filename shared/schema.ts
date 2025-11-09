// shared/schema.ts (SQLite version)
// Converts your original Postgres pg-core schema to SQLite sqlite-core
// Uses better-sqlite3 + drizzle-orm/sqlite-core

import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { randomUUID } from "crypto";

// Helper for UUID generation in SQLite
const uuid = () => randomUUID();

/* ================================
   User Profiles
================================ */
export const userProfiles = sqliteTable("user_profiles", {
  id: text("id").primaryKey().$defaultFn(() => uuid()),
  userId: text("user_id").notNull().unique(), // Twitch user ID
  username: text("username").notNull(),
  isVip: integer("is_vip", { mode: "boolean" }).notNull().default(false),
  isMod: integer("is_mod", { mode: "boolean" }).notNull().default(false),
  isSubscriber: integer("is_subscriber", { mode: "boolean" }).notNull().default(false),
  channelPointsBalance: integer("channel_points_balance").default(0),
  wasAnonymous: integer("was_anonymous", { mode: "boolean" }).notNull().default(false),
  firstSeen: integer("first_seen", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastSeen: integer("last_seen", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  shoutoutLastGiven: integer("shoutout_last_given", { mode: "timestamp" }),

  // Personality Tracking (1-10 scale, measured over time by AI)
  humorLevel: integer("humor_level").default(5),
  knowledgeLevel: integer("knowledge_level").default(5),
  bluntnessLevel: integer("bluntness_level").default(5),
  rudenessLevel: integer("rudeness_level").default(5),

  // Profile Information (NO PII - usernames, roles, preferences only)
  timezone: text("timezone"),
  twitchUrl: text("twitch_url"),
  previousNames: text("previous_names", { mode: "json" }).$type<string[]>().default(sql`'[]'`),
  hobbies: text("hobbies", { mode: "json" }).$type<string[]>().default(sql`'[]'`),
  likes: text("likes", { mode: "json" }).$type<string[]>().default(sql`'[]'`),
  dislikes: text("dislikes", { mode: "json" }).$type<string[]>().default(sql`'[]'`),

  // Social Media & Links (URLs only, no PII)
  profilePictureUrl: text("profile_picture_url"),
  socials: text("socials", { mode: "json" }).$type<Record<string, string>>().default(sql`'{}'`),
  customLinks: text("custom_links", { mode: "json" }).$type<Array<{ title: string; url: string }>>().default(sql`'[]'`),
});

/* ================================
   User Insights
================================ */
export const userInsights = sqliteTable("user_insights", {
  userId: text("user_id").primaryKey(), // References userProfiles.userId (logical)
  summary: text("summary"),
  lastUpdated: integer("last_updated", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  totalMessages: integer("total_messages").notNull().default(0),
  recentTags: text("recent_tags", { mode: "json" }).$type<string[]>().default(sql`'[]'`),
});

/* ================================
   Chat Messages
================================ */
export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey().$defaultFn(() => uuid()),
  userId: text("user_id"), // Twitch user ID (may be null for anonymous)
  username: text("username").notNull(),
  message: text("message").notNull(),
  channel: text("channel").notNull(),
  streamId: text("stream_id"), // Unique per streaming session
  eventType: text("event_type").notNull().default("chat"), // chat, redeem, raid, sub, etc.
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  userColor: text("user_color"),
  badges: text("badges", { mode: "json" }).$type<Record<string, string>>(),
  emotes: text("emotes", { mode: "json" }),
  metadata: text("metadata", { mode: "json" }), // Additional event-specific data
});

/* ================================
   AI Analysis
================================ */
export const aiAnalysis = sqliteTable("ai_analysis", {
  id: text("id").primaryKey().$defaultFn(() => uuid()),
  messageId: text("message_id")
    .notNull()
    .references(() => chatMessages.id, { onDelete: "cascade" }),

  sentiment: text("sentiment").notNull(), // positive, neutral, negative
  sentimentScore: integer("sentiment_score").notNull(), // 1-5
  toxicity: integer("toxicity", { mode: "boolean" }).notNull().default(false),
  categories: text("categories", { mode: "json" }).$type<string[]>(),

  // Enhanced Emotion Analysis
  emotions: text("emotions", { mode: "json" }).$type<string[]>().default(sql`'[]'`), // All detected emotions
  primaryEmotion: text("primary_emotion"), // Main emotion
  emotionIntensity: integer("emotion_intensity").default(5), // 1-10 scale

  // Intent Detection
  intent: text("intent"), // joking, asking_question, etc.
  intentConfidence: integer("intent_confidence").default(5), // 1-10

  // Context Understanding
  isQuestion: integer("is_question", { mode: "boolean" }).default(false),
  isCommand: integer("is_command", { mode: "boolean" }).default(false),
  requiresResponse: integer("requires_response", { mode: "boolean" }).default(false),

  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/* ================================
   AI Commands
================================ */
export const aiCommands = sqliteTable("ai_commands", {
  id: text("id").primaryKey().$defaultFn(() => uuid()),
  trigger: text("trigger").notNull().unique(),
  prompt: text("prompt").notNull(),
  responseType: text("response_type").notNull(), // direct, analysis, generate
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/* ================================
   Voice AI Responses
================================ */
export const voiceAiResponses = sqliteTable("voice_ai_responses", {
  id: text("id").primaryKey().$defaultFn(() => uuid()),
  originalText: text("original_text").notNull(), // Raw voice transcription
  rephrasedText: text("rephrased_text").notNull(), // AI-rephrased version
  wasSpoken: integer("was_spoken", { mode: "boolean" }).notNull().default(false), // Was it sent to TTS
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/* ================================
   Authenticated Users (OAuth)
================================ */
export const authenticatedUsers = sqliteTable("authenticated_users", {
  id: text("id").primaryKey().$defaultFn(() => uuid()),
  twitchUserId: text("twitch_user_id").notNull().unique(),
  twitchUsername: text("twitch_username").notNull(),
  twitchDisplayName: text("twitch_display_name").notNull(),
  twitchProfileImageUrl: text("twitch_profile_image_url"),
  twitchEmail: text("twitch_email"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: integer("token_expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/* ================================
   Raids
================================ */
export const raids = sqliteTable("raids", {
  id: text("id").primaryKey().$defaultFn(() => uuid()),
  fromUserId: text("from_user_id").notNull(), // Raider's Twitch user ID
  fromUsername: text("from_username").notNull(), // Raider's username
  fromDisplayName: text("from_display_name").notNull(), // Raider's display name
  viewers: integer("viewers").notNull().default(0), // Number of viewers in raid
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/* ================================
   Moderation Actions
================================ */
export const moderationActions = sqliteTable("moderation_actions", {
  id: text("id").primaryKey().$defaultFn(() => uuid()),
  actionType: text("action_type").notNull(), // timeout, ban, delete, clear
  targetUserId: text("target_user_id"), // User being moderated
  targetUsername: text("target_username").notNull(), // Username of moderated user
  moderatorId: text("moderator_id"), // Moderator's user ID
  moderatorUsername: text("moderator_username"), // Moderator's username
  duration: integer("duration"), // Timeout duration in seconds (null for ban/delete)
  reason: text("reason"), // Reason for action
  messageDeleted: text("message_deleted"), // Message text if deleted
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/* ================================
   Settings (incl. DachiPool)
================================ */
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().$defaultFn(() => uuid()),
  twitchChannel: text("twitch_channel"),
  twitchUsername: text("twitch_username"),
  autoModeration: integer("auto_moderation", { mode: "boolean" }).notNull().default(false),
  sentimentThreshold: integer("sentiment_threshold").notNull().default(2), // 1-5
  enableAiAnalysis: integer("enable_ai_analysis", { mode: "boolean" }).notNull().default(true),

  // Browser Source Settings
  browserSourceEnabled: integer("browser_source_enabled", { mode: "boolean" }).notNull().default(false),
  browserSourceToken: text("browser_source_token"), // Unique token for OBS URL

  // DachiPool Settings
  dachipoolEnabled: integer("dachipool_enabled", { mode: "boolean" }).notNull().default(true),
  dachipoolMaxChars: integer("dachipool_max_chars").notNull().default(1000),
  dachipoolEnergy: text("dachipool_energy").notNull().default("Balanced"), // Balanced, High, Low
  dachipoolMode: text("dachipool_mode").notNull().default("Auto"), // Auto, Manual
  dachipoolShoutoutCooldownHours: integer("dachipool_shoutout_cooldown_hours").notNull().default(24),
  dachipoolAiModel: text("dachipool_ai_model").notNull().default("llama-3.3-70b-versatile"),
  dachipoolAiTemp: integer("dachipool_ai_temp").notNull().default(7), // store 0-10
  aiPersonality: text("ai_personality").notNull().default("Casual"),
  autoShoutoutsEnabled: integer("auto_shoutouts_enabled", { mode: "boolean" }).notNull().default(true),

  // Audio Settings
  audioMicMode: text("audio_mic_mode").notNull().default("muted"), // muted, passthrough
  audioVoiceSelection: text("audio_voice_selection").default("Default"),
  audioAiVoiceActive: integer("audio_ai_voice_active", { mode: "boolean" }).notNull().default(true),
  audioSpeechCleanup: integer("audio_speech_cleanup", { mode: "boolean" }).notNull().default(true),
  audioFallbackToTextOnly: integer("audio_fallback_to_text_only", { mode: "boolean" }).notNull().default(true),
  audioCooldownBetweenReplies: integer("audio_cooldown_between_replies").notNull().default(5), // seconds
  audioMaxVoiceLength: integer("audio_max_voice_length").notNull().default(500), // characters

  // Web Speech API TTS Settings
  ttsEnabled: integer("tts_enabled", { mode: "boolean" }).notNull().default(false),
  ttsVoice: text("tts_voice"), // Voice name
  ttsPitch: integer("tts_pitch").notNull().default(10), // 5-20 (0.5-2.0), divide by 10
  ttsRate: integer("tts_rate").notNull().default(10), // 5-20 (0.5-2.0), divide by 10
  ttsVolume: integer("tts_volume").notNull().default(10), // 0-10 (0.0-1.0), divide by 10

  // Voice AI Personality Settings
  voiceAiPersonality: text("voice_ai_personality").notNull().default("Neutral"), // Neutral, Quirky, Funny, etc.
  voiceAiPitch: integer("voice_ai_pitch").notNull().default(10), // 5-20
  voiceAiSpeed: integer("voice_ai_speed").notNull().default(10), // 5-20

  // Topic Filters
  topicAllowlist: text("topic_allowlist", { mode: "json" }).$type<string[]>().default(sql`'["gaming","anime","chatting"]'`),
  topicBlocklist: text("topic_blocklist", { mode: "json" }).$type<string[]>().default(sql`'["politics","religion"]'`),
  useDatabasePersonalization: integer("use_database_personalization", { mode: "boolean" }).notNull().default(true),
  streamerVoiceOnlyMode: integer("streamer_voice_only_mode", { mode: "boolean" }).notNull().default(false),

  // DachiStream Settings
  dachiastreamSelectionStrategy: text("dachiastream_selection_strategy").notNull().default("most_active"),
  dachiastreamPaused: integer("dachiastream_paused", { mode: "boolean" }).notNull().default(false),
  dachiastreamAutoSendToChat: integer("dachiastream_auto_send_to_chat", { mode: "boolean" }).notNull().default(false),
  dachiastreamCycleInterval: integer("dachiastream_cycle_interval").notNull().default(15), // seconds between cycles (5-60)

  // Dashboard Settings
  streamSessionStarted: integer("stream_session_started", { mode: "timestamp" }),
  dashboardShowTotalMessages: integer("dashboard_show_total_messages", { mode: "boolean" }).notNull().default(true),
  dashboardShowAiAnalyzed: integer("dashboard_show_ai_analyzed", { mode: "boolean" }).notNull().default(true),
  dashboardShowActiveUsers: integer("dashboard_show_active_users", { mode: "boolean" }).notNull().default(true),
  dashboardShowModActions: integer("dashboard_show_mod_actions", { mode: "boolean" }).notNull().default(true),

  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/* ================================
   Follower Events
================================ */
export const followerEvents = sqliteTable("follower_events", {
  id: text("id").primaryKey().$defaultFn(() => uuid()),
  userId: text("user_id").notNull(), // Twitch user ID
  username: text("username").notNull(),
  eventType: text("event_type").notNull(), // follow, unfollow, subscribe, etc.
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),

  // Event-specific data
  tier: text("tier"), // For subs: "1000", "2000", "3000"
  months: integer("months"), // For resubs: cumulative months
  bits: integer("bits"), // For cheers: amount of bits
  giftedBy: text("gifted_by"), // For gift subs: who gifted
  message: text("message"), // Optional message with event

  // Follower-specific tracking
  followedAt: integer("followed_at", { mode: "timestamp" }), // When first followed
  isFollower: integer("is_follower", { mode: "boolean" }), // Current follower status at time of event
});

/* ================================
   Relations
================================ */
export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  analysis: one(aiAnalysis, {
    fields: [chatMessages.id],
    references: [aiAnalysis.messageId],
  }),
}));

export const aiAnalysisRelations = relations(aiAnalysis, ({ one }) => ({
  message: one(chatMessages, {
    fields: [aiAnalysis.messageId],
    references: [chatMessages.id],
  }),
}));

/* ================================
   Insert Schemas
================================ */
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  firstSeen: true,
  lastSeen: true,
});

export const insertUserInsightSchema = createInsertSchema(userInsights).omit({
  lastUpdated: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertAiAnalysisSchema = createInsertSchema(aiAnalysis).omit({
  id: true,
  timestamp: true,
});

export const insertAiCommandSchema = createInsertSchema(aiCommands).omit({
  id: true,
  usageCount: true,
  createdAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertVoiceAiResponseSchema = createInsertSchema(voiceAiResponses).omit({
  id: true,
  timestamp: true,
});

export const insertAuthenticatedUserSchema = createInsertSchema(authenticatedUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRaidSchema = createInsertSchema(raids).omit({
  id: true,
  timestamp: true,
});

export const insertModerationActionSchema = createInsertSchema(moderationActions).omit({
  id: true,
  timestamp: true,
});

export const insertFollowerEventSchema = createInsertSchema(followerEvents).omit({
  id: true,
  timestamp: true,
});

/* ================================
   Types
================================ */
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type UserInsight = typeof userInsights.$inferSelect;
export type InsertUserInsight = z.infer<typeof insertUserInsightSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type AiAnalysis = typeof aiAnalysis.$inferSelect;
export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;

export type AiCommand = typeof aiCommands.$inferSelect;
export type InsertAiCommand = z.infer<typeof insertAiCommandSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type VoiceAiResponse = typeof voiceAiResponses.$inferSelect;
export type InsertVoiceAiResponse = z.infer<typeof insertVoiceAiResponseSchema>;

export type AuthenticatedUser = typeof authenticatedUsers.$inferSelect;
export type InsertAuthenticatedUser = z.infer<typeof insertAuthenticatedUserSchema>;

export type Raid = typeof raids.$inferSelect;
export type InsertRaid = z.infer<typeof insertRaidSchema>;

export type ModerationAction = typeof moderationActions.$inferSelect;
export type InsertModerationAction = z.infer<typeof insertModerationActionSchema>;

export type FollowerEvent = typeof followerEvents.$inferSelect;
export type InsertFollowerEvent = z.infer<typeof insertFollowerEventSchema>;

/* ================================
   Extended types for frontend
================================ */
export type ChatMessageWithAnalysis = ChatMessage & { analysis?: AiAnalysis };
export type UserProfileWithInsight = UserProfile & { insight?: UserInsight };
