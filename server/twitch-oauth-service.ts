```ts
export interface TwitchTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
  email?: string;
}

export interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
}

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || "";
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/twitch/callback`
  : "http://localhost:5000/api/auth/twitch/callback";

export class TwitchOAuthService {
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "user:read:email chat:read chat:edit channel:manage:raids",
    });
    return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<TwitchTokenResponse> {
    const params = new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    });

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    return await response.json();
  }

  async getTwitchUser(accessToken: string): Promise<TwitchUser> {
    const response = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": TWITCH_CLIENT_ID,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch Twitch user: ${error}`);
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      throw new Error("No user data returned from Twitch");
    }

    return data.data[0];
  }

  async refreshAccessToken(refreshToken: string): Promise<TwitchTokenResponse> {
    const params = new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh access token: ${error}`);
    }

    return await response.json();
  }

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch("https://id.twitch.tv/oauth2/validate", {
        headers: { Authorization: `OAuth ${accessToken}` },
      });
      return response.ok;
    } catch (error) {
      console.error("Error validating Twitch token:", error);
      return false;
    }
  }

  isTokenExpired(tokenExpiresAt: Date | null): boolean {
    if (!tokenExpiresAt) return true;
    const now = new Date();
    const expiresAt = new Date(tokenExpiresAt);
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    return expiresAt <= oneHourFromNow;
  }

  private appAccessToken: string | null = null;
  private appTokenExpiry: Date | null = null;

  async getAppAccessToken(): Promise<string> {
    if (this.appAccessToken && this.appTokenExpiry && this.appTokenExpiry > new Date()) {
      return this.appAccessToken;
    }

    const params = new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
    });

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get app access token: ${error}`);
    }

    const data = await response.json();
    this.appAccessToken = data.access_token || null;
    this.appTokenExpiry = new Date(Date.now() + (data.expires_in || 3600) * 1000);

    if (!this.appAccessToken) {
      throw new Error("No access token received from Twitch");
    }

    return this.appAccessToken;
  }

  async searchUsers(query: string): Promise<TwitchUser[]> {
    if (!query || query.length < 1) {
      return [];
    }

    const appToken = await this.getAppAccessToken();
    const response = await fetch(
      `https://api.twitch.tv/helix/search/channels?query=${encodeURIComponent(query)}&first=20`,
      {
        headers: {
          Authorization: `Bearer ${appToken}`,
          "Client-Id": TWITCH_CLIENT_ID,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to search Twitch users: ${error}`);
    }

    const data = await response.json();
    return (data.data || []).map((channel: any) => ({
      id: channel.broadcaster_id,
      login: channel.broadcaster_login,
      display_name: channel.display_name,
      profile_image_url: channel.thumbnail_url,
    }));
  }

  async startRaid(fromBroadcasterId: string, toBroadcasterId: string, accessToken: string): Promise<boolean> {
    const params = new URLSearchParams({
      from_broadcaster_id: fromBroadcasterId,
      to_broadcaster_id: toBroadcasterId,
    });

    const response = await fetch(`https://api.twitch.tv/helix/raids?${params.toString()}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": TWITCH_CLIENT_ID,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to start raid: ${error}`);
      return false;
    }

    return true;
  }

  async getUserByUsername(username: string, accessToken?: string): Promise<TwitchUser | null> {
    const token = accessToken || (await this.getAppAccessToken());
    const response = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(username)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": TWITCH_CLIENT_ID,
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    const user = data.data?.[0];
    if (!user) return null;

    return {
      id: user.id,
      login: user.login,
      display_name: user.display_name,
      profile_image_url: user.profile_image_url,
    };
  }

  async getStreams(userIds: string[]): Promise<TwitchStream[]> {
    if (!userIds || userIds.length === 0) return [];
    const appToken = await this.getAppAccessToken();

    const chunks: string[][] = [];
    for (let i = 0; i < userIds.length; i += 100) {
      chunks.push(userIds.slice(i, i + 100));
    }

    const allStreams: TwitchStream[] = [];
    for (const chunk of chunks) {
      const params = chunk.map((id) => `user_id=${encodeURIComponent(id)}`).join("&");
      const response = await fetch(`https://api.twitch.tv/helix/streams?${params}`, {
        headers: {
          Authorization: `Bearer ${appToken}`,
          "Client-Id": TWITCH_CLIENT_ID,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch streams:", await response.text());
        continue;
      }

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        allStreams.push(...data.data);
      }
    }

    return allStreams;
  }
}

export const twitchOAuthService = new TwitchOAuthService();