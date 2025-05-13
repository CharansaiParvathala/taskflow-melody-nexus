
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Payment } from "@/types/supabase";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PaymentStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: Payment;
}

export const PaymentStatusDialog = ({ isOpen, onClose, payment }: PaymentStatusDialogProps) => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

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

  const approvePayment = async () => {
    if (!payment) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          approved_by: currentUser.id,
          approved_at: new Date().toISOString(),
          notes: notes ? `${payment.notes ? `${payment.notes}\n\n` : ''}Approval note: ${notes}` : payment.notes
        })
        .eq('id', payment.id);

      if (error) throw error;
      
      toast.success("Payment request approved");
      onClose();
    } catch (error) {
      console.error("Error approving payment:", error);
      toast.error("Failed to approve payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectPayment = async () => {
    if (!payment) return;
    
    try {
      setIsSubmitting(true);
      
      if (!notes) {
        toast.error("Please provide a reason for rejection");
        return;
      }
      
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'failed',
          rejected_by: currentUser.id,
          rejected_at: new Date().toISOString(),
          notes: `${payment.notes ? `${payment.notes}\n\n` : ''}Rejection reason: ${notes}`
        })
        .eq('id', payment.id);

      if (error) throw error;
      
      toast.success("Payment request rejected");
      onClose();
    } catch (error) {
      console.error("Error rejecting payment:", error);
      toast.error("Failed to reject payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payment Request</span>
            {payment && (
              <Badge className={getStatusColor(payment.status)}>
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Review and update payment request status
          </DialogDescription>
        </DialogHeader>

        {payment ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">{payment.title}</h3>
              <p className="text-sm text-muted-foreground">Amount: ${payment.amount}</p>
              {payment.job_id && <p className="text-sm text-muted-foreground">Job ID: {payment.job_id}</p>}
            </div>
            
            {payment.notes && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{payment.notes}</p>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Add Notes</Label>
              <Textarea 
                id="notes" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={payment.status === "flagged" ? "Provide explanation for approval" : "Add notes (required for rejection)"}
                className="mt-2"
              />
            </div>

            {payment.status === "flagged" && (
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-md">
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  <strong>Warning:</strong> This payment request has been flagged for potential fraud.
                  Please review carefully before approving.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            No payment request data available
          </div>
        )}
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          {payment && (payment.status === "pending" || payment.status === "flagged") && currentUser.role === "admin" && (
            <>
              <Button 
                variant="destructive" 
                onClick={rejectPayment} 
                disabled={isSubmitting}
              >
                Reject
              </Button>
              <Button 
                onClick={approvePayment}
                disabled={isSubmitting}
              >
                Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
