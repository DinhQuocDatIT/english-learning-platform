import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faSpinner,
  faMicrophone,
  faRobot,
  faVolumeHigh,
  faHeadphones,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import conversationService from "../../../../services/conversationService";
import streakService from "../../../../services/streakService";
import { useXp } from "../../../../contexts/XpContext";
import Loading from "../../../../components/common/Loading/Loading";
import ChatMessageItem from "../../../../components/ChatMessageItem/ChatMessageItem";
import PlaybackSpeedPopup from "../../../../components/PlaybackSpeedPopup/PlaybackSpeedPopup";
import PlaybackVoicePopup from "../../../../components/PlaybackVoicePopup/PlaybackVoicePopup";
import SlashTopicMenu from "../../../../components/SlashTopicMenu/SlashTopicMenu";
import { SLASH_TOPICS } from "../../../../constants/slashCommands";
import { getLevelDisplay } from "../../../../constants/conversationLevelConstants";
import styles from "./StudentConversationChat.module.css";

function StudentConversationChat({
  conversationId: propConversationId,
  onConversationUpdated,
  onNewConversation,
}) {
  const location = useLocation();
  const { conversationId: routeConversationId } = useParams();
  const conversationId = propConversationId || routeConversationId;

  const { showXpToast } = useXp();

  const initialTopicHandledRef = useRef(false);
  const recognitionRef = useRef(null);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // ===== SPEECH SETTINGS =====
  const [playbackSpeed, setPlaybackSpeed] = useState("1x");
  const [showSpeedPopup, setShowSpeedPopup] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showVoicePopup, setShowVoicePopup] = useState(false);

  // ===== SLASH TOPICS =====
  const [showTopicMenu, setShowTopicMenu] = useState(false);
  const [highlightedTopicIndex, setHighlightedTopicIndex] = useState(0);
  const [filteredTopics, setFilteredTopics] = useState(SLASH_TOPICS);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load voices for Web Speech Synthesis
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter((voice) =>
        voice.lang.startsWith("en"),
      );
      const listToUse =
        englishVoices.length > 0 ? englishVoices : availableVoices;

      setVoices(listToUse);
      setSelectedVoice((prev) => {
        if (prev && listToUse.some((v) => v.name === prev.name)) return prev;
        return (
          listToUse.find((v) => v.lang === "en-US") || listToUse[0] || null
        );
      });
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Fetch conversation when conversationId changes
  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      setMessages([]);
      return;
    }

    let isMounted = true;

    const loadConv = async () => {
      try {
        setLoadingConv(true);
        const response =
          await conversationService.getConversation(conversationId);
        if (!isMounted) return;
        const data = response?.data?.data;
        setConversation(data);
        setMessages(data?.messages || []);
      } catch (error) {
        if (!isMounted) return;
        console.error("Lỗi lấy cuộc hội thoại:", error);
        toast.error(
          error.response?.data?.message || "Không thể tải cuộc hội thoại.",
        );
      } finally {
        if (isMounted) setLoadingConv(false);
      }
    };

    loadConv();

    return () => {
      isMounted = false;
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [conversationId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Streak update event
  const refreshStreak = async () => {
    try {
      const res = await streakService.getMyStreak();
      const data = res?.data?.data;
      if (data?.currentStreak != null) {
        window.dispatchEvent(
          new CustomEvent("streak-updated", {
            detail: { streak: data.currentStreak },
          }),
        );
      }
    } catch (err) {
      console.error("Lỗi cập nhật streak:", err);
    }
  };

  // Send message handler
  const handleSendMessage = useCallback(
    async (customMessage) => {
      const messageToSend =
        typeof customMessage === "string" ? customMessage : inputMessage;
      const trimmed = messageToSend.trim();
      if (!trimmed) {
        toast.warning("Vui lòng nhập tin nhắn.");
        return;
      }
      if (sending) return;
      if (conversation?.status !== "ACTIVE") {
        toast.warning("Cuộc hội thoại đã kết thúc.");
        return;
      }

      const tempUserMessage = {
        id: `temp-${Date.now()}`,
        role: "USER",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);
      setInputMessage("");
      setShowTopicMenu(false);
      setSending(true);

      try {
        const response = await conversationService.sendMessage(conversationId, {
          message: trimmed,
        });

        const aiData = response?.data?.data;

        // Hiển thị XP toast nếu có
        if (aiData?.experienceEarned && aiData.experienceEarned > 0) {
          showXpToast(aiData.experienceEarned);
        }

        // Refresh streak
        await refreshStreak();

        // Reload conversation để lấy messages mới nhất kèm phân tích lỗi
        const convResponse =
          await conversationService.getConversation(conversationId);
        const updatedData = convResponse?.data?.data;
        setConversation(updatedData);
        const updatedMsgs = updatedData?.messages || [];
        setMessages(updatedMsgs);

        // Notify parent sidebar
        if (onConversationUpdated) {
          onConversationUpdated({
            conversationId,
            lastMessage: trimmed,
            messageCount: updatedMsgs.length,
          });
        }
      } catch (error) {
        console.error("Lỗi gửi tin nhắn:", error);
        toast.error(error.response?.data?.message || "Không thể gửi tin nhắn.");
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
        setInputMessage(trimmed);
      } finally {
        setSending(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [
      inputMessage,
      sending,
      conversation,
      conversationId,
      showXpToast,
      onConversationUpdated,
    ],
  );

  // Auto handle /topic if passed via router state
  useEffect(() => {
    if (
      conversation &&
      conversation.status === "ACTIVE" &&
      location.state?.initialTopic &&
      !initialTopicHandledRef.current
    ) {
      initialTopicHandledRef.current = true;
      const initialTopicVal = location.state.initialTopic;
      setTimeout(() => {
        handleSendMessage(`/topic ${initialTopicVal}`);
      }, 350);
    }
  }, [conversation, location.state, handleSendMessage]);

  // Speech-To-Text (Microphone)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.info(
        "Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói trực tiếp. Vui lòng sử dụng Google Chrome hoặc Edge.",
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) =>
            prev.trim() ? `${prev.trim()} ${transcript}` : transcript,
          );
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          toast.error("Vui lòng cho phép quyền truy cập Micro để nói.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsListening(false);
    }
  };

  // Input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    if (value.startsWith("/") && !value.includes(" ")) {
      const query = value.slice(1).toLowerCase().trim();
      const filter = SLASH_TOPICS.filter(
        (topic) =>
          topic.value.includes(query) ||
          topic.labelVi.toLowerCase().includes(query),
      );
      setFilteredTopics(filter);
      setShowTopicMenu(filter.length > 0);
      setHighlightedTopicIndex(0);
    } else {
      setShowTopicMenu(false);
    }
  };

  // Topic select
  const handleSelectTopic = (topic) => {
    const message = `/topic ${topic.value}`;
    setInputMessage("");
    setShowTopicMenu(false);
    setTimeout(() => handleSendMessage(message), 50);
  };

  // Key down
  const handleKeyDown = (e) => {
    if (showTopicMenu && filteredTopics.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedTopicIndex((prev) =>
          prev < filteredTopics.length - 1 ? prev + 1 : 0,
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedTopicIndex((prev) =>
          prev > 0 ? prev - 1 : filteredTopics.length - 1,
        );
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        handleSelectTopic(filteredTopics[highlightedTopicIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowTopicMenu(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (answer) => {
    setInputMessage(answer);
    inputRef.current?.focus();
  };

  // If no conversation selected or history empty
  if (!conversationId) {
    return (
      <div className={styles.emptyChatState}>
        <div className={styles.emptyRobotOrb}>
          <FontAwesomeIcon icon={faRobot} />
        </div>
        <h3 className={styles.emptyTitle}>
          Chào mừng đến với English Buddy AI!
        </h3>
        <p className={styles.emptyDesc}>
          Chọn một cuộc trò chuyện từ danh sách bên trái hoặc bắt đầu cuộc trò
          chuyện mới để cùng luyện phản xạ tiếng Anh tự nhiên ngay hôm nay.
        </p>
        {onNewConversation && (
          <button className={styles.emptyStartBtn} onClick={onNewConversation}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Bắt đầu cuộc trò chuyện mới</span>
          </button>
        )}
      </div>
    );
  }

  if (loadingConv && !conversation) {
    return (
      <div className={styles.chatContainer}>
        <Loading size="large" text="Đang tải cuộc hội thoại..." />
      </div>
    );
  }

  const isActive = conversation?.status === "ACTIVE";

  return (
    <div className={styles.chatContainer}>
      {/* HEADER */}
      <header className={styles.chatHeader}>
        <div className={styles.headerLeft}>
          {/* <div className={styles.headerAvatarSquare}>
            <FontAwesomeIcon icon={faRobot} />
          </div>
          <div className={styles.headerMeta}>
            <div className={styles.headerTitleLine}>
              <h2 className={styles.headerTitle}>Buddy</h2>
              <span className={styles.liveCoachBadge}>Live Coach</span>
            </div>
            <p className={styles.headerSubtitle}>
              Luyện giao tiếp tiếng Anh tự nhiên & sửa lỗi tức thì
            </p>
          </div> */}
        </div>

        <div className={styles.headerRight}>
          <span className={styles.levelBadgePill}>
            {getLevelDisplay(conversation?.level || "BEGINNER")}
          </span>

          <PlaybackVoicePopup
            voices={voices}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            showVoicePopup={showVoicePopup}
            setShowVoicePopup={setShowVoicePopup}
            onVoiceChange={() => inputRef.current?.focus()}
          />

          <PlaybackSpeedPopup
            playbackSpeed={playbackSpeed}
            setPlaybackSpeed={setPlaybackSpeed}
            showSpeedPopup={showSpeedPopup}
            setShowSpeedPopup={setShowSpeedPopup}
            onSpeedChange={() => inputRef.current?.focus()}
          />

          <button
            className={styles.iconActionBtn}
            title="Luyện nghe tai nghe"
            onClick={() => {
              toast.info("Đã kết nối chế độ nghe phát âm chuẩn bản xứ!");
            }}
          >
            <FontAwesomeIcon icon={faHeadphones} />
          </button>
        </div>
      </header>

      {/* MESSAGES CONTAINER */}
      <main className={styles.messagesContainer}>
        {/* Date Divider */}
        {messages.length > 0 && (
          <div className={styles.dateDivider}>
            <span className={styles.dateBadge}>HÔM NAY</span>
          </div>
        )}

        {/* Message Items (Giữ nguyên toàn bộ giao diện phân tích lỗi, dịch, suggestions) */}
        {messages.map((msg) => (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            onSuggestionClick={isActive ? handleSuggestionClick : null}
            speechRate={playbackSpeed}
            selectedVoice={selectedVoice}
          />
        ))}

        {/* Typing Indicator */}
        {sending && (
          <div className={styles.typingIndicator}>
            <div className={styles.typingAvatar}>
              <FontAwesomeIcon icon={faRobot} />
            </div>
            <div className={styles.typingBubble}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* INPUT SECTION */}
      {isActive ? (
        <footer className={styles.inputSection}>
          <div className={styles.inputWrapperPill}>
            {showTopicMenu && (
              <SlashTopicMenu
                topics={filteredTopics}
                onSelect={handleSelectTopic}
                highlightedIndex={highlightedTopicIndex}
              />
            )}

            <button
              type="button"
              className={`${styles.micBtn} ${
                isListening ? styles.micBtnListening : ""
              }`}
              onClick={toggleSpeechRecognition}
              title={
                isListening
                  ? "Đang nghe... Nhấp để dừng"
                  : "Nói để nhập tin nhắn"
              }
            >
              <FontAwesomeIcon icon={faMicrophone} />
            </button>

            <textarea
              ref={inputRef}
              rows={1}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Nói hoặc gõ bằng tiếng Anh hoặc tiếng Việt..."
              maxLength={2000}
              disabled={sending}
              className={styles.textarea}
            />

            <button
              type="button"
              className={styles.sendBtn}
              onClick={() => handleSendMessage()}
              disabled={sending || !inputMessage.trim()}
              title="Gửi tin nhắn"
            >
              <FontAwesomeIcon
                icon={sending ? faSpinner : faPaperPlane}
                spin={sending}
              />
            </button>
          </div>

          {/* <p className={styles.inputHint}>
            Enter để gửi · Shift + Enter để xuống dòng · Gõ / để chọn chủ đề
          </p> */}
        </footer>
      ) : (
        <footer className={styles.endedFooter}>
          <p>
            Cuộc hội thoại đã kết thúc. Bạn có thể xem lại tin nhắn hoặc bắt đầu
            cuộc mới.
          </p>
          {onNewConversation && (
            <button
              className={styles.newConversationBtn}
              onClick={onNewConversation}
            >
              Bắt đầu cuộc mới
            </button>
          )}
        </footer>
      )}
    </div>
  );
}

export default StudentConversationChat;
