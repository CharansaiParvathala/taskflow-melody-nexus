import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/supabase";
import { toast } from "sonner";

const WorkerDashboard = () => {
  const [tasks, setTasks] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function fetchAssignedJobs() {
      try {
        setLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData?.user) {
          toast.error("You must be logged in to view your tasks");
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('assigned_to', userData.user.id);
          
        if (error) {
          console.error("Error fetching jobs:", error);
          toast.error("Failed to load tasks");
        } else {
          // Convert the data to match our Job type
          const typedData = data?.map(job => ({
            ...job,
            // Ensure the status is one of the allowed values in our Job type
            status: validateJobStatus(job.status)
          })) as Job[];
          
          setTasks(typedData || []);
        }
      } catch (error) {
        console.error("Error in fetchAssignedJobs:", error);
        toast.error("An error occurred while fetching your tasks");
      } finally {
        setLoading(false);
      }
    }
    
    fetchAssignedJobs();
  }, []);

  // Helper function to validate job status
  const validateJobStatus = (status: string): "pending" | "in-progress" | "completed" | "cancelled" => {
    const validStatuses = ["pending", "in-progress", "completed", "cancelled"];
    if (validStatuses.includes(status)) {
      return status as "pending" | "in-progress" | "completed" | "cancelled";
    }
    // Default to "pending" if the status is not one of the expected values
    return "pending";
  };

  const getTaskDate = (task: Job) => {
    if (task.due_date) {
      return new Date(task.due_date).toISOString().split('T')[0];
    }
    return today;
  };

  const handleMarkComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'completed' })
        .eq('id', taskId);
        
      if (error) {
        console.error("Error updating job status:", error);
        toast.error("Failed to update task status");
      } else {
        toast.success("Task marked as complete");
        // Update local state to reflect the change
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, status: 'completed' } : task
        ));
      }
    } catch (error) {
      console.error("Error in handleMarkComplete:", error);
      toast.error("An error occurred while updating the task");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Field Worker Dashboard</h1>
      
      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
          <CardDescription>Your assigned jobs for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <>
                <TaskSkeleton />
                <TaskSkeleton />
              </>
            ) : (
              tasks
                .filter(task => getTaskDate(task) === today)
                .map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onMarkComplete={handleMarkComplete} 
                  />
                ))
            )}
              
            {!loading && tasks.filter(task => getTaskDate(task) === today).length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No tasks scheduled for today
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Schedule</CardTitle>
          <CardDescription>Your tasks for the upcoming days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <>
                <TaskSkeleton />
                <TaskSkeleton />
              </>
            ) : (
              tasks
                .filter(task => getTaskDate(task) !== today)
                .map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onMarkComplete={handleMarkComplete} 
                  />
                ))
            )}
              
            {!loading && tasks.filter(task => getTaskDate(task) !== today).length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No upcoming tasks scheduled
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Upload Work Proof */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Work Proof</CardTitle>
          <CardDescription>Submit photos or documents as proof of completed work</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Click or drag files to upload proof of work
              </p>
              <div className="mt-4">
                <Button onClick={() => toast.info("File upload feature coming soon")}>Upload Files</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TaskSkeleton = () => (
  <Card className="border">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </CardContent>
    <CardFooter className="border-t pt-4">
      <div className="w-full flex gap-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </CardFooter>
  </Card>
);

// Helper component for task cards
const TaskCard = ({ task, onMarkComplete }: { task: Job, onMarkComplete: (id: string) => Promise<void> }) => {
  const statusColors: Record<string, string> = {
    "pending": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "completed": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    "cancelled": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  
  const statusLabels: Record<string, string> = {
    "pending": "Pending",
    "in-progress": "In Progress",
    "completed": "Completed",
    "cancelled": "Cancelled",
  };

  const dateString = task.due_date 
    ? new Date(task.due_date).toLocaleDateString() 
    : new Date().toLocaleDateString();

  return (
    <Card className="border">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <CardDescription>{dateString} - {task.location}</CardDescription>
          </div>
          <Badge className={statusColors[task.status] || statusColors.pending}>
            {statusLabels[task.status] || statusLabels.pending}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{task.description}</p>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            View Details
          </Button>
          {(task.status === "pending" || task.status === "in-progress") && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onMarkComplete(task.id)}
            >
              Mark Complete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default WorkerDashboard;
