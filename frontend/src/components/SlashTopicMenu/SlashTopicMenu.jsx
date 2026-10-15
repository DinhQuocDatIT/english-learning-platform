import React from "react";
import styles from "./SlashTopicMenu.module.css";

function SlashTopicMenu({ topics, onSelect, highlightedIndex }) {
  if (!topics || topics.length === 0) return null;

  return (
    <div className={styles.menu}>
      <div className={styles.menuHeader}>Chọn chủ đề để luyện giao tiếp</div>
      {topics.map((topic, idx) => (
        <div
          key={topic.value}
          className={`${styles.menuItem} ${
            idx === highlightedIndex ? styles.menuItemActive : ""
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(topic);
          }}
        >
          <div className={styles.menuEmoji}>{topic.emoji}</div>
          <div className={styles.menuContent}>
            <div className={styles.menuLabel}>{topic.labelVi}</div>
            <div className={styles.menuValue}>/topic {topic.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SlashTopicMenu;
