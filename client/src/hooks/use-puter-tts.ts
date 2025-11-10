--- a/client/src/hooks/use-puter-tts.ts
+++ b/client/src/hooks/use-puter-tts.ts
@@
-import { useCallback, useState } from "react";
+import { useCallback, useEffect, useRef, useState } from "react";

+// Allow window.puter without any `as any` assertions
+declare global {
+  interface Window {
+    puter?: {
+      ai?: {
+        txt2speech?: (
+          text: string,
+          opts: { voice?: string; engine?: string; language?: string }
+        ) => Promise<any>;
+      };
+    };
+  }
+}

 export interface PuterTTSSettings {
   voice?: string;
   engine?: string;
   language?: string;
 }

 export default function usePuterTTS() {
-  // (other state as-is)
+  const [isSupported, setIsSupported] = useState(false);
+  const [isSpeaking, setIsSpeaking] = useState(false);
+  const [settings, setSettings] = useState<PuterTTSSettings>({
+    voice: undefined,
+    engine: undefined,
+    language: "en",
+  });
+  const audioRef = useRef<HTMLAudioElement | null>(null);

-  // Initialize support check on first render
-  useState(() => {
-    setTimeout(checkSupport, 100);
-  });
+  // Initialize support check (useEffect instead of useState side-effect)
+  const checkSupport = useCallback(() => {
+    setIsSupported(Boolean(window?.puter?.ai?.txt2speech));
+  }, []);
+  useEffect(() => {
+    const id = window.setTimeout(checkSupport, 100);
+    return () => window.clearTimeout(id);
+  }, [checkSupport]);

   // Update settings
   const updateSettings = useCallback((newSettings: Partial<PuterTTSSettings>) => {
     setSettings(prev => ({ ...prev, ...newSettings }));
   }, []);

   // Speak
   const speak = useCallback(async (text: string) => {
-    const audioStream = await (window as any).puter.ai.txt2speech(trimmedText, {
-      voice: settings.voice,
-      engine: settings.engine,
-      language: settings.language,
-    });
+    if (!isSupported) return;
+    const trimmedText = text.slice(0, 3000);
+    setIsSpeaking(true);
+    try {
+      const fn = window?.puter?.ai?.txt2speech;
+      if (!fn) throw new Error("puter.ai.txt2speech unavailable");
+      const audioResult: any = await fn(trimmedText, {
+        voice: settings.voice,
+        engine: settings.engine,
+        language: settings.language,
+      });
+      const audio = (audioRef.current ||= new Audio());
+      if (typeof audioResult === "string") {
+        audio.src = audioResult;
+      } else if (audioResult?.url) {
+        audio.src = String(audioResult.url);
+      } else if (typeof audioResult?.arrayBuffer === "function") {
+        const buf = await audioResult.arrayBuffer();
+        audio.src = URL.createObjectURL(new Blob([buf]));
+      } else {
+        setIsSpeaking(false);
+        return;
+      }
+      await audio.play();
+      audio.onended = () => setIsSpeaking(false);
+      audio.onerror = () => setIsSpeaking(false);
+    } catch (e) {
+      setIsSpeaking(false);
+      console.error("Puter TTS error:", e);
+    }
   }, [isSupported, settings.voice, settings.engine, settings.language]);

+  const stop = useCallback(() => {
+    if (audioRef.current) {
+      try { audioRef.current.pause(); audioRef.current.src = ""; } catch {}
+    }
+    setIsSpeaking(false);
+  }, []);
+
-  // Delayed check to ensure Puter script has loaded
-  setTimeout(checkSupport, 100);
+  // (removed duplicate delayed check)

   return {
     isSupported,
     isSpeaking,
     settings,
     speak,
+    stop,
     updateSettings,
   };
 }
