
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Job } from "@/types/supabase";

interface CreatePaymentRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job;
}

export const CreatePaymentRequestDialog = ({ isOpen, onClose, job }: CreatePaymentRequestDialogProps) => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    food_cost: 0,
    labor_cost: 0,
    vehicle_cost: 0,
    fuel_cost: 0,
    mileage: 0,
    notes: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name.includes('cost') || name === 'mileage' ? parseFloat(value) || 0 : value 
    }));
  };

  const calculateTotalCost = () => {
    return formData.food_cost + formData.labor_cost + formData.vehicle_cost + formData.fuel_cost;
  };

  // Simple fraud detection based on mileage and fuel cost
  const detectPotentialFraud = () => {
    // If mileage is provided, check if fuel cost seems excessive
    // This is a simplified example - in a real app, you'd have more sophisticated rules
    if (formData.mileage > 0 && formData.fuel_cost > 0) {
      const fuelCostPerMile = formData.fuel_cost / formData.mileage;
      // Flag if cost per mile is above threshold (e.g., $0.50 per mile)
      return fuelCostPerMile > 0.5;
    }
    return false;
  };

  const handleSubmit = async () => {
    if (!job) {
      toast.error("No job selected");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.title) {
        toast.error("Please provide a payment request title");
        return;
      }

      const totalAmount = calculateTotalCost();
      const isPotentialFraud = detectPotentialFraud();
      
      // Create payment request in Supabase
      const { data, error } = await supabase
        .from('payments')
        .insert({
          title: formData.title,
          amount: totalAmount,
          job_id: job.id,
          created_by: currentUser.id,
          notes: formData.notes,
          status: isPotentialFraud ? 'flagged' : 'pending'
        })
        .select();

      if (error) {
        throw error;
      }

      if (isPotentialFraud) {
        toast.warning("Payment request has been flagged for review due to potential anomalies");
      } else {
        toast.success("Payment request submitted successfully");
      }
      
      onClose();
      
      // Reset form data
      setFormData({
        title: "",
        food_cost: 0,
        labor_cost: 0,
        vehicle_cost: 0,
        fuel_cost: 0,
        mileage: 0,
        notes: ""
      });
    } catch (error) {
      console.error("Error submitting payment request:", error);
      toast.error("Failed to submit payment request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Payment Request</DialogTitle>
          <DialogDescription>
            {job ? `Submit payment request for job: ${job.title}` : "Submit a new payment request"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Request Title*
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="food_cost" className="text-right">
              Food Cost
            </Label>
            <Input
              id="food_cost"
              name="food_cost"
              type="number"
              value={formData.food_cost}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="labor_cost" className="text-right">
              Labor Cost
            </Label>
            <Input
              id="labor_cost"
              name="labor_cost"
              type="number"
              value={formData.labor_cost}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vehicle_cost" className="text-right">
              Vehicle Cost
            </Label>
            <Input
              id="vehicle_cost"
              name="vehicle_cost"
              type="number"
              value={formData.vehicle_cost}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="fuel_cost" className="text-right">
                Fuel Cost
              </Label>
              <Input
                id="fuel_cost"
                name="fuel_cost"
                type="number"
                value={formData.fuel_cost}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="mileage" className="text-right">
                Mileage
              </Label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                value={formData.mileage}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="col-span-3"
              rows={3}
            />
          </div>

          <div className="col-span-full">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium">Total Request Amount: ${calculateTotalCost().toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !job}>
            {isSubmitting ? "Submitting..." : "Submit Payment Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
