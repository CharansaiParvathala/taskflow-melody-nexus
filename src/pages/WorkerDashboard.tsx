
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const WorkerDashboard = () => {
  // Mock data for assigned tasks
  const tasks = [
    {
      id: 1,
      title: "Site Cleanup - Project A",
      date: "2025-05-12",
      location: "123 Main St, Springfield",
      status: "in-progress",
      description: "Clean up debris and prepare site for new equipment installation.",
    },
    {
      id: 2,
      title: "Equipment Installation - Project B",
      date: "2025-05-13",
      location: "456 Oak Ave, Shelbyville",
      status: "upcoming",
      description: "Install and calibrate new monitoring equipment at the site.",
    },
    {
      id: 3,
      title: "Maintenance Check - Project C",
      date: "2025-05-14",
      location: "789 Pine Rd, Capital City",
      status: "upcoming",
      description: "Perform regular maintenance check on all installed systems.",
    },
  ];

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
            {tasks
              .filter(task => task.date === "2025-05-12")
              .map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              
            {tasks.filter(task => task.date === "2025-05-12").length === 0 && (
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
            {tasks
              .filter(task => task.date !== "2025-05-12")
              .map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              
            {tasks.filter(task => task.date !== "2025-05-12").length === 0 && (
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
                <Button>Upload Files</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for task cards
const TaskCard = ({ task }: { task: any }) => {
  const statusColors = {
    "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "upcoming": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    "completed": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  };
  
  const statusLabels = {
    "in-progress": "In Progress",
    "upcoming": "Upcoming",
    "completed": "Completed",
  };

  return (
    <Card className="border">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <CardDescription>{task.date} - {task.location}</CardDescription>
          </div>
          <Badge className={statusColors[task.status as keyof typeof statusColors]}>
            {statusLabels[task.status as keyof typeof statusLabels]}
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
          {task.status === "in-progress" && (
            <Button size="sm" className="flex-1">
              Mark Complete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default WorkerDashboard;
