// components/modals/edit-location-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api/axiosInterceptor";

interface Location {
  locationId: number;
  regionName: string;
  departmentName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface EditLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  location: Location | null;
}

export default function EditLocationModal({
  isOpen,
  onClose,
  onSuccess,
  location,
}: EditLocationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    regionName: "",
    departmentName: "",
    notes: "",
  });

  useEffect(() => {
    if (location) {
      setFormData({
        regionName: location.regionName,
        departmentName: location.departmentName,
        notes: location.notes || "",
      });
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;

    setIsLoading(true);
    try {
      await api.patch(`/locations/${location.locationId}`, {
        role: "admin", // This should probably come from user context in a real app
        regionName: formData.regionName,
        departmentName: formData.departmentName,
        notes: formData.notes,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating location:", error);
      // You might want to add toast notifications here
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-kr-maroon-dark">
            Edit Location
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="regionName">Region Name</Label>
            <Input
              id="regionName"
              name="regionName"
              value={formData.regionName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departmentName">Department Name</Label>
            <Input
              id="departmentName"
              name="departmentName"
              value={formData.departmentName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Optional notes about this location"
              disabled={isLoading}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-kr-maroon hover:bg-kr-maroon-dark"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Location"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}