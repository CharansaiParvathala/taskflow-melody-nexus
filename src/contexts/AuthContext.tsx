
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
  currentUser: User;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>; // Added login method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Default to the Team Leader user
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[1]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    // Check for saved role preference in localStorage
    const savedRole = localStorage.getItem("currentRole");
    if (savedRole) {
      const roleUser = mockUsers.find(u => u.role === savedRole);
      if (roleUser) {
        setCurrentUser(roleUser);
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
      localStorage.setItem("currentRole", user.role);
      return true;
    }
    
    return false;
  };

  return (
    <AuthContext.Provider value={{ currentUser, switchRole, isAuthenticated, login }}>
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
