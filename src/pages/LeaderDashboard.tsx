
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const projectData = [
  { name: "Project A", complete: 65 },
  { name: "Project B", complete: 40 },
  { name: "Project C", complete: 90 },
  { name: "Project D", complete: 10 },
];

const pieData = [
  { name: "In Progress", value: 3 },
  { name: "Completed", value: 2 },
  { name: "Not Started", value: 1 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const LeaderDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Team Leader Dashboard</h1>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Planning</CardTitle>
            <CardDescription>Create new jobs and assign resources</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Create New Job</Button>
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
    </div>
  );
};

export default LeaderDashboard;
