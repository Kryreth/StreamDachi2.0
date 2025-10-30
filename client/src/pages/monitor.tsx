import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, MessageSquare, Sparkles, Ban, Clock as TimeoutIcon, Star, Shield, Play, Pause, Square } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChatMessage, VoiceAiResponse } from "@shared/schema";
import WorkflowChart, { type WorkflowStage, type StageStatus } from "@/components/workflow-chart";

interface DachiStreamState {
  status: string;
  bufferCount: number;
  lastCycleTime: string | null;
  nextCycleTime: string | null;
  secondsUntilNextCycle: number;
}

export default function Monitor() {
  const [isPaused, setIsPaused] = useState(false);
  const [cycleInterval, setCycleInterval] = useState(15);
  const [aiResponseLimit, setAiResponseLimit] = useState<number>(10);
  const [selectedUser, setSelectedUser] = useState<{username: string, userId?: string | null} | null>(null);

  // Fetch DachiStream status
  const { data: streamStatus } = useQuery<DachiStreamState>({
    queryKey: ["/api/dachistream/status"],
    refetchInterval: 1000, // Update every second for countdown
  });

  // Fetch current interval
  const { data: intervalData } = useQuery<{ intervalSeconds: number }>({
    queryKey: ["/api/dachistream/interval"],
  });

  // Fetch buffer messages
  const { data: bufferMessages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/dachistream/buffer"],
    refetchInterval: 2000, // Update every 2 seconds
  });

  // Fetch AI responses
  const { data: allAiResponses = [] } = useQuery<VoiceAiResponse[]>({
    queryKey: ["/api/voice/responses"],
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Sync interval from server
  useEffect(() => {
    if (intervalData?.intervalSeconds) {
      setCycleInterval(intervalData.intervalSeconds);
    }
  }, [intervalData]);

  // Sync pause state from server status
  useEffect(() => {
    if (streamStatus?.status === "paused") {
      setIsPaused(true);
    } else if (streamStatus?.status === "collecting" || streamStatus?.status === "processing") {
      setIsPaused(false);
    }
  }, [streamStatus?.status]);

  // Pause mutation
  const pauseMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/dachistream/pause", "POST");
    },
    onSuccess: () => {
      setIsPaused(true);
      queryClient.invalidateQueries({ queryKey: ["/api/dachistream/status"] });
    },
  });

  // Resume mutation
  const resumeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/dachistream/resume", "POST");
    },
    onSuccess: () => {
      setIsPaused(false);
      queryClient.invalidateQueries({ queryKey: ["/api/dachistream/status"] });
    },
  });

  // Reset mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/dachistream/reset", "POST");
    },
    onSuccess: () => {
      setIsPaused(false);
      queryClient.invalidateQueries({ queryKey: ["/api/dachistream/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dachistream/buffer"] });
    },
  });

  // Update interval mutation
  const updateIntervalMutation = useMutation({
    mutationFn: async (intervalSeconds: number) => {
      return await apiRequest("/api/dachistream/update-interval", "POST", { intervalSeconds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dachistream/interval"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dachistream/status"] });
    },
  });

  const handlePauseToggle = () => {
    if (isPaused) {
      resumeMutation.mutate();
    } else {
      pauseMutation.mutate();
    }
  };

  const handleIntervalChange = (value: number[]) => {
    const newInterval = value[0];
    setCycleInterval(newInterval);
    updateIntervalMutation.mutate(newInterval);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Get limited AI responses based on user selection
  const limitedAiResponses = allAiResponses.slice(0, aiResponseLimit);

  // Map backend status to workflow stages
  const getWorkflowStageFromStatus = (status: string | undefined): { stage: WorkflowStage; statuses: Record<WorkflowStage, StageStatus> } => {
    const allIdle: Record<WorkflowStage, StageStatus> = {
      "waiting-pool": "idle",
      "waiting-mic": "idle",
      "collecting-pool": "idle",
      "collecting-mic": "idle",
      "decision": "idle",
      "ai-setup-mic": "idle",
      "ai-setup-pool": "idle",
      "text-response": "idle",
      "voice": "idle",
      "complete": "idle",
    };

    if (!status || status === "idle") {
      return { stage: "waiting-pool", statuses: allIdle };
    }

    if (status === "collecting") {
      return {
        stage: "collecting-pool",
        statuses: {
          ...allIdle,
          "waiting-pool": "success",
          "collecting-pool": "active",
        }
      };
    }

    if (status === "processing") {
      return {
        stage: "decision",
        statuses: {
          ...allIdle,
          "waiting-pool": "success",
          "collecting-pool": "success",
          "decision": "active",
        }
      };
    }

    if (status === "selecting_message") {
      return {
        stage: "ai-setup-pool",
        statuses: {
          ...allIdle,
          "waiting-pool": "success",
          "collecting-pool": "success",
          "decision": "success",
          "ai-setup-pool": "active",
        }
      };
    }

    if (status === "building_context") {
      return {
        stage: "ai-setup-pool",
        statuses: {
          ...allIdle,
          "waiting-pool": "success",
          "collecting-pool": "success",
          "decision": "success",
          "ai-setup-pool": "active",
        }
      };
    }

    if (status === "waiting_for_ai") {
      return {
        stage: "text-response",
        statuses: {
          ...allIdle,
          "waiting-pool": "success",
          "collecting-pool": "success",
          "decision": "success",
          "ai-setup-pool": "success",
          "text-response": "active",
        }
      };
    }

    if (status === "paused") {
      return {
        stage: "waiting-pool",
        statuses: {
          ...allIdle,
          "waiting-pool": "waiting-input",
        }
      };
    }

    return { stage: "waiting-pool", statuses: allIdle };
  };

  const workflowData = getWorkflowStageFromStatus(streamStatus?.status);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" data-testid="page-title-monitor">
          Monitor
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time DachiStream monitoring and controls
        </p>
      </div>

      {/* 3-Module Layout */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Module 1: Status Collecting Messages */}
        <Card data-testid="card-status">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Status Collecting Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <Badge 
                variant={isPaused ? "secondary" : "default"}
                className="text-lg py-2 px-4"
                data-testid="badge-status"
              >
                {isPaused ? "PAUSED" : streamStatus?.status?.toUpperCase() || "IDLE"}
              </Badge>
            </div>

            {/* Countdown Timer */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary" data-testid="text-countdown">
                {formatTime(streamStatus?.secondsUntilNextCycle || cycleInterval)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Until next cycle</p>
            </div>

            {/* Pause/Resume and Stop Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handlePauseToggle}
                variant={isPaused ? "default" : "secondary"}
                className="w-full"
                data-testid="button-pause-resume"
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
              <Button
                onClick={() => resetMutation.mutate()}
                variant="destructive"
                className="w-full"
                data-testid="button-reset"
              >
                <Square className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Timer Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Cycle Interval</label>
                <span className="text-sm text-muted-foreground" data-testid="text-interval">
                  {formatTime(cycleInterval)}
                </span>
              </div>
              <Slider
                value={[cycleInterval]}
                onValueChange={handleIntervalChange}
                min={1}
                max={300}
                step={1}
                className="w-full"
                data-testid="slider-interval"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1s</span>
                <span>5m</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module 2: Collected Messages */}
        <Card data-testid="card-collected-messages">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Collected Messages
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              {streamStatus?.bufferCount || 0} messages in current cycle
            </div>
          </CardHeader>
          <CardContent>
            {/* Inline Scrollable Messages */}
            {bufferMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No messages collected yet
              </div>
            ) : (
              <ScrollArea className="h-[350px] pr-4">
                <div className="space-y-2">
                  {bufferMessages.map((msg, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border bg-card text-sm hover-elevate"
                      data-testid={`message-${index}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <button
                          onClick={() => setSelectedUser({username: msg.username, userId: msg.userId})}
                          className="font-medium text-primary hover:underline cursor-pointer"
                          data-testid={`username-${index}`}
                        >
                          {msg.username}
                        </button>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(msg.timestamp), "HH:mm:ss")}
                        </span>
                      </div>
                      <p className="text-foreground">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Module 3: AI Responses */}
        <Card data-testid="card-ai-responses">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Responses
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              {allAiResponses.length} total responses
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Response Limit Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Show Last:</label>
              <Select
                value={aiResponseLimit.toString()}
                onValueChange={(value) => setAiResponseLimit(parseInt(value))}
              >
                <SelectTrigger className="w-[140px]" data-testid="select-ai-limit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Inline Scrollable Responses */}
            {limitedAiResponses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No AI responses yet
              </div>
            ) : (
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-3">
                  {limitedAiResponses.map((response) => (
                    <div
                      key={response.id}
                      className="p-3 rounded-lg border bg-card text-sm"
                      data-testid={`ai-response-${response.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(response.timestamp), "MMM d, HH:mm:ss")}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Original:</p>
                          <p className="text-foreground bg-muted/30 p-2 rounded">
                            {response.originalText}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-primary mb-1">AI Rephrased:</p>
                          <p className="text-foreground bg-primary/10 p-2 rounded border border-primary/20 font-medium">
                            {response.rephrasedText}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Visual Workflow Chart */}
      <WorkflowChart
        currentStage={workflowData.stage}
        stageStatuses={workflowData.statuses}
      />

      {/* User Management Dialog */}
      <Dialog open={selectedUser !== null} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent data-testid="dialog-user-management">
          <DialogHeader>
            <DialogTitle>Manage {selectedUser?.username}</DialogTitle>
            <DialogDescription>
              Twitch moderation commands and VIP controls
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Mod Commands */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Moderation Actions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" data-testid="button-timeout">
                  <TimeoutIcon className="h-4 w-4 mr-2" />
                  Timeout (10m)
                </Button>
                <Button variant="destructive" size="sm" data-testid="button-ban">
                  <Ban className="h-4 w-4 mr-2" />
                  Ban User
                </Button>
              </div>
            </div>

            {/* VIP & Mod Controls */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Role Management
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" data-testid="button-add-vip">
                  <Star className="h-4 w-4 mr-2" />
                  Add VIP
                </Button>
                <Button variant="outline" size="sm" data-testid="button-remove-vip">
                  <Star className="h-4 w-4 mr-2" />
                  Remove VIP
                </Button>
                <Button variant="outline" size="sm" data-testid="button-add-mod">
                  <Shield className="h-4 w-4 mr-2" />
                  Add Mod
                </Button>
                <Button variant="outline" size="sm" data-testid="button-remove-mod">
                  <Shield className="h-4 w-4 mr-2" />
                  Remove Mod
                </Button>
              </div>
            </div>

            {/* Future: Channel Points Display */}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground italic">
                Channel points display coming soon via Twitch API integration
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
