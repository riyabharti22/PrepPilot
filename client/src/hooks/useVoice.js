const getVoicesAsync = useCallback(() => {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const onVoicesChanged = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    // Fallback: don't wait forever if the event never fires
    setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
}, []);

const speak = useCallback(
  async (text, { onEnd } = {}) => {
    if (!ttsSupported || !text) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();

    const voices = await getVoicesAsync();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

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

    // Safety net: if onstart/onend never fire (known Chrome bug on some
    // platforms), don't leave the UI stuck on "thinking"/"speaking" forever.
    const safetyTimeout = setTimeout(() => {
      if (window.speechSynthesis.speaking === false) {
        setIsSpeaking(false);
        onEnd?.();
      }
    }, Math.max(4000, text.length * 80));

    utterance.onend = () => {
      clearTimeout(safetyTimeout);
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => {
      clearTimeout(safetyTimeout);
      setIsSpeaking(false);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  },
  [ttsSupported, getVoicesAsync]
);