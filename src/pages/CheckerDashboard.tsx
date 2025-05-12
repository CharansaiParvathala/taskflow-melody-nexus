
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

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
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quality Checker Dashboard</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardDescription>New Requests</CardDescription>
            <CardTitle className="text-2xl">7</CardTitle>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" className="w-full">
              View All Requests
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardDescription>Flagged Anomalies</CardDescription>
            <CardTitle className="text-2xl text-destructive">3</CardTitle>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" className="w-full">
              Review Anomalies
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardDescription>Pending Clarifications</CardDescription>
            <CardTitle className="text-2xl">5</CardTitle>
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
              {/* New Requests */}
              <RequestCard 
                title="Labor Payment - Project A"
                requester="John Doe"
                amount={1250}
                date="2025-05-11"
                status="new"
              />
              <RequestCard 
                title="Equipment Rental - Project B"
                requester="Alice Smith"
                amount={3450}
                date="2025-05-11"
                status="new"
              />
            </TabsContent>
            
            <TabsContent value="flagged" className="space-y-4">
              {/* Flagged Requests */}
              <RequestCard 
                title="Miscellaneous Expenses - Project C"
                requester="Bob Johnson"
                amount={2150}
                date="2025-05-10"
                status="flagged"
                anomaly="Statistical outlier: 45% higher than similar jobs"
              />
              <RequestCard 
                title="Water Supply - Project A"
                requester="John Doe"
                amount={780}
                date="2025-05-10"
                status="flagged"
                anomaly="Geolocation mismatch with uploaded receipt"
              />
            </TabsContent>
            
            <TabsContent value="approved" className="space-y-4">
              {/* Approved Requests */}
              <RequestCard 
                title="Food Supplies - Project D"
                requester="Sarah Wilson"
                amount={950}
                date="2025-05-09"
                status="approved"
              />
            </TabsContent>
            
            <TabsContent value="rejected" className="space-y-4">
              {/* Rejected Requests */}
              <RequestCard 
                title="Labor Overtime - Project B"
                requester="Alice Smith"
                amount={1820}
                date="2025-05-08"
                status="rejected"
                anomaly="Exceeded maximum labor hours per day"
              />
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
    </div>
  );
};

// Helper component for displaying payment requests
const RequestCard = ({
  title,
  requester,
  amount,
  date,
  status,
  anomaly
}: {
  title: string;
  requester: string;
  amount: number;
  date: string;
  status: "new" | "flagged" | "approved" | "rejected";
  anomaly?: string;
}) => {
  const statusColors = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    flagged: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  };
  
  const statusLabels = {
    new: "New",
    flagged: "Flagged",
    approved: "Approved",
    rejected: "Rejected"
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Requested by {requester} on {date}</CardDescription>
          </div>
          <Badge className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-semibold">${amount.toLocaleString()}</div>
        
        {anomaly && (
          <div className="mt-2 text-sm p-2 bg-destructive/10 text-destructive rounded-md">
            <span className="font-semibold">Anomaly detected:</span> {anomaly}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 flex gap-2">
        {status === "new" || status === "flagged" ? (
          <>
            <Button size="sm" variant="outline" className="flex-1">Request Clarification</Button>
            <Button size="sm" variant="destructive" className="flex-1">Reject</Button>
            <Button size="sm" className="flex-1">Approve</Button>
          </>
        ) : (
          <Button size="sm" variant="outline" className="w-full">View Details</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CheckerDashboard;
