import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPaperPlane,
  faSpinner,
  faComments,
  faMicrophone,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import conversationService from "../../../../services/conversationService";
import { useLoading } from "../../../../contexts/LoadingContext";
import Loading from "../../../../components/common/Loading/Loading";
import ChatMessageItem from "../../../../components/ChatMessageItem/ChatMessageItem";
import PlaybackSpeedPopup from "../../../../components/PlaybackSpeedPopup/PlaybackSpeedPopup";
import PlaybackVoicePopup from "../../../../components/PlaybackVoicePopup/PlaybackVoicePopup";
import { getLevelDisplay } from "../../../../constants/conversationLevelConstants";
import styles from "./StudentConversationChat.module.css";

function StudentConversationChat() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { showLoading, hideLoading } = useLoading();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);

  // ===== SPEECH SETTINGS =====
  const [playbackSpeed, setPlaybackSpeed] = useState("1x");
  const [showSpeedPopup, setShowSpeedPopup] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showVoicePopup, setShowVoicePopup] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load voices
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

  useEffect(() => {
    fetchConversation();
    return () => window.speechSynthesis.cancel();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversation = async () => {
    try {
      showLoading();
      const response =
        await conversationService.getConversation(conversationId);
      const data = response?.data?.data;
      setConversation(data);
      setMessages(data?.messages || []);
    } catch (error) {
      console.error("Lỗi lấy cuộc hội thoại:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải cuộc hội thoại.",
      );
      navigate("/dashboard/student/conversation");
    } finally {
      hideLoading();
    }
  };

  const handleSendMessage = async (customMessage) => {
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
    setSending(true);

    try {
      await conversationService.sendMessage(conversationId, {
        message: trimmed,
      });

      const convResponse =
        await conversationService.getConversation(conversationId);
      const updatedData = convResponse?.data?.data;
      setConversation(updatedData);
      setMessages(updatedData?.messages || []);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      toast.error(error.response?.data?.message || "Không thể gửi tin nhắn.");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
      setInputMessage(trimmed);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (answer) => {
    setInputMessage(answer);
    inputRef.current?.focus();
  };

  const handleClearChat = async () => {
    if (!window.confirm("Bạn có chắc muốn kết thúc cuộc hội thoại này?"))
      return;

    try {
      setEnding(true);
      await conversationService.endConversation(conversationId);
      toast.success("Đã kết thúc cuộc hội thoại.");
      await fetchConversation();
    } catch (error) {
      console.error("Lỗi kết thúc:", error);
      toast.error(
        error.response?.data?.message || "Không thể kết thúc cuộc hội thoại.",
      );
    } finally {
      setEnding(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboard/student/conversation");
  };

  if (!conversation) {
    return <Loading size="large" text="Đang tải cuộc hội thoại..." />;
  }

  const isActive = conversation.status === "ACTIVE";

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div className={styles.headerAvatar}>
            <FontAwesomeIcon icon={faComments} />
          </div>
          <div className={styles.headerText}>
            <div className={styles.headerTitleRow}>
              <h2 className={styles.headerTitle}>Gia sư AI</h2>
              <span className={styles.liveBadge}>Live Coach</span>
            </div>
            <p className={styles.headerSubtitle}>
              Luyện giao tiếp tiếng Anh tự nhiên & sửa lỗi tức thì
            </p>
          </div>
        </div>

        <div className={styles.headerRight}>
          <span className={styles.levelBadge}>
            {getLevelDisplay(conversation.level)}
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

          {/* {isActive && (
            <button
              className={styles.clearBtn}
              onClick={handleClearChat}
              disabled={ending}
            >
              <FontAwesomeIcon
                icon={ending ? faSpinner : faTrashAlt}
                spin={ending}
              />
              <span>Đóng chat</span>
            </button>
          )} */}
        </div>
      </header>

      {/* MESSAGES */}
      <main className={styles.messagesContainer}>
        {messages.map((msg) => (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            onSuggestionClick={isActive ? handleSuggestionClick : null}
            speechRate={playbackSpeed}
            selectedVoice={selectedVoice}
          />
        ))}

        {sending && (
          <div className={styles.typingIndicator}>
            <div className={styles.typingAvatar}>
              <FontAwesomeIcon icon={faComments} />
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
          <div className={styles.inputWrapper}>
            <button className={styles.micBtn} title="Nhập bằng giọng nói">
              <FontAwesomeIcon icon={faMicrophone} />
            </button>
            <textarea
              ref={inputRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nói hoặc gõ bằng tiếng Anh hoặc tiếng Việt..."
              maxLength={2000}
              disabled={sending}
              className={styles.textarea}
            />
            <button
              className={styles.sendBtn}
              onClick={() => handleSendMessage()}
              disabled={sending || !inputMessage.trim()}
            >
              <FontAwesomeIcon
                icon={sending ? faSpinner : faPaperPlane}
                spin={sending}
              />
            </button>
          </div>

          <p className={styles.inputHint}>
            Nhấn <strong>Enter</strong> để gửi, <strong>Shift + Enter</strong>{" "}
            để xuống dòng
          </p>
        </footer>
      ) : (
        <footer className={styles.endedFooter}>
          <p>
            Cuộc hội thoại đã kết thúc. Bạn có thể xem lại lịch sử hoặc bắt đầu
            cuộc mới.
          </p>
          <button
            className={styles.newConversationBtn}
            onClick={() => navigate("/dashboard/student/conversation")}
          >
            Bắt đầu cuộc mới
          </button>
        </footer>
      )}
    </div>
  );
}

export default StudentConversationChat;
