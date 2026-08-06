import { Navigate, Outlet } from "react-router-dom";

function RoleRoute({ allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const role = user.role;

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
