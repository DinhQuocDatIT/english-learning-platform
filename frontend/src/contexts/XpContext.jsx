import React, { createContext, useContext, useState, useCallback } from "react";
import XpToast from "../components/XpToast/XpToast";

const XpContext = createContext(null);

export function XpProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showXpToast = useCallback((xp) => {
    if (!xp || xp <= 0) return;

    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, xp }]);

    // ✅ Tự động đóng sau 3.5s (chậm hơn)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <XpContext.Provider value={{ showXpToast }}>
      {children}
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ top: `${88 + index * 40}px` }}>
          <XpToast xp={toast.xp} onClose={() => removeToast(toast.id)} />
        </div>
      ))}
    </XpContext.Provider>
  );
}

export function useXp() {
  const ctx = useContext(XpContext);
  if (!ctx) {
    throw new Error("useXp phải dùng trong XpProvider");
  }
  return ctx;
}

export default XpContext;
