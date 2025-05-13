
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types/user";

// Mock user data for demonstration
const mockUsers: User[] = [
  { 
    id: "1", 
    name: "Admin User", 
    email: "admin@example.com", 
    role: "admin", 
    isActive: true,
    isArchived: false 
  },
  { 
    id: "2", 
    name: "Team Leader", 
    email: "leader@example.com", 
    role: "leader", 
    isActive: true,
    isArchived: false 
  },
  { 
    id: "3", 
    name: "Quality Checker", 
    email: "checker@example.com", 
    role: "checker", 
    isActive: true,
    isArchived: false 
  }
];

interface AuthContextType {
  currentUser: User | null;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check for saved auth state in localStorage
    const savedAuth = localStorage.getItem("isAuthenticated");
    const savedRole = localStorage.getItem("currentRole");
    
    if (savedAuth === "true" && savedRole) {
      const roleUser = mockUsers.find(u => u.role === savedRole);
      if (roleUser) {
        setCurrentUser(roleUser);
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Function to switch between pre-authenticated roles
  const switchRole = (role: UserRole) => {
    const user = mockUsers.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("currentRole", role);
    }
  };
  
  // Mock login function for the Login page
  const login = async (email: string, password: string): Promise<boolean> => {
    // Find user with matching email
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      // In a real app, we'd validate the password here
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("currentRole", user.role);
      return true;
    }
    
    return false;
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentRole");
  };

  return (
    <AuthContext.Provider value={{ currentUser, switchRole, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
