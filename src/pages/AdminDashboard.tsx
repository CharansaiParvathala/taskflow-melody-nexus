
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/types/supabase";
import { Badge } from "@/components/ui/badge";
import { CreateUserDialog } from "@/components/user/CreateUserDialog";
import { PaymentStatusDialog } from "@/components/payment/PaymentStatusDialog";
import { toast } from "sonner";

// Mock data for the charts
const spendData = [
  { name: "Mon", spend: 800, budget: 1000 },
  { name: "Tue", spend: 1200, budget: 1000 },
  { name: "Wed", spend: 900, budget: 1000 },
  { name: "Thu", spend: 1100, budget: 1000 },
  { name: "Fri", spend: 700, budget: 1000 },
  { name: "Sat", spend: 300, budget: 1000 },
  { name: "Sun", spend: 400, budget: 1000 }
];

const AdminDashboard = () => {
  const [budgetTarget, setBudgetTarget] = useState("1000");
  const [todayExpense, setTodayExpense] = useState(700);
  const [weekExpense, setWeekExpense] = useState(5400);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [completedPayments, setCompletedPayments] = useState(0);
  
  const [paymentRequests, setPaymentRequests] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>(undefined);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch payment requests from Supabase
    const fetchPaymentRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Cast the data to ensure it matches our Payment type
        const typedPayments = data?.map(payment => ({
          ...payment,
          status: payment.status as Payment['status'] // Safe cast after updating type
        })) || [];
        
        setPaymentRequests(typedPayments);
        
        // Count payments by status
        const pendingCount = typedPayments.filter(p => p.status === 'pending' || p.status === 'flagged').length || 0;
        const completedCount = typedPayments.filter(p => p.status === 'completed').length || 0;
        
        setPendingPayments(pendingCount);
        setCompletedPayments(completedCount);
      } catch (error) {
        console.error("Error fetching payment requests:", error);
        toast.error("Failed to load payment requests");
      }
    };
    
    fetchPaymentRequests();
    
    // Set up real-time subscription for payments
    const paymentsSubscription = supabase
      .channel('public:payments')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'payments' 
        }, 
        payload => {
          if (payload.eventType === 'INSERT') {
            const newPayment = {
              ...payload.new,
              status: payload.new.status as Payment['status']
            } as Payment;
            
            setPaymentRequests(prev => [newPayment, ...prev]);
            setPendingPayments(prev => prev + 1);
          } else if (payload.eventType === 'UPDATE') {
            setPaymentRequests(prev => 
              prev.map(payment => {
                if (payment.id === payload.new.id) {
                  // Update counts when status changes
                  const newPayment = {
                    ...payload.new,
                    status: payload.new.status as Payment['status']
                  } as Payment;
                  
                  if (payment.status !== newPayment.status) {
                    if (newPayment.status === 'completed') {
                      setPendingPayments(p => p - 1);
                      setCompletedPayments(c => c + 1);
                    } else if (newPayment.status === 'failed' && (payment.status === 'pending' || payment.status === 'flagged')) {
                      setPendingPayments(p => p - 1);
                    }
                  }
                  return newPayment;
                }
                return payment;
              })
            );
          }
        }
      )
      .subscribe();
      
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(paymentsSubscription);
    };
  }, []);

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "flagged":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Expenses</CardDescription>
            <CardTitle className="text-2xl">${todayExpense}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Week's Total</CardDescription>
            <CardTitle className="text-2xl">${weekExpense}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Payments Pending</CardDescription>
            <CardTitle className="text-2xl">{pendingPayments}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => window.scrollTo({ 
                top: document.getElementById('payment-management')?.offsetTop, 
                behavior: 'smooth' 
              })}
            >
              View Pending
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Payments Completed</CardDescription>
            <CardTitle className="text-2xl">{completedPayments}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => window.scrollTo({ 
                top: document.getElementById('payment-management')?.offsetTop, 
                behavior: 'smooth' 
              })}
            >
              View History
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Spending vs Budget Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Weekly Spend vs. Budget</CardTitle>
          <CardDescription>
            Track your weekly expenses against the set budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer
              config={{
                spend: {
                  label: "Spend",
                  theme: {
                    light: "hsl(var(--primary))",
                    dark: "hsl(var(--primary))",
                  },
                },
                budget: {
                  label: "Budget",
                  theme: {
                    light: "hsl(var(--muted-foreground))",
                    dark: "hsl(var(--muted-foreground))",
                  },
                },
              }}
            >
              <LineChart data={spendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent />
                  } 
                />
                <Line 
                  type="monotone" 
                  dataKey="spend" 
                  stroke="var(--color-spend)" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="budget" 
                  stroke="var(--color-budget)" 
                  strokeDasharray="5 5" 
                />
              </LineChart>
            </ChartContainer>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <span className="text-sm font-medium">Set Next Week's Budget Target:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">$</span>
              <Input
                type="number"
                value={budgetTarget}
                onChange={(e) => setBudgetTarget(e.target.value)}
                className="w-28"
              />
              <Button size="sm">Set Budget</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card id="payment-management">
          <CardHeader>
            <CardTitle>Payment Management</CardTitle>
            <CardDescription>Review and process payment requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full">Approve/Reject Payments</Button>
            <Button variant="outline" className="w-full">View Payment History</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Create and manage user accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full"
              onClick={() => setIsUserDialogOpen(true)}
            >
              Create New User
            </Button>
            <Button variant="outline" className="w-full">Manage Existing Users</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Reports & Audit</CardTitle>
            <CardDescription>Export and review system logs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full">Export Activity Logs</Button>
            <Button variant="outline" className="w-full">View Fraud Alerts</Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Payment Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payment Requests</CardTitle>
            <CardDescription>Review and manage payment requests</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentRequests.length > 0 ? (
              paymentRequests.map(payment => (
                <Card key={payment.id} className="overflow-hidden">
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{payment.title}</h3>
                      <p className="text-sm text-muted-foreground">Amount: ${payment.amount}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewPayment(payment)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No payment requests found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <CreateUserDialog
        isOpen={isUserDialogOpen}
        onClose={() => setIsUserDialogOpen(false)}
      />
      
      {/* Payment Status Dialog */}
      <PaymentStatusDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        payment={selectedPayment}
      />
    </div>
  );
};

export default AdminDashboard;
