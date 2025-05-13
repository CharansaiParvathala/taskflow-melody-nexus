
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Job } from "@/types/supabase";

interface AssignResourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job;
}

export const AssignResourceDialog = ({ isOpen, onClose, job }: AssignResourceDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_plate: "",
    vehicle_type: "",
    driver_name: "",
    driver_license: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!job) {
      toast.error("No job selected");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.vehicle_plate || !formData.vehicle_type || !formData.driver_name || !formData.driver_license) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      // Create vehicle resource in Supabase
      const { data, error } = await supabase
        .from('resources')
        .insert({
          name: `Vehicle: ${formData.vehicle_plate}`,
          type: 'vehicle',
          quantity: 1,
          status: 'assigned',
          // Store additional details in the metadata
          unit: formData.vehicle_type,
          // Use job ID as assigned_to reference
          assigned_to: job.id
        })
        .select();

      if (error) {
        throw error;
      }

      toast.success("Resources assigned successfully");
      onClose();
      
      // Reset form data
      setFormData({
        vehicle_plate: "",
        vehicle_type: "",
        driver_name: "",
        driver_license: ""
      });
    } catch (error) {
      console.error("Error assigning resources:", error);
      toast.error("Failed to assign resources");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Vehicle & Driver</DialogTitle>
          <DialogDescription>
            {job ? `Assign resources to job: ${job.title}` : "Assign resources to selected job"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vehicle_plate" className="text-right">
              Vehicle Plate*
            </Label>
            <Input
              id="vehicle_plate"
              name="vehicle_plate"
              value={formData.vehicle_plate}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vehicle_type" className="text-right">
              Vehicle Type*
            </Label>
            <Input
              id="vehicle_type"
              name="vehicle_type"
              value={formData.vehicle_type}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driver_name" className="text-right">
              Driver Name*
            </Label>
            <Input
              id="driver_name"
              name="driver_name"
              value={formData.driver_name}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driver_license" className="text-right">
              Driver License*
            </Label>
            <Input
              id="driver_license"
              name="driver_license"
              value={formData.driver_license}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !job}>
            {isSubmitting ? "Assigning..." : "Assign Resources"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
