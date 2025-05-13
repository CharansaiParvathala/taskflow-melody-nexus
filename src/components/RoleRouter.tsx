
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/pages/AdminDashboard";
import LeaderDashboard from "@/pages/LeaderDashboard";
import CheckerDashboard from "@/pages/CheckerDashboard";
import { Navigate } from "react-router-dom";

export const RoleRouter = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  switch (currentUser.role) {
    case "admin":
      return <AdminDashboard />;
    case "leader":
      return <LeaderDashboard />;
    case "checker":
      return <CheckerDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};
