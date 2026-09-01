import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useVoice - wraps the browser Web Speech API for:
 *  - speech-to-text (SpeechRecognition)
 *  - text-to-speech (speechSynthesis)
 *
 * Designed to fail gracefully: if the browser doesn't support these APIs,
 * `sttSupported` / `ttsSupported` come back false and the UI can fall back
 * to typed input instead of crashing.
 */
export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micError, setMicError] = useState(null);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;
  const sttSupported = Boolean(SpeechRecognition);
  const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!sttSupported) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += text + " ";
        } else {
          interim += text;
        }
      }
      setTranscript((finalTranscriptRef.current + interim).trim());
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setMicError("Microphone access was denied. Please allow microphone access and try again.");
      } else if (event.error === "no-speech") {
        // benign - user paused; keep listening state as-is
      } else {
        setMicError("Something went wrong with speech recognition. You can type your answer instead.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, [SpeechRecognition, sttSupported]);

  const startListening = useCallback(() => {
    if (!sttSupported || !recognitionRef.current) {
      setMicError("Voice input isn't supported in this browser. Try Chrome or Edge, or type your answer.");
      return;
    }
    setMicError(null);
    finalTranscriptRef.current = "";
    setTranscript("");
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // recognition may already be running
    }
  }, [sttSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const speak = useCallback(
    (text, { onEnd } = {}) => {
      if (!ttsSupported || !text) {
        onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.98;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => /en-US|en_US/i.test(v.lang) && /female|Samantha|Google US English/i.test(v.name)
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [ttsSupported]
  );

  const cancelSpeaking = useCallback(() => {
    if (ttsSupported) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [ttsSupported]);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
  }, []);

  return {
    sttSupported,
    ttsSupported,
    isListening,
    isSpeaking,
    transcript,
    micError,
    setTranscript,
    startListening,
    stopListening,
    speak,
    cancelSpeaking,
    resetTranscript,
  };
}
