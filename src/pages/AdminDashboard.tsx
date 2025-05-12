
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

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
  const [pendingPayments, setPendingPayments] = useState(12);
  const [completedPayments, setCompletedPayments] = useState(45);

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
            <Button size="sm" variant="outline" className="w-full">
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
            <Button size="sm" variant="outline" className="w-full">
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
        <Card>
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
            <Button className="w-full">Create New User</Button>
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
    </div>
  );
};

export default AdminDashboard;
