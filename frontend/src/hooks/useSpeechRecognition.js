import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

/**
 * Custom hook xử lý nhận diện giọng nói (Speech-to-Text).
 *
 * Hỗ trợ nhận diện tiếng Việt có dấu, tiếng Anh và cụm từ kết hợp (vd: "My name is Đạt").
 * Tích hợp tự động chống lặp từ, stream kết quả thời gian thực và tự dừng khi im lặng.
 *
 * @param {Object} options
 * @param {string} [options.text=""] - Nội dung văn bản hiện tại trong ô input/textarea.
 * @param {Function} [options.setText] - State setter để cập nhật văn bản (vd: setInputMessage).
 * @param {Function} [options.onResult] - Callback nhận văn bản mới nhất: (fullText, currentTranscript) => void.
 * @param {string} [options.lang="vi-VN"] - Mã ngôn ngữ (mặc định vi-VN để nhận diện cả tiếng Việt và tiếng Anh).
 * @param {boolean} [options.continuous=true] - Thu âm liên tục không bị ngắt quãng giữa chừng khi ngập ngừng.
 * @param {boolean} [options.interimResults=true] - Hiển thị kết quả tạm thời theo thời gian thực khi đang nói.
 * @param {number} [options.silenceTimeout=6000] - Số ms im lặng trước khi tự động dừng (mặc định 6 giây, 0 để tắt).
 *
 * @returns {Object} { isListening, startListening, stopListening, toggleListening, hasSupport }
 */
export default function useSpeechRecognition({
  text = "",
  setText,
  onResult,
  lang = "vi-VN",
  continuous = true,
  interimResults = true,
  silenceTimeout = 6000,
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const baseInputRef = useRef("");
  const textRef = useRef(text);
  const isListeningRef = useRef(false);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  const hasSupport =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const stopListening = useCallback(() => {
    // Ngắt cờ lắng nghe ngay lập tức để chặn mọi sự kiện onresult trễ
    isListeningRef.current = false;
    baseInputRef.current = "";

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        // Sử dụng abort() thay vì stop() để hủy ngay lập tức và hủy luôn các event onresult còn tồn đọng
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      toast.info(
        "Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói trực tiếp. Vui lòng sử dụng Google Chrome hoặc Edge.",
      );
      return;
    }

    // Nếu đang có phiên chạy trước đó thì dừng lại
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    try {
      // Đánh dấu cờ đang lắng nghe
      isListeningRef.current = true;

      // Lưu lại văn bản hiện có trước khi bắt đầu nói để nối thêm vào đuôi
      baseInputRef.current = (
        typeof textRef.current === "string" ? textRef.current : ""
      ).trim();

      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.interimResults = interimResults;
      recognition.continuous = continuous;

      const resetSilenceTimer = () => {
        if (silenceTimeout > 0) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            stopListening();
          }, silenceTimeout);
        }
      };

      recognition.onstart = () => {
        if (!isListeningRef.current) return;
        setIsListening(true);
        resetSilenceTimer();
      };

      recognition.onresult = (event) => {
        // Nếu đã gọi stopListening (ví dụ khi người dùng nhấn Gửi), bỏ qua kết quả
        if (!isListeningRef.current) return;

        resetSilenceTimer();
        let speechText = "";
        for (let i = 0; i < event.results.length; i++) {
          const chunk = event.results[i][0]?.transcript || "";
          if (chunk) {
            if (
              speechText &&
              !speechText.endsWith(" ") &&
              !chunk.startsWith(" ")
            ) {
              speechText += " " + chunk;
            } else {
              speechText += chunk;
            }
          }
        }

        const trimmedSpeech = speechText.trim();
        if (trimmedSpeech && isListeningRef.current) {
          const base = baseInputRef.current;
          const combined = base ? `${base} ${trimmedSpeech}` : trimmedSpeech;
          if (typeof setText === "function") {
            setText(combined);
          }
          if (typeof onResult === "function") {
            onResult(combined, trimmedSpeech);
          }
        }
      };

      recognition.onerror = (event) => {
        if (!isListeningRef.current) return;

        console.warn("Speech recognition error:", event.error);
        if (event.error !== "no-speech" && event.error !== "aborted") {
          if (event.error === "not-allowed") {
            toast.error("Vui lòng cho phép quyền truy cập Micro để nói.");
          }
        }
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        isListeningRef.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [lang, continuous, interimResults, silenceTimeout, setText, onResult, stopListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, stopListening, startListening]);

  // Dọn dẹp tài nguyên khi unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    toggleListening,
    hasSupport,
  };
}
