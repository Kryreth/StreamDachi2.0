"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertFollowerEventSchema = exports.insertModerationActionSchema = exports.insertRaidSchema = exports.insertAuthenticatedUserSchema = exports.insertVoiceAiResponseSchema = exports.insertSettingsSchema = exports.insertAiCommandSchema = exports.insertAiAnalysisSchema = exports.insertChatMessageSchema = exports.insertUserInsightSchema = exports.insertUserProfileSchema = exports.aiAnalysisRelations = exports.chatMessagesRelations = exports.followerEvents = exports.settings = exports.moderationActions = exports.raids = exports.authenticatedUsers = exports.voiceAiResponses = exports.aiCommands = exports.aiAnalysis = exports.chatMessages = exports.userInsights = exports.userProfiles = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_zod_1 = require("drizzle-zod");
const drizzle_orm_2 = require("drizzle-orm");
const crypto_1 = require("crypto");
// Helper for UUID generation in SQLite
const uuid = () => (0, crypto_1.randomUUID)();
// User Profiles Table - Track VIP/Mod/Subscriber status + Personality Profiling
exports.userProfiles = (0, sqlite_core_1.sqliteTable)("user_profiles", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => uuid()),
    userId: (0, sqlite_core_1.text)("user_id").notNull().unique(), // Twitch user ID
    username: (0, sqlite_core_1.text)("username").notNull(),
    isVip: (0, sqlite_core_1.integer)("is_vip", { mode: 'boolean' }).notNull().default(false),
    isMod: (0, sqlite_core_1.integer)("is_mod", { mode: 'boolean' }).notNull().default(false),
    isSubscriber: (0, sqlite_core_1.integer)("is_subscriber", { mode: 'boolean' }).notNull().default(false),
    channelPointsBalance: (0, sqlite_core_1.integer)("channel_points_balance").default(0),
    wasAnonymous: (0, sqlite_core_1.integer)("was_anonymous", { mode: 'boolean' }).notNull().default(false),
    firstSeen: (0, sqlite_core_1.integer)("first_seen", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    lastSeen: (0, sqlite_core_1.integer)("last_seen", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    shoutoutLastGiven: (0, sqlite_core_1.integer)("shoutout_last_given", { mode: 'timestamp' }),
    // Personality Tracking (1-10 scale, measured over time by AI)
    humorLevel: (0, sqlite_core_1.integer)("humor_level").default(5),
    knowledgeLevel: (0, sqlite_core_1.integer)("knowledge_level").default(5),
    bluntnessLevel: (0, sqlite_core_1.integer)("bluntness_level").default(5),
    rudenessLevel: (0, sqlite_core_1.integer)("rudeness_level").default(5),
    // Profile Information (NO PII - usernames, roles, preferences only)
    timezone: (0, sqlite_core_1.text)("timezone"),
    twitchUrl: (0, sqlite_core_1.text)("twitch_url"),
    previousNames: (0, sqlite_core_1.text)("previous_names", { mode: 'json' }).$type().default((0, drizzle_orm_1.sql) `'[]'`),
    hobbies: (0, sqlite_core_1.text)("hobbies", { mode: 'json' }).$type().default((0, drizzle_orm_1.sql) `'[]'`),
    likes: (0, sqlite_core_1.text)("likes", { mode: 'json' }).$type().default((0, drizzle_orm_1.sql) `'[]'`),
    dislikes: (0, sqlite_core_1.text)("dislikes", { mode: 'json' }).$type().default((0, drizzle_orm_1.sql) `'[]'`),
    // Social Media & Links (URLs only, no PII)
    profilePictureUrl: (0, sqlite_core_1.text)("profile_picture_url"),
    socials: (0, sqlite_core_1.text)("socials", { mode: 'json' }).$type().default((0, drizzle_orm_1.sql) `'{}'`),
    customLinks: (0, sqlite_core_1.text)("custom_links", { mode: 'json' }).$type().default((0, drizzle_orm_1.sql) `'[]'`),
});
// User Insights Table - AI Learning Engine
exports.userInsights = (0, sqlite_core_1.sqliteTable)("user_insights", {
    userId: (0, sqlite_core_1.text)("user_id").primaryKey(),
    summary: (0, sqlite_core_1.text)("summary"),
    lastUpdated: (0, sqlite_core_1.integer)("last_updated", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    totalMessages: (0, sqlite_core_1.integer)("total_messages").notNull().default(0),
    recentTags: (0, sqlite_core_1.text)("recent_tags", { mode: 'json' }).$type().default((0, drizzle_orm_1.sql) `'[]'`),
});
// Chat Messages Table - Enhanced with stream tracking
exports.chatMessages = (0, sqlite_core_1.sqliteTable)("chat_messages", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => uuid()),
    userId: (0, sqlite_core_1.text)("user_id"),
    username: (0, sqlite_core_1.text)("username").notNull(),
    message: (0, sqlite_core_1.text)("message").notNull(),
    channel: (0, sqlite_core_1.text)("channel").notNull(),
    streamId: (0, sqlite_core_1.text)("stream_id"),
    eventType: (0, sqlite_core_1.text)("event_type").notNull().default("chat"),
    timestamp: (0, sqlite_core_1.integer)("timestamp", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    userColor: (0, sqlite_core_1.text)("user_color"),
    badges: (0, sqlite_core_1.text)("badges", { mode: 'json' }).$type(),
    emotes: (0, sqlite_core_1.text)("emotes", { mode: 'json' }),
    metadata: (0, sqlite_core_1.text)("metadata", { mode: 'json' }),
});
// AI Analysis Table - Enhanced with emotions and intent
exports.aiAnalysis = (0, sqlite_core_1.sqliteTable)("ai_analysis", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => uuid()),
    messageId: (0, sqlite_core_1.text)("message_id").notNull().references(() => exports.chatMessages.id, { onDelete: "cascade" }),
    sentiment: (0, sqlite_core_1.text)("sentiment").notNull(),
    sentimentScore: (0, sqlite_core_1.integer)("sentiment_score").notNull(),
    toxicity: (0, sqlite_core_1.integer)("toxicity", { mode: 'boolean' }).notNull().default(false),
    categories: (0, sqlite_core_1.text)("categories", { mode: 'json' }).$type(),
    // Enhanced Emotion Analysis
    emotions: (0, sqlite_core_1.text)("emotions", { mode: 'json' }).$type().default((0, drizzle_orm_1.sql) `'[]'`), // All detected emotions
    primaryEmotion: (0, sqlite_core_1.text)("primary_emotion"), // Main emotion: comedy, serious, playful, sarcastic, angry, excited, supportive, confused, etc.
    emotionIntensity: (0, sqlite_core_1.integer)("emotion_intensity").default(5), // 1-10 scale
    // Intent Detection
    intent: (0, sqlite_core_1.text)("intent"), // joking, asking_question, being_supportive, trolling, sharing_info, requesting_help, etc.
    intentConfidence: (0, sqlite_core_1.integer)("intent_confidence").default(5), // 1-10 confidence scale
    // Context Understanding
    isQuestion: (0, sqlite_core_1.integer)("is_question", { mode: 'boolean' }).default(false),
    isCommand: (0, sqlite_core_1.integer)("is_command", { mode: 'boolean' }).default(false),
    requiresResponse: (0, sqlite_core_1.integer)("requires_response", { mode: 'boolean' }).default(false),
    timestamp: (0, sqlite_core_1.integer)("timestamp", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
// AI Commands Table
exports.aiCommands = (0, sqlite_core_1.sqliteTable)("ai_commands", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => uuid()),
    trigger: (0, sqlite_core_1.text)("trigger").notNull().unique(),
    prompt: (0, sqlite_core_1.text)("prompt").notNull(),
    responseType: (0, sqlite_core_1.text)("response_type").notNull(),
    enabled: (0, sqlite_core_1.integer)("enabled", { mode: 'boolean' }).notNull().default(true),
    usageCount: (0, sqlite_core_1.integer)("usage_count").notNull().default(0),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
// Voice AI Responses Table - History of voice transcriptions and AI rephrasing
exports.voiceAiResponses = (0, sqlite_core_1.sqliteTable)("voice_ai_responses", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => uuid()),
    originalText: (0, sqlite_core_1.text)("original_text").notNull(),
    rephrasedText: (0, sqlite_core_1.text)("rephrased_text").notNull(),
    wasSpoken: (0, sqlite_core_1.integer)("was_spoken", { mode: 'boolean' }).notNull().default(false),
    timestamp: (0, sqlite_core_1.integer)("timestamp", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
// Authenticated Users Table - OAuth Login
exports.authenticatedUsers = (0, sqlite_core_1.sqliteTable)("authenticated_users", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => uuid()),
    twitchUserId: (0, sqlite_core_1.text)("twitch_user_id").notNull().unique(),
    twitchUsername: (0, sqlite_core_1.text)("twitch_username").notNull(),
    twitchDisplayName: (0, sqlite_core_1.text)("twitch_display_name").notNull(),
    twitchProfileImageUrl: (0, sqlite_core_1.text)("twitch_profile_image_url"),
    twitchEmail: (0, sqlite_core_1.text)("twitch_email"),
    accessToken: (0, sqlite_core_1.text)("access_token").notNull(),
    refreshToken: (0, sqlite_core_1.text)("refresh_token"),
    tokenExpiresAt: (0, sqlite_core_1.integer)("token_expires_at", { mode: 'timestamp' }),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
// Raids Table - Track incoming raids
exports.raids = (0, sqlite_core_1.sqliteTable)("raids", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => uuid()),
    fromUserId: (0, sqlite_core_1.text)("from_user_id").notNull(),
    fromUsername: (0, sqlite_core_1.text)("from_username").notNull(),
    fromDisplayName: (0, sqlite_core_1.text)("from_display_name").notNull(),
    viewers: (0, sqlite_core_1.integer)("viewers").notNull().default(0),
    timestamp: (0, sqlite_core_1.integer)("timestamp", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
// Moderation Actions Table - Track Twitch mod events
exports.moderationActions = (0, sqlite_core_1.sqliteTable)("moderation_actions", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => uuid()),
    actionType: (0, sqlite_core_1.text)("action_type").notNull(),
    targetUserId: (0, sqlite_core_1.text)("target_user_id"),
    targetUsername: (0, sqlite_core_1.text)("target_username").notNull(),
    moderatorId: (0, sqlite_core_1.text)("moderator_id"),
    moderatorUsername: (0, sqlite_core_1.text)("moderator_username"),
    duration: (0, sqlite_core_1.integer)("duration"),
    reason: (0, sqlite_core_1.text)("reason"),
    messageDeleted: (0, sqlite_core_1.text)("message_deleted"),
    timestamp: (0, sqlite_core_1.integer)("timestamp", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
// Settings Table - Enhanced with DachiPool configuration
exports.settings = (0, sqlite_core_1.sqliteTable)("settings", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => uuid()),
    twitchChannel: (0, sqlite_core_1.text)("twitch_channel"),
    twitchUsername: (0, sqlite_core_1.text)("twitch_username"),
    autoModeration: (0, sqlite_core_1.integer)("auto_moderation", { mode: 'boolean' }).notNull().default(false),
    sentimentThreshold: (0, sqlite_core_1.integer)("sentiment_threshold").notNull().default(2),
    enableAiAnalysis: (0, sqlite_core_1.integer)("enable_ai_analysis", { mode: 'boolean' }).notNull().default(true),
    // Browser Source Settings
    browserSourceEnabled: (0, sqlite_core_1.integer)("browser_source_enabled", { mode: 'boolean' }).notNull().default(false),
    browserSourceToken: (0, sqlite_core_1.text)("browser_source_token"),
    // DachiPool Settings
    dachipoolEnabled: (0, sqlite_core_1.integer)("dachipool_enabled", { mode: 'boolean' }).notNull().default(true),
    dachipoolMaxChars: (0, sqlite_core_1.integer)("dachipool_max_chars").notNull().default(1000),
    dachipoolEnergy: (0, sqlite_core_1.text)("dachipool_energy").notNull().default("Balanced"),
    dachipoolMode: (0, sqlite_core_1.text)("dachipool_mode").notNull().default("Auto"),
    dachipoolShoutoutCooldownHours: (0, sqlite_core_1.integer)("dachipool_shoutout_cooldown_hours").notNull().default(24),
    dachipoolAiModel: (0, sqlite_core_1.text)("dachipool_ai_model").notNull().default("llama-3.3-70b-versatile"),
    dachipoolAiTemp: (0, sqlite_core_1.integer)("dachipool_ai_temp").notNull().default(7),
    aiPersonality: (0, sqlite_core_1.text)("ai_personality").notNull().default("Casual"),
    autoShoutoutsEnabled: (0, sqlite_core_1.integer)("auto_shoutouts_enabled", { mode: 'boolean' }).notNull().default(true),
    // Audio Settings
    audioMicMode: (0, sqlite_core_1.text)("audio_mic_mode").notNull().default("muted"),
    audioVoiceSelection: (0, sqlite_core_1.text)("audio_voice_selection").default("Default"),
    audioAiVoiceActive: (0, sqlite_core_1.integer)("audio_ai_voice_active", { mode: 'boolean' }).notNull().default(true),
    audioSpeechCleanup: (0, sqlite_core_1.integer)("audio_speech_cleanup", { mode: 'boolean' }).notNull().default(true),
    audioFallbackToTextOnly: (0, sqlite_core_1.integer)("audio_fallback_to_text_only", { mode: 'boolean' }).notNull().default(true),
    audioCooldownBetweenReplies: (0, sqlite_core_1.integer)("audio_cooldown_between_replies").notNull().default(5),
    audioMaxVoiceLength: (0, sqlite_core_1.integer)("audio_max_voice_length").notNull().default(500),
    // Web Speech API TTS Settings
    ttsEnabled: (0, sqlite_core_1.integer)("tts_enabled", { mode: 'boolean' }).notNull().default(false),
    ttsVoice: (0, sqlite_core_1.text)("tts_voice"),
    ttsPitch: (0, sqlite_core_1.integer)("tts_pitch").notNull().default(10),
    ttsRate: (0, sqlite_core_1.integer)("tts_rate").notNull().default(10),
    ttsVolume: (0, sqlite_core_1.integer)("tts_volume").notNull().default(10),
    // Voice AI Personality Settings (for Groq rephrasing + Puter.js TTS)
    voiceAiPersonality: (0, sqlite_core_1.text)("voice_ai_personality").notNull().default("Neutral"),
    voiceAiPitch: (0, sqlite_core_1.integer)("voice_ai_pitch").notNull().default(10),
    voiceAiSpeed: (0, sqlite_core_1.integer)("voice_ai_speed").notNull().default(10),
    // Topic Filters
    topicAllowlist: (0, sqlite_core_1.text)("topic_allowlist", { mode: 'json' }).$type().default((0, drizzle_orm_1.sql) `'["gaming", "anime", "chatting"]'`),
    topicBlocklist: (0, sqlite_core_1.text)("topic_blocklist", { mode: 'json' }).$type().default((0, drizzle_orm_1.sql) `'["politics", "religion"]'`),
    useDatabasePersonalization: (0, sqlite_core_1.integer)("use_database_personalization", { mode: 'boolean' }).notNull().default(true),
    streamerVoiceOnlyMode: (0, sqlite_core_1.integer)("streamer_voice_only_mode", { mode: 'boolean' }).notNull().default(false),
    // DachiStream Settings
    dachiastreamSelectionStrategy: (0, sqlite_core_1.text)("dachiastream_selection_strategy").notNull().default("most_active"),
    dachiastreamPaused: (0, sqlite_core_1.integer)("dachiastream_paused", { mode: 'boolean' }).notNull().default(false),
    dachiastreamAutoSendToChat: (0, sqlite_core_1.integer)("dachiastream_auto_send_to_chat", { mode: 'boolean' }).notNull().default(false),
    dachiastreamCycleInterval: (0, sqlite_core_1.integer)("dachiastream_cycle_interval").notNull().default(15),
    // Dashboard Settings
    streamSessionStarted: (0, sqlite_core_1.integer)("stream_session_started", { mode: 'timestamp' }),
    dashboardShowTotalMessages: (0, sqlite_core_1.integer)("dashboard_show_total_messages", { mode: 'boolean' }).notNull().default(true),
    dashboardShowAiAnalyzed: (0, sqlite_core_1.integer)("dashboard_show_ai_analyzed", { mode: 'boolean' }).notNull().default(true),
    dashboardShowActiveUsers: (0, sqlite_core_1.integer)("dashboard_show_active_users", { mode: 'boolean' }).notNull().default(true),
    dashboardShowModActions: (0, sqlite_core_1.integer)("dashboard_show_mod_actions", { mode: 'boolean' }).notNull().default(true),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
// Follower Events Table - Track follows, unfollows, subs, bits
exports.followerEvents = (0, sqlite_core_1.sqliteTable)("follower_events", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: (0, sqlite_core_1.text)("user_id").notNull(), // Twitch user ID
    username: (0, sqlite_core_1.text)("username").notNull(),
    eventType: (0, sqlite_core_1.text)("event_type").notNull(), // follow, unfollow, subscribe, resubscribe, gift_sub, cheer
    timestamp: (0, sqlite_core_1.integer)("timestamp", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    // Event-specific data
    tier: (0, sqlite_core_1.text)("tier"), // For subs: "1000", "2000", "3000"
    months: (0, sqlite_core_1.integer)("months"), // For resubs: cumulative months
    bits: (0, sqlite_core_1.integer)("bits"), // For cheers: amount of bits
    giftedBy: (0, sqlite_core_1.text)("gifted_by"), // For gift subs: who gifted
    message: (0, sqlite_core_1.text)("message"), // Optional message with event
    // Follower-specific tracking
    followedAt: (0, sqlite_core_1.integer)("followed_at", { mode: "timestamp" }), // When they first followed (for follow events)
    isFollower: (0, sqlite_core_1.integer)("is_follower", { mode: "boolean" }), // Current follower status at time of event
});
// Relations
exports.chatMessagesRelations = (0, drizzle_orm_2.relations)(exports.chatMessages, ({ one }) => ({
    analysis: one(exports.aiAnalysis, {
        fields: [exports.chatMessages.id],
        references: [exports.aiAnalysis.messageId],
    }),
}));
exports.aiAnalysisRelations = (0, drizzle_orm_2.relations)(exports.aiAnalysis, ({ one }) => ({
    message: one(exports.chatMessages, {
        fields: [exports.aiAnalysis.messageId],
        references: [exports.chatMessages.id],
    }),
}));
// Insert Schemas (same as PostgreSQL version)
exports.insertUserProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userProfiles).omit({
    id: true,
    firstSeen: true,
    lastSeen: true,
});
exports.insertUserInsightSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userInsights).omit({
    lastUpdated: true,
});
exports.insertChatMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.chatMessages).omit({
    id: true,
    timestamp: true,
});
exports.insertAiAnalysisSchema = (0, drizzle_zod_1.createInsertSchema)(exports.aiAnalysis).omit({
    id: true,
    timestamp: true,
});
exports.insertAiCommandSchema = (0, drizzle_zod_1.createInsertSchema)(exports.aiCommands).omit({
    id: true,
    usageCount: true,
    createdAt: true,
});
exports.insertSettingsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.settings).omit({
    id: true,
    updatedAt: true,
});
exports.insertVoiceAiResponseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.voiceAiResponses).omit({
    id: true,
    timestamp: true,
});
exports.insertAuthenticatedUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.authenticatedUsers).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertRaidSchema = (0, drizzle_zod_1.createInsertSchema)(exports.raids).omit({
    id: true,
    timestamp: true,
});
exports.insertModerationActionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.moderationActions).omit({
    id: true,
    timestamp: true,
});
exports.insertFollowerEventSchema = (0, drizzle_zod_1.createInsertSchema)(exports.followerEvents).omit({
    id: true,
    timestamp: true,
});
