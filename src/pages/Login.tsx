
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader } from "lucide-react";

// Form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Initialize react-hook-form with zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);

    try {
      // Attempt to login with credentials
      const success = await login(values.email, values.password);

      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate("/");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fill demo account credentials
  const fillDemoAccount = (role: string) => {
    let email = "";
    
    switch (role) {
      case "admin":
        email = "admin@example.com";
        break;
      case "leader":
        email = "leader@example.com";
        break;
      case "checker":
        email = "checker@example.com";
        break;
      case "worker":
        email = "worker@example.com";
        break;
      default:
        email = "";
    }
    
    form.setValue("email", email);
    form.setValue("password", "password"); // Demo password
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-muted/30 to-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-primary">WorkFlow Login</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="font-semibold">W</span>
            </div>
          </div>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="name@example.com" 
                        type="email" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button 
                  className="w-full" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Demo accounts:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fillDemoAccount("admin")}
                disabled={isLoading}
                className="justify-start"
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fillDemoAccount("leader")}
                disabled={isLoading}
                className="justify-start"
              >
                Team Leader
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fillDemoAccount("checker")}
                disabled={isLoading}
                className="justify-start"
              >
                Quality Checker
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fillDemoAccount("worker")}
                disabled={isLoading}
                className="justify-start"
              >
                Field Worker
              </Button>
            </div>
            <p className="text-xs text-center mt-3 text-muted-foreground">
              Use any password to login with demo accounts
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <div className="text-xs text-center text-muted-foreground">
            This login will connect to Supabase once integration is complete
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
