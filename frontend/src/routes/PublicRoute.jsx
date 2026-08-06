import { Navigate, Outlet } from "react-router-dom";
import AuthStorage from "../services/AuthStorage";

function PublicRoute() {
  const isAuthenticated = AuthStorage.isAuthenticated();

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export default PublicRoute;
