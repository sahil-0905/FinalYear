
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Supports one role or multiple roles
  if (allowedRole) {
    const allowedRoles = Array.isArray(allowedRole)
      ? allowedRole
      : [allowedRole];

    if (!allowedRoles.includes(role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
