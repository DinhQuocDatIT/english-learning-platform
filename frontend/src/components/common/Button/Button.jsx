import styles from "./Button.module.css";

function Button({ children, onClick, type = "button" }) {
  return (
    <button type={type} className={styles.button} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;