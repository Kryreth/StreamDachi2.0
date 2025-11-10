"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertFollowerEventSchema = exports.insertModerationActionSchema = exports.insertRaidSchema = exports.insertAuthenticatedUserSchema = exports.insertVoiceAiResponseSchema = exports.insertSettingsSchema = exports.insertAiCommandSchema = exports.insertAiAnalysisSchema = exports.insertChatMessageSchema = exports.insertUserInsightSchema = exports.insertUserProfileSchema = exports.aiAnalysisRelations = exports.chatMessagesRelations = exports.followerEvents = exports.settings = exports.moderationActions = exports.raids = exports.authenticatedUsers = exports.voiceAiResponses = exports.aiCommands = exports.aiAnalysis = exports.chatMessages = exports.userInsights = exports.userProfiles = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_zod_1 = require("drizzle-zod");
const drizzle_orm_2 = require("drizzle-orm");
const crypto_1 = require("node:crypto");
// Fixed: node:crypto import and verified consistency
