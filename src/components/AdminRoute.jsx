import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const adminSessionOverride = localStorage.getItem("nestinvest_admin_session") === "true";

  if (!adminSessionOverride) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
