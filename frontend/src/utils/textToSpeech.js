
export const getAvailableVoices = () => {
  if (!("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices();
};

// Hàm đọc với tùy chọn giọng và tốc độ
export const speakText = (text, options = {}) => {
  if (!("speechSynthesis" in window)) {
    alert("Trình duyệt của bạn không hỗ trợ tính năng đọc văn bản.");
    return;
  }

  window.speechSynthesis.cancel();

  if (!text || !text.trim()) return;

  const utterance = new SpeechSynthesisUtterance(text);

  if (options.voice) {
    utterance.voice = options.voice;
  } else {
    utterance.lang = options.lang || "en-US";
  }

  utterance.rate = options.rate || 0.9; 

  window.speechSynthesis.speak(utterance);
};