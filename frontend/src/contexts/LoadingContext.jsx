import { createContext, useContext, useState } from "react";
import Loading from "../components/common/Loading/Loading";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);

  const showLoading = () => {
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  return (
    <LoadingContext.Provider
      value={{
        showLoading,
        hideLoading,
      }}
    >
      {children}

      {loading && <Loading />}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext);
