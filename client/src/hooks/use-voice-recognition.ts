import { useState, useEffect, useRef, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";

interface VoiceRecognitionOptions {
  onTranscript?: (transcript: string) => void;
  onEnhanced?: (original: string, enhanced: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  autoEnhance?: boolean;
  continuous?: boolean;
}

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  enhancedText: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
  isEnhancing: boolean;
}

export function useVoiceRecognition(options: VoiceRecognitionOptions = {}): UseVoiceRecognitionReturn {
  const {
    onTranscript,
    onEnhanced,
    onError,
    onStart,
    onEnd,
    autoEnhance = true,
    continuous = true,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [enhancedText, setEnhancedText] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldBeListeningRef = useRef(false);
  const accumulatedTranscriptRef = useRef("");
  const lastSpeechTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceDetectorRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if browser supports MediaRecorder
  const isSupported = typeof window !== "undefined" && 
    "MediaRecorder" in window && 
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices && 
    typeof navigator.mediaDevices.getUserMedia === "function";

  const enhanceSpeech = useCallback(async (text: string) => {
    if (!text.trim()) return;

    console.log("Enhancing speech:", text);
    setIsEnhancing(true);
    try {
      const response = await apiRequest("POST", "/api/voice/enhance", { text });
      const result: { original: string; enhanced: string } = await response.json();
      setEnhancedText(result.enhanced);
      onEnhanced?.(result.original, result.enhanced);
    } catch (error: any) {
      console.error("Failed to enhance speech:", error);
      onError?.("Failed to enhance speech");
    } finally {
      setIsEnhancing(false);
    }
  }, [onEnhanced, onError]);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      console.log("Sending audio to Groq Whisper for transcription...");
      
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      
      const response = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const result = await response.json();
      const transcribedText = result.text?.trim() || "";
      
      if (transcribedText) {
        console.log("Whisper transcription:", transcribedText);
        accumulatedTranscriptRef.current += transcribedText + " ";
        lastSpeechTimeRef.current = Date.now();
        
        const currentTranscript = accumulatedTranscriptRef.current.trim();
        setTranscript(currentTranscript);
        onTranscript?.(currentTranscript);
        
        // Clear existing silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        
        // Set new silence timeout (5 seconds after last speech)
        if (autoEnhance && shouldBeListeningRef.current) {
          console.log("Resetting 5-second silence timer");
          silenceTimeoutRef.current = setTimeout(() => {
            console.log("5 seconds of silence - rephrasing:", accumulatedTranscriptRef.current.trim());
            enhanceSpeech(accumulatedTranscriptRef.current.trim());
          }, 5000);
        }
      }
    } catch (error: any) {
      console.error("Transcription error:", error);
      onError?.("Failed to transcribe audio");
    }
  }, [autoEnhance, onTranscript, onError, enhanceSpeech]);

  const detectSilence = useCallback(() => {
    if (!analyserRef.current || !shouldBeListeningRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const isSilent = average < 5; // Threshold for silence
    
    if (!isSilent) {
      lastSpeechTimeRef.current = Date.now();
    }
    
    // Check if we have accumulated audio and it's been silent for 2 seconds
    const timeSinceSpeech = Date.now() - lastSpeechTimeRef.current;
    if (timeSinceSpeech > 2000 && audioChunksRef.current.length > 0) {
      console.log("Silence detected after speech - processing audio chunk");
      
      // Stop current recording and process
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    }
    
    // Continue monitoring if still listening
    if (shouldBeListeningRef.current) {
      silenceDetectorRef.current = setTimeout(detectSilence, 100);
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      onError?.("Voice recognition not supported");
      return;
    }

    console.log("User clicked start listening");
    shouldBeListeningRef.current = true;
    accumulatedTranscriptRef.current = "";
    setTranscript("");
    setEnhancedText("");
    
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      
      // Set up audio analysis for silence detection
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;
      
      // Start silence detection
      lastSpeechTimeRef.current = Date.now();
      detectSilence();
      
      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log("MediaRecorder stopped");
        
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioChunksRef.current = [];
          
          // Transcribe the audio
          await transcribeAudio(audioBlob);
        }
        
        // Restart recording if still listening
        if (shouldBeListeningRef.current && mediaRecorderRef.current) {
          audioChunksRef.current = [];
          mediaRecorderRef.current.start();
          console.log("Restarted recording");
        }
      };
      
      mediaRecorder.start();
      setIsListening(true);
      onStart?.();
      console.log("Groq Whisper voice recognition started");
      
    } catch (error: any) {
      console.error("Failed to start recognition:", error);
      onError?.("Failed to access microphone");
      shouldBeListeningRef.current = false;
    }
  }, [isSupported, onStart, onError, detectSilence, transcribeAudio]);

  const stopListening = useCallback(() => {
    console.log("User clicked stop listening");
    shouldBeListeningRef.current = false;
    
    // Stop silence detector
    if (silenceDetectorRef.current) {
      clearTimeout(silenceDetectorRef.current);
      silenceDetectorRef.current = null;
    }
    
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    
    // Stop audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Clear silence timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    // Trigger AI enhancement immediately if there's accumulated text
    if (autoEnhance && accumulatedTranscriptRef.current.trim()) {
      console.log("User stopped listening - rephrasing now:", accumulatedTranscriptRef.current.trim());
      enhanceSpeech(accumulatedTranscriptRef.current.trim());
    }
    
    setIsListening(false);
    onEnd?.();
  }, [onEnd, autoEnhance, enhanceSpeech]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setEnhancedText("");
    accumulatedTranscriptRef.current = "";
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false;
      
      if (silenceDetectorRef.current) {
        clearTimeout(silenceDetectorRef.current);
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    enhancedText,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    isEnhancing,
  };
}
