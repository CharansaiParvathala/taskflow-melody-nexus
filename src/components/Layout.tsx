
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MusicPlayer } from "@/components/MusicPlayer";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/user";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LayoutProps {
  children: ReactNode;
}

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  leader: "Team Leader",
  checker: "Quality Checker",
  worker: "Field Worker"
};

export const Layout = ({ children }: LayoutProps) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Company Logo */}
            <div className="font-bold text-xl text-primary">
              WorkFlow
            </div>
            
            {currentUser && (
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                {roleLabels[currentUser.role]} Dashboard
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ThemeToggle />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle theme</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {currentUser && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleLogout}
                className="hover-scale"
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6 animate-fade-in">
        {children}
      </main>
      
      {/* Music player for authenticated users */}
      {currentUser && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-10">
          <div className="container mx-auto max-w-md">
            <MusicPlayer />
          </div>
        </div>
      )}
    </div>
  );
};
