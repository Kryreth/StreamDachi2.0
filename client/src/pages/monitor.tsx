import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Play, Pause, Square, ChevronDown, ChevronUp, Clock, MessageSquare, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChatMessage, VoiceAiResponse } from "@shared/schema";

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
  const [collectedMessagesOpen, setCollectedMessagesOpen] = useState(false);
  const [aiResponsesOpen, setAiResponsesOpen] = useState(false);
  const [aiResponseLimit, setAiResponseLimit] = useState<number>(10);

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
                data-testid="button-stop"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
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
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Message Count */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary" data-testid="text-buffer-count">
                {streamStatus?.bufferCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Messages in current cycle</p>
            </div>

            {/* Collapsible Dropdown */}
            <Collapsible open={collectedMessagesOpen} onOpenChange={setCollectedMessagesOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full" data-testid="button-toggle-collected">
                  {collectedMessagesOpen ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Messages
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      View Messages
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                {bufferMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No messages collected yet
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {bufferMessages.map((msg, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border bg-card text-sm"
                          data-testid={`message-${index}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-primary">{msg.username}</span>
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
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Module 3: AI Responses */}
        <Card data-testid="card-ai-responses">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Responses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Response Count */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary" data-testid="text-ai-count">
                {allAiResponses.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total AI responses</p>
            </div>

            {/* Response Limit Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Show Last</label>
              <Select
                value={aiResponseLimit.toString()}
                onValueChange={(value) => setAiResponseLimit(parseInt(value))}
              >
                <SelectTrigger data-testid="select-ai-limit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 responses</SelectItem>
                  <SelectItem value="10">10 responses</SelectItem>
                  <SelectItem value="25">25 responses</SelectItem>
                  <SelectItem value="50">50 responses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Collapsible Dropdown */}
            <Collapsible open={aiResponsesOpen} onOpenChange={setAiResponsesOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full" data-testid="button-toggle-ai">
                  {aiResponsesOpen ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Responses
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      View Responses
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                {limitedAiResponses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No AI responses yet
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
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
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
