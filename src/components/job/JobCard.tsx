
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types/supabase";
import { AssignResourceDialog } from "@/components/job/AssignResourceDialog";
import { CreatePaymentRequestDialog } from "@/components/payment/CreatePaymentRequestDialog";
import { useAuth } from "@/contexts/AuthContext";

interface JobCardProps {
  job: Job;
}

export const JobCard = ({ job }: JobCardProps) => {
  const { currentUser } = useAuth();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Format date nicely
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "No date set";
    return new Date(dateString).toLocaleDateString();
  };

  // Get appropriate color for status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <Badge className={getStatusColor(job.status)}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {job.due_date ? `Due: ${formatDate(job.due_date)}` : "No due date"} • {job.location}
          </p>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm">{job.description}</p>
          
          <div className="mt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-medium">${job.budget}</span>
            </div>
            {job.assigned_to && (
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Assigned To:</span>
                <span>{job.assigned_to}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-2 border-t pt-4">
          {currentUser.role === "leader" && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setIsAssignDialogOpen(true)}
              >
                Assign Resources
              </Button>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => setIsPaymentDialogOpen(true)}
              >
                Payment Request
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
      
      <AssignResourceDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        job={job}
      />
      
      <CreatePaymentRequestDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        job={job}
      />
    </>
  );
};
