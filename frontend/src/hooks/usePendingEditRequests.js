import { useEffect, useState } from "react";
import grammarService from "../services/grammarService";
import AuthStorage from "../services/AuthStorage";
import { ROLES } from "../constants/roles";

export function usePendingEditRequests() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const user = AuthStorage.getUser();
    if (!user || user.role?.name !== ROLES.ADMIN) return;

    let isMounted = true;

    const fetchCount = async () => {
      try {
        const res = await grammarService.adminCountPendingEditRequests();
        if (isMounted) setCount(res?.data?.data || 0);
      } catch (e) {
        // silent fail
      }
    };

    fetchCount();

    // Poll mỗi 60s
    const interval = setInterval(fetchCount, 60000);

    // Lắng nghe event
    const handleRefresh = () => fetchCount();
    window.addEventListener("refresh-edit-requests", handleRefresh);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("refresh-edit-requests", handleRefresh);
    };
  }, []);

  return count;
}
