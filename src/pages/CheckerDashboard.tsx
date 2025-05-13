
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Payment, Job } from "@/types/supabase";
import { CreateJobDialog } from "@/components/job/CreateJobDialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CheckerDashboard = () => {
  const { logout } = useAuth();
  const [paymentRequests, setPaymentRequests] = useState<Payment[]>([]);
  const [flaggedRequests, setFlaggedRequests] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isCreateJobDialogOpen, setIsCreateJobDialogOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch jobs from Supabase
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Cast the data to ensure it matches our Job type
        const typedJobs = data?.map(job => ({
          ...job,
          status: validateJobStatus(job.status)
        })) || [];
        
        setJobs(typedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs");
      }
    };

    fetchJobs();
    
    // Set up real-time subscription for jobs
    const jobsSubscription = supabase
      .channel('checker:jobs')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'jobs' 
        }, 
        payload => {
          if (payload.eventType === 'INSERT') {
            const newJob = {
              ...payload.new,
              status: validateJobStatus(payload.new.status)
            } as Job;
            
            setJobs(prevJobs => [newJob, ...prevJobs]);
          } else if (payload.eventType === 'UPDATE') {
            setJobs(prevJobs => 
              prevJobs.map(job => {
                if (job.id === payload.new.id) {
                  return {
                    ...payload.new,
                    status: validateJobStatus(payload.new.status)
                  } as Job;
                }
                return job;
              })
            );
          } else if (payload.eventType === 'DELETE') {
            setJobs(prevJobs => prevJobs.filter(job => job.id !== payload.old.id));
          }
        }
      )
      .subscribe();
      
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
          status: validatePaymentStatus(payment.status)
        })) || [];
        
        setPaymentRequests(typedPayments);
        
        // Filter for flagged requests
        const flagged = typedPayments.filter(p => p.status === 'flagged');
        setFlaggedRequests(flagged);
        
      } catch (error) {
        console.error("Error fetching payment requests:", error);
        toast.error("Failed to load payment requests");
      }
    };
    
    fetchPaymentRequests();
    
    // Set up real-time subscription for payments
    const paymentsSubscription = supabase
      .channel('checker:payments')
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
              status: validatePaymentStatus(payload.new.status)
            } as Payment;
            
            setPaymentRequests(prev => [newPayment, ...prev]);
            
            // Add to flagged if applicable
            if (newPayment.status === 'flagged') {
              setFlaggedRequests(prev => [newPayment, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setPaymentRequests(prev => 
              prev.map(payment => {
                if (payment.id === payload.new.id) {
                  const newPayment = {
                    ...payload.new,
                    status: validatePaymentStatus(payload.new.status)
                  } as Payment;
                  
                  // Update flagged requests if status changed
                  if (payment.status !== newPayment.status) {
                    if (newPayment.status === 'flagged') {
                      setFlaggedRequests(prev => [...prev, newPayment]);
                    } else if (payment.status === 'flagged') {
                      setFlaggedRequests(prev => 
                        prev.filter(p => p.id !== payment.id)
                      );
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
      supabase.removeChannel(jobsSubscription);
      supabase.removeChannel(paymentsSubscription);
    };
  }, []);

  // Helper function to validate job status
  const validateJobStatus = (status: string): Job['status'] => {
    const validStatuses: Job['status'][] = ['pending', 'in-progress', 'completed', 'cancelled'];
    return validStatuses.includes(status as Job['status']) 
      ? (status as Job['status']) 
      : 'pending';
  };

  // Helper function to validate payment status
  const validatePaymentStatus = (status: string): Payment['status'] => {
    const validStatuses: Payment['status'][] = ['pending', 'completed', 'failed', 'flagged'];
    return validStatuses.includes(status as Payment['status']) 
      ? (status as Payment['status']) 
      : 'pending';
  };

  const handleReviewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    
    // Open dialog
    setTimeout(() => {
      if (dialogRef.current) {
        const dialogElement = dialogRef.current.querySelector('button[data-state="closed"]');
        if (dialogElement) {
          (dialogElement as HTMLElement).click();
        }
      }
    }, 0);
  };

  const getStatusColor = (status: Payment['status']) => {
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quality Checker Dashboard</h1>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>
      
      {/* Alerts Section - For flagged payment requests */}
      {flaggedRequests.length > 0 && (
        <Card className="border-orange-500 dark:border-orange-700">
          <CardHeader>
            <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Flagged Payment Requests
            </CardTitle>
            <CardDescription>
              These payment requests have been automatically flagged for review due to potential fraud indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flaggedRequests.map((payment) => (
                <Card key={payment.id} className="border-l-4 border-l-orange-500">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{payment.title}</h3>
                        <p className="text-sm text-muted-foreground">Amount: ${payment.amount}</p>
                        <div className="mt-2">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReviewPayment(payment)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Jobs Management</CardTitle>
            <CardDescription>Review jobs and create new ones</CardDescription>
          </div>
          <Button onClick={() => setIsCreateJobDialogOpen(true)}>
            Create New Job
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.length > 0 ? (
              jobs.map(job => (
                <Card key={job.id} className="overflow-hidden">
                  <div className="p-4">
                    <h3 className="font-medium">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                        <Badge>{job.status}</Badge>
                        <span className="text-sm">Budget: ${job.budget}</span>
                      </div>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No jobs found. Create one to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Payment Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Requests</CardTitle>
          <CardDescription>
            Review incoming payment requests by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            {/* All Payments Tab Content */}
            <TabsContent value="all" className="mt-4 space-y-4">
              {paymentRequests.length > 0 ? (
                paymentRequests.map(payment => (
                  <Card key={payment.id} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{payment.title}</h3>
                          <p className="text-sm text-muted-foreground">Amount: ${payment.amount}</p>
                          <div className="mt-2">
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReviewPayment(payment)}
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
            </TabsContent>
            
            {/* Filter by status tabs */}
            <TabsContent value="pending" className="mt-4 space-y-4">
              {paymentRequests.filter(p => p.status === 'pending').map(payment => (
                <Card key={payment.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{payment.title}</h3>
                        <p className="text-sm text-muted-foreground">Amount: ${payment.amount}</p>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReviewPayment(payment)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="flagged" className="mt-4 space-y-4">
              {paymentRequests.filter(p => p.status === 'flagged').map(payment => (
                <Card key={payment.id} className="overflow-hidden border-l-4 border-l-orange-500">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{payment.title}</h3>
                        <p className="text-sm text-muted-foreground">Amount: ${payment.amount}</p>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReviewPayment(payment)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4 space-y-4">
              {paymentRequests.filter(p => p.status === 'completed').map(payment => (
                <Card key={payment.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{payment.title}</h3>
                        <p className="text-sm text-muted-foreground">Amount: ${payment.amount}</p>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReviewPayment(payment)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Job Dialog */}
      <CreateJobDialog
        isOpen={isCreateJobDialogOpen}
        onClose={() => setIsCreateJobDialogOpen(false)}
      />

      {/* Reference for payment review dialog */}
      <div ref={dialogRef}></div>
    </div>
  );
};

export default CheckerDashboard;
