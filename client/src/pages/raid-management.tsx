```tsx
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient"; // removed unused queryClient import
import { Users, ExternalLink, Loader2, Rocket, Crown, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { UserProfile } from "@shared/schema";

interface Raid {
  id: number;
  fromUserId: string;
  fromUsername: string;
  fromDisplayName: string;
  viewers: number;
  timestamp: string;
}

interface TwitchSearchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
}

export default function RaidManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [raidTarget, setRaidTarget] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: raids = [], isLoading: raidsLoading } = useQuery<Raid[]>({
    queryKey: ["/api/raids"],
    refetchInterval: 5000,
  });

  const { data: vips = [] } = useQuery<UserProfile[]>({
    queryKey: ["/api/users/vips"],
  });

  const { data: suggestions = [], isLoading: isSearching } = useQuery<TwitchSearchUser[]>({
    queryKey: [`/api/twitch/search-users?query=${searchQuery}`],
    enabled: searchQuery.length > 1,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(raidTarget);
      setShowSuggestions(raidTarget.length > 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [raidTarget]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startRaidMutation = useMutation({
    mutationFn: async (toUsername: string) => {
      return await apiRequest("POST", "/api/raids/start", { toUsername });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Raid Started!",
        description: `Successfully started raid to ${data.message?.split("to ")[1] || "target channel"}`,
      });
      setRaidTarget("");
      setShowSuggestions(false);
    },
    onError: (error: any) => {
      toast({
        title: "Raid Failed",
        description: error.message || "Failed to start raid. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectUser = (username: string) => {
    setRaidTarget(username);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRaidVIP = (username: string) => {
    startRaidMutation.mutate(username);
  };

  const handleRaidSearch = () => {
    if (raidTarget.trim()) {
      startRaidMutation.mutate(raidTarget.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && suggestions.length > 0 && showSuggestions) {
      e.preventDefault();
      handleSelectUser(suggestions[0].login);
    } else if (e.key === "Enter" && !showSuggestions && raidTarget.trim()) {
      e.preventDefault();
      handleRaidSearch();
    }
  };

  const renderRaids = () => {
    if (raidsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (raids.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground" data-testid="text-no-raids">
          No raids yet. When someone raids your channel, they'll appear here!
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {raids.map((raid) => (
          <div
            key={raid.id}
            className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover-elevate"
            data-testid={`card-raid-${raid.id}`}
          >
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://unavatar.io/twitch/${raid.fromUsername}`} alt={raid.fromDisplayName} />
                <AvatarFallback>{raid.fromDisplayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground truncate">{raid.fromDisplayName}</span>
                  <Badge variant="secondary" className="shrink-0">
                    {raid.viewers} {raid.viewers === 1 ? "viewer" : "viewers"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(raid.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" asChild data-testid={`button-view-profile-${raid.id}`}>
              <a
                href={`https://www.twitch.tv/${raid.fromUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View on Twitch"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-raid-management">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Raid Management
        </h1>
        <p className="text-muted-foreground mb-3" data-testid="text-page-description">
          View incoming raids and send your viewers to raid other channels
        </p>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> To send raids, you must be authenticated with Twitch.
            If raid commands fail, try disconnecting and reconnecting your Twitch account in Settings to grant raid
            permissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-incoming-raids">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Incoming Raids
            </CardTitle>
            <CardDescription>Recent raids from other streamers</CardDescription>
          </CardHeader>
          <CardContent>{renderRaids()}</CardContent>
        </Card>

        {/* Outgoing Raids */}
        {/* ... (rest unchanged) */}
      </div>
    </div>
  );
}
