import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHashtag,
  faCircleQuestion,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./SlashCommandMenu.module.css";

const ICON_MAP = {
  "/topic": faHashtag,
  "/help": faCircleQuestion,
  "/end": faRightFromBracket,
};

function SlashCommandMenu({ commands, onSelect, highlightedIndex }) {
  if (!commands || commands.length === 0) return null;

  return (
    <div className={styles.menu}>
      <div className={styles.menuHeader}>Commands</div>
      {commands.map((cmd, idx) => (
        <div
          key={cmd.command}
          className={`${styles.menuItem} ${
            idx === highlightedIndex ? styles.menuItemActive : ""
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(cmd);
          }}
        >
          <div className={styles.menuIcon}>
            <FontAwesomeIcon icon={ICON_MAP[cmd.command] || faHashtag} />
          </div>
          <div className={styles.menuContent}>
            <div className={styles.menuCommand}>
              {cmd.command}
              {cmd.hasArgs && (
                <span className={styles.menuArg}> &lt;tên&gt;</span>
              )}
            </div>
            <div className={styles.menuDescription}>{cmd.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SlashCommandMenu;
