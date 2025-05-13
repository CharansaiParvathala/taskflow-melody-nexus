
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MusicPlayer, MusicPlayerToggle } from "@/components/MusicPlayer";
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
  const { currentUser, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    navigate("/");
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
            {/* Role Switcher */}
            <div className="flex gap-2 mr-2">
              <Button 
                size="sm" 
                variant={currentUser.role === "leader" ? "default" : "outline"}
                onClick={() => handleRoleSwitch("leader")}
                className="hidden sm:inline-flex"
              >
                Team Leader
              </Button>
              <Button 
                size="sm" 
                variant={currentUser.role === "checker" ? "default" : "outline"}
                onClick={() => handleRoleSwitch("checker")}
                className="hidden sm:inline-flex"
              >
                Checker
              </Button>
              <Button 
                size="sm" 
                variant={currentUser.role === "admin" ? "default" : "outline"}
                onClick={() => handleRoleSwitch("admin")}
                className="hidden sm:inline-flex"
              >
                Admin
              </Button>
            </div>

            {/* Music Player Toggle */}
            <MusicPlayerToggle />

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
          </div>
        </div>
      </header>
      
      {/* Music Player */}
      <div className="fixed top-16 right-4 z-10">
        <MusicPlayer />
      </div>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
};
