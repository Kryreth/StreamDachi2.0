import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SiTwitch } from "react-icons/si";

interface TwitchStatus {
  connected: boolean;
  channel: string | null;
  messageCount: number;
}

interface AuthenticatedUser {
  id: string;
  twitchUsername: string;
  twitchDisplayName: string;
  twitchProfileImageUrl: string | null;
}

export default function LiveChat() {
  const { toast } = useToast();

  const { data: status, isLoading: statusLoading } = useQuery<TwitchStatus>({
    queryKey: ["/api/twitch/status"],
    refetchInterval: 3000,
  });

  const { data: authenticatedUser } = useQuery<AuthenticatedUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      if (!authenticatedUser) {
        throw new Error("Please log in with Twitch first");
      }
      const response = await fetch("/api/twitch/connect", {
        method: "POST",
        body: JSON.stringify({
          channel: authenticatedUser.twitchUsername,
          username: authenticatedUser.twitchUsername,
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to connect");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Connected!",
        description: "Successfully connected to Twitch chat",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/twitch/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to Twitch",
        variant: "destructive",
      });
    },
  });

  const isConnected = status?.connected ?? false;
  const channelName = status?.channel ?? null;

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="page-title-live-chat">Live Chat</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Native Twitch chat with full moderation abilities
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && channelName && (
              <Badge variant="default" className="gap-2" data-testid="badge-connected">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                Connected to {channelName}
              </Badge>
            )}
            {!isConnected && (
              <Button
                onClick={() => connectMutation.mutate()}
                disabled={connectMutation.isPending || !authenticatedUser}
                data-testid="button-connect"
              >
                <SiTwitch className="mr-2 h-4 w-4" />
                {connectMutation.isPending ? "Connecting..." : "Connect to Twitch"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Twitch Chat - Fixed iframe display */}
      <div className="flex-1 flex flex-col min-h-0">
        {isConnected && channelName ? (
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <SiTwitch className="h-5 w-5 text-primary" />
                {channelName}'s Chat
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Full Twitch chat experience with native mod tools (ban, timeout, delete, etc.)
              </p>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
              <iframe
                src={`https://www.twitch.tv/embed/${channelName}/chat?parent=${window.location.hostname}&darkpopout`}
                className="w-full h-full rounded-b-lg border-0"
                data-testid="iframe-twitch-chat"
                title={`${channelName} Twitch Chat`}
                style={{ minHeight: '500px' }}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <CardContent className="text-center py-16">
              <SiTwitch className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-semibold mb-2">
                {!authenticatedUser
                  ? "Login Required"
                  : "Not Connected"}
              </h2>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                {!authenticatedUser
                  ? "Please log in with Twitch to connect to chat"
                  : "Click the Connect button to start monitoring your Twitch chat"}
              </p>
              {authenticatedUser && !isConnected && (
                <Button
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending}
                  size="lg"
                  data-testid="button-connect-centered"
                >
                  <SiTwitch className="mr-2 h-5 w-5" />
                  {connectMutation.isPending ? "Connecting..." : "Connect to Twitch"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info Card */}
      <Card className="mt-4">
        <CardContent className="py-3">
          <div className="flex items-start gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
            <div className="space-y-1">
              <p className="font-medium">Native Twitch Chat Features</p>
              <p className="text-xs text-muted-foreground">
                This embedded chat provides all native Twitch moderation tools including: ban users, timeout users, 
                delete messages, clear chat, slow mode, followers-only mode, subscriber mode, and all emote/badge rendering.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
