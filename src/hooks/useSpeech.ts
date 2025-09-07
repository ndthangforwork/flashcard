"use client";
import { useEffect, useState, useCallback } from "react";

export function useSpeech(defaultLang: string = "en-US") {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ready, setReady] = useState(false);

  // Load voices (iOS thường load chậm)
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setVoices(v);
        setReady(true);
      }
    };

    // Event khi voices sẵn sàng
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  // Hàm speak
  const speak = useCallback(
    (text: string, lang: string = defaultLang) => {
      if (!text) return;

      // Trick: "kickstart" iOS nếu chưa khởi động
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Tìm voice đúng ngôn ngữ
      const voice = voices.find((v) => v.lang === lang);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.lang = lang;
      utterance.rate = 1; // tốc độ đọc
      utterance.pitch = 1;

      window.speechSynthesis.speak(utterance);
    },
    [voices, defaultLang]
  );

  return { speak, ready, voices };
}
