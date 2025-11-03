import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Clock, MessageSquare, Sparkles, Ban, Clock as TimeoutIcon, Star, Shield, Play, Pause, Square, Mic, MicOff, Volume2, Settings, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, useRef } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChatMessage, VoiceAiResponse } from "@shared/schema";
import WorkflowChart, { type WorkflowStage, type StageStatus } from "@/components/workflow-chart";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";
import { PUTER_VOICES, usePuterTTS } from "@/hooks/use-puter-tts";

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
  
  // Voice & Controls State
  const [micMuted, setMicMuted] = useState(false);
  const [voiceRephrasingEnabled, setVoiceRephrasingEnabled] = useState(true);
  const [stageControlEnabled, setStageControlEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState("Joanna");
  const [listeningPaused, setListeningPaused] = useState(false);
  const [personality, setPersonality] = useState<"Neutral" | "Quirky" | "Funny" | "Sarcastic" | "Professional">("Neutral");
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  
  // Dual Audio Output State
  const [programAudioMuted, setProgramAudioMuted] = useState(false);
  const [secondCableMuted, setSecondCableMuted] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  
  // Silence detection state
  const lastEnhancedTextRef = useRef("");
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousTranscriptRef = useRef("");

  // Voice Recognition Integration
  const {
    isListening,
    transcript,
    enhancedText,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: voiceSupported,
    isEnhancing
  } = useVoiceRecognition({
    autoEnhance: voiceRephrasingEnabled,
    continuous: true,
  });

  // Puter TTS Integration
  const {
    isSupported: ttsSupported,
    isSpeaking,
    speak,
    stop: stopSpeaking,
    updateSettings: updateTtsSettings,
  } = usePuterTTS();

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

  // Handle mic mute toggle
  useEffect(() => {
    if (micMuted && isListening) {
      stopListening();
    } else if (!micMuted && !isListening && voiceSupported && !listeningPaused) {
      startListening();
    }
  }, [micMuted]);

  // Auto-clear previous transcription when new speech starts
  useEffect(() => {
    // Detect when new speech session starts (transcript goes from empty to non-empty)
    const hadNoTranscript = !previousTranscriptRef.current || previousTranscriptRef.current.trim() === "";
    const hasNewTranscript = transcript && transcript.trim() !== "";
    
    if (hadNoTranscript && hasNewTranscript) {
      // New speech session detected - clear everything from previous session
      console.log("[Monitor] New speech detected - clearing previous session");
      lastEnhancedTextRef.current = "";
      stopSpeaking();
      
      // Clear the silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }
    
    // Update previous transcript reference
    previousTranscriptRef.current = transcript;
  }, [transcript, stopSpeaking]);

  // Auto-clear AI output after new enhanced text appears AND trigger TTS audio
  useEffect(() => {
    if (enhancedText && enhancedText !== lastEnhancedTextRef.current) {
      lastEnhancedTextRef.current = enhancedText;
      
      // Play TTS audio if enabled and not muted
      if (ttsEnabled && ttsSupported && !programAudioMuted) {
        console.log("[Monitor] Playing TTS for:", enhancedText);
        speak(enhancedText);
      }
      
      // Clear the silence timer if it exists
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      // Set new timer to clear after 10 seconds
      silenceTimerRef.current = setTimeout(() => {
        lastEnhancedTextRef.current = "";
      }, 10000);
    }
  }, [enhancedText, ttsEnabled, ttsSupported, programAudioMuted, speak]);

  // Handle pause/resume listening
  const handleListeningToggle = () => {
    if (listeningPaused) {
      setListeningPaused(false);
      if (!micMuted && voiceSupported) {
        startListening();
      }
    } else {
      setListeningPaused(true);
      if (isListening) {
        stopListening();
      }
    }
  };

  // Auto-adjust pitch and speed based on personality
  useEffect(() => {
    const personalityPresets = {
      Neutral: { pitch: 1.0, speed: 1.0 },
      Quirky: { pitch: 1.2, speed: 1.1 },
      Funny: { pitch: 1.1, speed: 1.05 },
      Sarcastic: { pitch: 0.95, speed: 0.9 },
      Professional: { pitch: 0.9, speed: 0.95 },
    };
    
    const preset = personalityPresets[personality];
    setVoicePitch(preset.pitch);
    setVoiceSpeed(preset.speed);
    
    // Save personality settings to database
    updatePersonalityMutation.mutate({
      personality,
      pitch: preset.pitch,
      speed: preset.speed,
    });
  }, [personality]);
  
  // Sync TTS voice selection
  useEffect(() => {
    updateTtsSettings({
      voice: selectedVoice,
      enabled: ttsEnabled && !programAudioMuted,
    });
  }, [selectedVoice, ttsEnabled, programAudioMuted, updateTtsSettings]);

  // Handle clear AI output
  const handleClearOutput = () => {
    resetTranscript();
    lastEnhancedTextRef.current = "";
    stopSpeaking();
  };

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

  // Update personality mutation
  const updatePersonalityMutation = useMutation({
    mutationFn: async (data: { personality: string; pitch: number; speed: number }) => {
      return await apiRequest("/api/settings/voice-personality", "POST", data);
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

  // Map backend status AND voice states to workflow stages
  const getWorkflowStageFromStatus = (
    backendStatus: string | undefined,
    voiceState: {
      isListening: boolean,
      transcript: string,
      isEnhancing: boolean,
      isSpeaking: boolean,
      micMuted: boolean,
    }
  ): { stage: WorkflowStage; statuses: Record<WorkflowStage, StageStatus> } => {
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

    // VOICE ACTIVITY TAKES PRIORITY - override pool cycle when user is speaking
    // Stage 1: Mic is waiting/ready (isListening but no speech yet)
    if (voiceState.isListening && !voiceState.micMuted && !voiceState.transcript && !voiceState.isEnhancing) {
      return {
        stage: "waiting-mic",
        statuses: {
          ...allIdle,
          "waiting-mic": "active",
        }
      };
    }

    // Stage 2: Mic is collecting speech (transcript is being captured)
    if (voiceState.isListening && voiceState.transcript && !voiceState.isEnhancing) {
      return {
        stage: "collecting-mic",
        statuses: {
          ...allIdle,
          "waiting-mic": "success",
          "collecting-mic": "active",
        }
      };
    }

    // Stage 3: AI is rephrasing the speech
    if (voiceState.isEnhancing) {
      return {
        stage: "ai-setup-mic",
        statuses: {
          ...allIdle,
          "waiting-mic": "success",
          "collecting-mic": "success",
          "ai-setup-mic": "active",
        }
      };
    }

    // Stage 4: TTS is playing audio
    if (voiceState.isSpeaking) {
      return {
        stage: "voice",
        statuses: {
          ...allIdle,
          "waiting-mic": "success",
          "collecting-mic": "success",
          "ai-setup-mic": "success",
          "voice": "active",
        }
      };
    }

    // POOL CYCLE STATES - when no voice activity is happening
    if (!backendStatus || backendStatus === "idle") {
      return { stage: "waiting-pool", statuses: allIdle };
    }

    if (backendStatus === "collecting") {
      return {
        stage: "collecting-pool",
        statuses: {
          ...allIdle,
          "waiting-pool": "success",
          "collecting-pool": "active",
        }
      };
    }

    if (backendStatus === "processing") {
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

    if (backendStatus === "selecting_message") {
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

    if (backendStatus === "building_context") {
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

    if (backendStatus === "waiting_for_ai") {
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

    if (backendStatus === "paused") {
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

  const workflowData = getWorkflowStageFromStatus(streamStatus?.status, {
    isListening,
    transcript,
    isEnhancing,
    isSpeaking,
    micMuted,
  });

  return (
    <div className="p-6 space-y-6" id="monitor-page">
      <div>
        <h1 className="text-2xl font-bold text-foreground" data-testid="page-title-monitor">
          Monitor
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time voice controls and StreamDashi monitoring
        </p>
      </div>

      {/* MAIN LAYOUT - Voice Panel (LEFT) + StreamDashi Display (RIGHT - FIXED WIDTH) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="main-monitor-layout">
        
        {/* LEFT COLUMN - Voice Controls & Transcription Panel (Responsive) */}
        <div className="lg:col-span-5 space-y-4" id="voice-controls-panel">
          
          {/* Voice Control Card */}
          <Card data-testid="card-voice-controls">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Voice Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Microphone Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {micMuted ? <MicOff className="h-5 w-5 text-muted-foreground" /> : <Mic className="h-5 w-5 text-primary" />}
                  <div>
                    <label htmlFor="mic-toggle" className="text-sm font-medium cursor-pointer">
                      Microphone
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {micMuted ? "Muted" : "Active"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="mic-toggle"
                  checked={!micMuted}
                  onCheckedChange={(checked) => setMicMuted(!checked)}
                  data-testid="switch-mic"
                />
              </div>

              {/* Voice Rephrasing Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <label htmlFor="rephrasing-toggle" className="text-sm font-medium cursor-pointer">
                      AI Rephrasing
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {voiceRephrasingEnabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="rephrasing-toggle"
                  checked={voiceRephrasingEnabled}
                  onCheckedChange={setVoiceRephrasingEnabled}
                  data-testid="switch-rephrasing"
                />
              </div>

              {/* Personality Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Personality
                </label>
                <Select value={personality} onValueChange={(value: any) => setPersonality(value)}>
                  <SelectTrigger data-testid="select-personality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Neutral">Neutral - Natural & conversational</SelectItem>
                    <SelectItem value="Quirky">Quirky - Playful & energetic</SelectItem>
                    <SelectItem value="Funny">Funny - Humorous & lighthearted</SelectItem>
                    <SelectItem value="Sarcastic">Sarcastic - Witty & deadpan</SelectItem>
                    <SelectItem value="Professional">Professional - Polished & articulate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Voice Selection
                </label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger data-testid="select-voice">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PUTER_VOICES.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name} ({voice.gender}, {voice.region})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dual Audio Output Controls */}
              <div className="pt-2 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Audio Outputs</label>
                  {isSpeaking && (
                    <Badge variant="secondary" className="text-xs">
                      <Volume2 className="h-3 w-3 mr-1" />
                      Playing
                    </Badge>
                  )}
                </div>

                {/* Program Audio (Main Output) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-4 w-4 text-primary" />
                    <div>
                      <label htmlFor="program-audio" className="text-sm cursor-pointer">
                        Program Audio
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {programAudioMuted ? "Muted" : "Active"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="program-audio"
                    checked={!programAudioMuted}
                    onCheckedChange={(checked) => setProgramAudioMuted(!checked)}
                    data-testid="switch-program-audio"
                  />
                </div>

                {/* Second Cable (Optional Output) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-4 w-4 text-primary" />
                    <div>
                      <label htmlFor="second-cable" className="text-sm cursor-pointer">
                        Second Cable
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {secondCableMuted ? "Muted" : "Active"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="second-cable"
                    checked={!secondCableMuted}
                    onCheckedChange={(checked) => setSecondCableMuted(!checked)}
                    data-testid="switch-second-cable"
                  />
                </div>
              </div>

              {/* Pause/Resume Listening Button */}
              <div className="pt-2">
                <Button
                  onClick={handleListeningToggle}
                  variant={listeningPaused ? "default" : "secondary"}
                  className="w-full"
                  data-testid="button-pause-listening"
                >
                  {listeningPaused ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Resume Listening
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Listening
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Live Transcription Display */}
          <Card data-testid="card-live-transcription">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Live Transcription
                  {isListening && !listeningPaused && (
                    <Badge variant="default" className="ml-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></span>
                      Listening
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearOutput}
                  data-testid="button-clear-transcript"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                What the microphone detected
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-muted/30">
                {transcript ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap" data-testid="text-transcript">
                    {transcript}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {!voiceSupported 
                      ? "Voice recognition not supported in this browser" 
                      : micMuted
                      ? "Microphone is muted"
                      : listeningPaused
                      ? "Listening paused - Click 'Resume Listening' to continue"
                      : "Waiting for speech input..."}
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* AI Rephrased Output */}
          <Card data-testid="card-ai-rephrased">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Rephrased Output
                {isEnhancing && (
                  <Badge variant="secondary" className="ml-2">
                    Processing...
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                AI-enhanced version (auto-clears after each response)
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-primary/10">
                {enhancedText ? (
                  <p className="text-sm text-foreground font-medium whitespace-pre-wrap" data-testid="text-enhanced">
                    {enhancedText}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {!voiceRephrasingEnabled
                      ? "Voice rephrasing is disabled"
                      : "AI-enhanced text will appear here..."}
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - StreamDashi Display (FIXED WIDTH) */}
        <div className="lg:col-span-7" id="streamdashi-display" style={{ maxWidth: '900px' }}>
          
          {/* 3-Module Status Layout */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {/* Module 1: Status Collecting Messages */}
            <Card data-testid="card-status">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Status
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

                {/* Pause/Resume and Reset Buttons */}
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
                  Messages
                </CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  {streamStatus?.bufferCount || 0} collected
                </div>
              </CardHeader>
              <CardContent>
                {/* Inline Scrollable Messages */}
                {bufferMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No messages yet
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
                  {allAiResponses.length} total
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Response Limit Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Show:</label>
                  <Select
                    value={aiResponseLimit.toString()}
                    onValueChange={(value) => setAiResponseLimit(parseInt(value))}
                  >
                    <SelectTrigger className="w-[100px]" data-testid="select-ai-limit">
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
                    No responses yet
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

          {/* Visual Workflow Chart (Fixed Width Display) */}
          <div style={{ width: '100%', maxWidth: '900px' }}>
            <WorkflowChart
              currentStage={workflowData.stage}
              stageStatuses={workflowData.statuses}
            />
          </div>
        </div>
      </div>

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
