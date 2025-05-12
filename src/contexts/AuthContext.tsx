
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
  },
  { 
    id: "4", 
    name: "Field Worker", 
    email: "worker@example.com", 
    role: "worker", 
    isActive: true,
    isArchived: false 
  }
];

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check for saved session in localStorage
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in a real app, this would verify against an API
    const user = mockUsers.find(u => u.email === email);
    
    if (user && user.isActive && !user.isArchived) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem("currentUser", JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated }}>
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
