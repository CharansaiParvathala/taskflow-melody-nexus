
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/types/supabase";
import { toast } from "sonner";
import { PaymentStatusDialog } from "@/components/payment/PaymentStatusDialog";

// Mock data
const fraudRateData = [
  { name: "Mon", rate: 5 },
  { name: "Tue", rate: 3 },
  { name: "Wed", rate: 7 },
  { name: "Thu", rate: 2 },
  { name: "Fri", rate: 4 },
  { name: "Sat", rate: 1 },
  { name: "Sun", rate: 0 },
];

const CheckerDashboard = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>(undefined);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  
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
        
        setPayments(data || []);
        
        // Count payments by status
        const newCount = data?.filter(p => p.status === 'pending').length || 0;
        const flagged = data?.filter(p => p.status === 'flagged').length || 0;
        const pendingClarification = data?.filter(p => p.status === 'pending' && p.notes?.includes('clarification')).length || 0;
        
        setNewRequestsCount(newCount);
        setFlaggedCount(flagged);
        setPendingCount(pendingClarification);
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
            setPayments(prev => [payload.new as Payment, ...prev]);
            if (payload.new.status === 'pending') {
              setNewRequestsCount(prev => prev + 1);
            } else if (payload.new.status === 'flagged') {
              setFlaggedCount(prev => prev + 1);
            }
          } else if (payload.eventType === 'UPDATE') {
            setPayments(prev => 
              prev.map(payment => {
                if (payment.id === payload.new.id) {
                  // Update counts when status changes
                  if (payment.status !== payload.new.status) {
                    updateStatusCounts(payment.status, payload.new.status);
                  }
                  return payload.new as Payment;
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

  // Helper function to update status counts when a payment status changes
  const updateStatusCounts = (oldStatus: string, newStatus: string) => {
    if (oldStatus === 'pending') {
      setNewRequestsCount(prev => prev - 1);
    } else if (oldStatus === 'flagged') {
      setFlaggedCount(prev => prev - 1);
    }
    
    if (newStatus === 'pending') {
      setNewRequestsCount(prev => prev + 1);
    } else if (newStatus === 'flagged') {
      setFlaggedCount(prev => prev + 1);
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentDialogOpen(true);
  };

  const filterPaymentsByStatus = (status: string) => {
    return payments.filter(payment => payment.status === status);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quality Checker Dashboard</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardDescription>New Requests</CardDescription>
            <CardTitle className="text-2xl">{newRequestsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => document.querySelector('[data-value="new"]')?.click()}
            >
              View All Requests
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardDescription>Flagged Anomalies</CardDescription>
            <CardTitle className="text-2xl text-destructive">{flaggedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => document.querySelector('[data-value="flagged"]')?.click()}
            >
              Review Anomalies
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardDescription>Pending Clarifications</CardDescription>
            <CardTitle className="text-2xl">{pendingCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" className="w-full">
              Check Status
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Approval Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Request Approval Workflow</CardTitle>
          <CardDescription>Review and process payment requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="new">
            <TabsList className="mb-4">
              <TabsTrigger value="new">New Requests</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value="new" className="space-y-4">
              {filterPaymentsByStatus('pending').length > 0 ? (
                filterPaymentsByStatus('pending').map(payment => (
                  <RequestCard 
                    key={payment.id}
                    payment={payment}
                    onView={() => handleViewPayment(payment)}
                  />
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No new payment requests.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="flagged" className="space-y-4">
              {filterPaymentsByStatus('flagged').length > 0 ? (
                filterPaymentsByStatus('flagged').map(payment => (
                  <RequestCard 
                    key={payment.id}
                    payment={payment}
                    onView={() => handleViewPayment(payment)}
                    flaggedReason="Potential anomaly detected in cost values"
                  />
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No flagged payment requests.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="approved" className="space-y-4">
              {filterPaymentsByStatus('completed').length > 0 ? (
                filterPaymentsByStatus('completed').map(payment => (
                  <RequestCard 
                    key={payment.id}
                    payment={payment}
                    onView={() => handleViewPayment(payment)}
                  />
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No approved payment requests.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="rejected" className="space-y-4">
              {filterPaymentsByStatus('failed').length > 0 ? (
                filterPaymentsByStatus('failed').map(payment => (
                  <RequestCard 
                    key={payment.id}
                    payment={payment}
                    onView={() => handleViewPayment(payment)}
                  />
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No rejected payment requests.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Fraud Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Fraud Detection Rate</CardTitle>
          <CardDescription>Percentage of requests flagged for potential fraud</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer
              config={{
                rate: {
                  label: "Fraud Rate %",
                  theme: {
                    light: "hsl(var(--destructive))",
                    dark: "hsl(var(--destructive))",
                  },
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={fraudRateData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="rate" fill="var(--color-rate)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status Dialog */}
      <PaymentStatusDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        payment={selectedPayment}
      />
    </div>
  );
};

// Helper component for displaying payment requests
interface RequestCardProps {
  payment: Payment;
  onView: () => void;
  flaggedReason?: string;
}

const RequestCard = ({ payment, onView, flaggedReason }: RequestCardProps) => {
  const statusColors = {
    pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    flagged: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  };
  
  const statusLabels = {
    pending: "New",
    flagged: "Flagged",
    completed: "Approved",
    failed: "Rejected"
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Use the status from the payment object or default to 'pending'
  const status = payment.status as keyof typeof statusColors || 'pending';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{payment.title}</CardTitle>
            <CardDescription>
              {payment.created_at && `Requested on ${formatDate(payment.created_at)}`}
            </CardDescription>
          </div>
          <Badge className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-semibold">${parseFloat(payment.amount.toString()).toLocaleString()}</div>
        
        {flaggedReason && (
          <div className="mt-2 text-sm p-2 bg-destructive/10 text-destructive rounded-md">
            <span className="font-semibold">Anomaly detected:</span> {flaggedReason}
          </div>
        )}
        
        {payment.notes && (
          <div className="mt-2 text-sm">
            <span className="font-medium">Notes:</span> {payment.notes}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 flex gap-2">
        {payment.status === "pending" || payment.status === "flagged" ? (
          <>
            <Button size="sm" variant="outline" className="flex-1" onClick={onView}>
              Request Clarification
            </Button>
            <Button size="sm" variant="destructive" className="flex-1" onClick={onView}>
              Flag Issue
            </Button>
            <Button size="sm" className="flex-1" onClick={onView}>
              View Details
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" className="w-full" onClick={onView}>
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CheckerDashboard;
