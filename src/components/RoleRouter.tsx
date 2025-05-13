
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/pages/AdminDashboard";
import LeaderDashboard from "@/pages/LeaderDashboard";
import CheckerDashboard from "@/pages/CheckerDashboard";
import { Navigate } from "react-router-dom";
import Login from "@/pages/Login";

export const RoleRouter = () => {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  if (!currentUser) {
    return <Login />;
  }

  switch (currentUser.role) {
    case "admin":
      return <AdminDashboard />;
    case "leader":
      return <LeaderDashboard />;
    case "checker":
      return <CheckerDashboard />;
    default:
      return <Login />;
  }
};
