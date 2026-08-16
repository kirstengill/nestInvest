import { UserAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { session, isAdmin, loading } = UserAuth();
  const adminSessionOverride = localStorage.getItem("nestinvest_admin_session") === "true";

  if (loading || session === undefined) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner"></div>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  if (!session && !adminSessionOverride) {
    return <Navigate to="/admin-login" replace />;
  }

  if (!isAdmin && !adminSessionOverride) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
