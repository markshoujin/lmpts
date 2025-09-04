import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ user }) {
  if (!user) {
    // redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default ProtectedRoute;
