import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { CreateJobDialog } from "@/components/job/CreateJobDialog";
import { JobCard } from "@/components/job/JobCard";
import { toast } from "sonner";
import { Job } from "@/types/supabase";
import { useAuth } from "@/contexts/AuthContext";

// Project progress mock data
const projectData = [
  { name: "Project A", complete: 65 },
  { name: "Project B", complete: 40 },
  { name: "Project C", complete: 90 },
  { name: "Project D", complete: 10 },
];

// Status overview mock data
const pieData = [
  { name: "In Progress", value: 3 },
  { name: "Completed", value: 2 },
  { name: "Not Started", value: 1 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const LeaderDashboard = () => {
  const { logout } = useAuth();
  const [isCreateJobDialogOpen, setIsCreateJobDialogOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch jobs from Supabase
    const fetchJobs = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
    
    // Set up real-time subscription
    const jobsSubscription = supabase
      .channel('public:jobs')
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
      
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(jobsSubscription);
    };
  }, []);

  // Helper function to validate job status
  const validateJobStatus = (status: string): Job['status'] => {
    const validStatuses: Job['status'][] = ['pending', 'in-progress', 'completed', 'cancelled'];
    return validStatuses.includes(status as Job['status']) 
      ? (status as Job['status']) 
      : 'pending';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Leader Dashboard</h1>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Planning</CardTitle>
            <CardDescription>Create new jobs and assign resources</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full"
              onClick={() => setIsCreateJobDialogOpen(true)}
            >
              Create New Job
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Manage vehicles and personnel</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Assign Resources</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Requests</CardTitle>
            <CardDescription>Submit new payment requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Create Payment Request</Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Jobs List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Current Jobs</CardTitle>
            <CardDescription>Manage and track your active jobs</CardDescription>
          </div>
          <Button 
            size="sm"
            onClick={() => setIsCreateJobDialogOpen(true)}
          >
            Add New Job
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                {loading ? "Loading jobs..." : "No jobs found. Create one to get started."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Project Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>Current completion status of active projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer
              config={{
                complete: {
                  label: "Completion %",
                  theme: {
                    light: "hsl(var(--primary))",
                    dark: "hsl(var(--primary))",
                  },
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectData}
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
                  <Bar dataKey="complete" fill="var(--color-complete)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Project Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Project Status Overview</CardTitle>
          <CardDescription>Distribution of projects by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Task Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Task Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today">
            <TabsList className="mb-4">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
            </TabsList>
            <TabsContent value="today" className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="font-medium">Update Project A Progress</div>
                <div className="text-sm text-muted-foreground">Due by 5:00 PM</div>
              </div>
              <div className="border rounded-md p-4">
                <div className="font-medium">Submit Weekly Report</div>
                <div className="text-sm text-muted-foreground">Due by 6:00 PM</div>
              </div>
            </TabsContent>
            <TabsContent value="week" className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="font-medium">Client Meeting - Project B</div>
                <div className="text-sm text-muted-foreground">Wednesday, 2:00 PM</div>
              </div>
              <div className="border rounded-md p-4">
                <div className="font-medium">Resource Allocation Planning</div>
                <div className="text-sm text-muted-foreground">Thursday, 10:00 AM</div>
              </div>
              <div className="border rounded-md p-4">
                <div className="font-medium">Monthly Budget Review</div>
                <div className="text-sm text-muted-foreground">Friday, 11:00 AM</div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog for creating a new job */}
      <CreateJobDialog 
        isOpen={isCreateJobDialogOpen}
        onClose={() => setIsCreateJobDialogOpen(false)}
      />
    </div>
  );
};

export default LeaderDashboard;
