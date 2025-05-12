
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { UserRole } from "@/types/user";

interface PrivateRouteProps {
  allowedRoles?: UserRole[];
}

export const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { isAuthenticated, currentUser } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If roles specified and user doesn't have permission
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};
