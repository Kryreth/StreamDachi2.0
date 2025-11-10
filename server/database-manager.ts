import fs from 'node:fs/promises';
import path from 'node:path';
import type { UserProfile, ChatMessage, AiAnalysis } from '@shared/schema';

const DATABASE_ROOT = path.join(process.cwd(), 'DATABASE');
const USERS_DIR = path.join(DATABASE_ROOT, 'users');
const SESSIONS_DIR = path.join(DATABASE_ROOT, 'sessions');
const ANALYTICS_DIR = path.join(DATABASE_ROOT, 'analytics');

export interface UserDatabaseFolder {
  userId: string;
  username: string;
  profile: UserProfile | null;
  messages: ChatMessage[];
  analysis: AiAnalysis[];
  totalMessages: number;
  lastActive: Date | null;
}

export interface VibeReport {
  userId: string;
  username: string;
  sessionDate: string;
  emotionBreakdown: Record<string, number>;
  intentBreakdown: Record<string, number>;
  topEmotions: Array<{ emotion: string; count: number; percentage: number }>;
  topIntents: Array<{ intent: string; count: number; percentage: number }>;
  averageEmotionIntensity: number;
  totalMessages: number;
  questionsAsked: number;
  commandsUsed: number;
  needsResponse: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  vibeScore: number;
  summary: string;
}

export class DatabaseManager {
  async ensureDirectories(): Promise<void> {
    await fs.mkdir(USERS_DIR, { recursive: true });
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
    await fs.mkdir(ANALYTICS_DIR, { recursive: true });
  }

  async getUserFolder(userId: string): Promise<string> {
    const userDir = path.join(USERS_DIR, userId);
    await fs.mkdir(userDir, { recursive: true });
    await fs.mkdir(path.join(userDir, 'vibe_summaries'), { recursive: true });
    return userDir;
  }

  async saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
    const userDir = await this.getUserFolder(userId);
    const profilePath = path.join(userDir, 'profile.json');
    await fs.writeFile(profilePath, JSON.stringify(profile, null, 2));
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDir = await this.getUserFolder(userId);
      const profilePath = path.join(userDir, 'profile.json');
      const data = await fs.readFile(profilePath, 'utf-8');
      return JSON.parse(data);
    }
}

  async appendUserMessage(userId: string, message: ChatMessage, analysis?: AiAnalysis): Promise<void> {
    const userDir = await this.getUserFolder(userId);
    const messagesPath = path.join(userDir, 'messages.json');
    
    let messages: any[] = [];
    try {
      const data = await fs.readFile(messagesPath, 'utf-8');
      messages = JSON.parse(data);
    } catch (error) {
      messages = [];
    }

    messages.push({
      ...message,
      analysis: analysis || null,
      savedAt: new Date().toISOString(),
    });

    await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2));
  }

  async getUserMessages(userId: string): Promise<ChatMessage[]> {
    try {
      const userDir = await this.getUserFolder(userId);
      const messagesPath = path.join(userDir, 'messages.json');
      const data = await fs.readFile(messagesPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveVibeReport(userId: string, username: string, report: VibeReport): Promise<void> {
    const userDir = await this.getUserFolder(userId);
    const vibeDir = path.join(userDir, 'vibe_summaries');
    const reportPath = path.join(vibeDir, `${report.sessionDate}.json`);
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    const indexPath = path.join(vibeDir, 'index.json');
    let index: any[] = [];
    try {
      const data = await fs.readFile(indexPath, 'utf-8');
      index = JSON.parse(data);
    } catch (error) {
      index = [];
    }

    const existingIndex = index.findIndex((r) => r.sessionDate === report.sessionDate);
    if (existingIndex >= 0) {
      index[existingIndex] = {
        sessionDate: report.sessionDate,
        vibeScore: report.vibeScore,
        totalMessages: report.totalMessages,
        topEmotion: report.topEmotions[0]?.emotion || 'neutral',
        summary: report.summary,
      };
    } else {
      index.push({
        sessionDate: report.sessionDate,
        vibeScore: report.vibeScore,
        totalMessages: report.totalMessages,
        topEmotion: report.topEmotions[0]?.emotion || 'neutral',
        summary: report.summary,
      });
    }

    index.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  }

  async getVibeReports(userId: string): Promise<any[]> {
    try {
      const userDir = await this.getUserFolder(userId);
      const vibeDir = path.join(userDir, 'vibe_summaries');
      const indexPath = path.join(vibeDir, 'index.json');
      const data = await fs.readFile(indexPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async getVibeReport(userId: string, sessionDate: string): Promise<VibeReport | null> {
    try {
      const userDir = await this.getUserFolder(userId);
      const reportPath = path.join(userDir, 'vibe_summaries', `${sessionDate}.json`);
      const data = await fs.readFile(reportPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  async getAllUserFolders(): Promise<UserDatabaseFolder[]> {
    try {
      const userIds = await fs.readdir(USERS_DIR);
      const folders: UserDatabaseFolder[] = [];

      for (const userId of userIds) {
        const userDir = path.join(USERS_DIR, userId);
        const stat = await fs.stat(userDir);
        if (!stat.isDirectory()) continue;

        const profile = await this.getUserProfile(userId);
        const messages = await this.getUserMessages(userId);

        folders.push({
          userId,
          username: profile?.username || 'Unknown',
          profile,
          messages,
          analysis: messages.map((m: any) => m.analysis).filter(Boolean),
          totalMessages: messages.length,
          lastActive: messages.length > 0 
            ? new Date(Math.max(...messages.map((m: any) => new Date(m.timestamp || m.savedAt).getTime())))
            : null,
        });
      }

      folders.sort((a, b) => {
        if (!a.lastActive) return 1;
        if (!b.lastActive) return -1;
        return b.lastActive.getTime() - a.lastActive.getTime();
      });

      return folders;
    } catch (error) {
      console.error('Error getting user folders:', error);
      return [];
    }
  }

  async exportUserData(userId: string): Promise<{ profile: any; messages: any[]; vibeReports: any[] }> {
    const profile = await this.getUserProfile(userId);
    const messages = await this.getUserMessages(userId);
    const vibeReports = await this.getVibeReports(userId);

    return {
      profile,
      messages,
      vibeReports,
    };
  }
}

export const databaseManager = new DatabaseManager();
