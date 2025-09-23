// components/modals/delete-location-modal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api/axiosInterceptor";

interface DeleteLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  location: { locationId: number; regionName: string; departmentName: string } | null;
}

export default function DeleteLocationModal({
  isOpen,
  onClose,
  onSuccess,
  location,
}: DeleteLocationModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!location) return;

    setIsLoading(true);
    try {
      await api.delete(`/locations/${location.locationId}`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting location:", error);
      // You might want to add toast notifications here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delete Location
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this location? This action cannot be undone.
          </p>
          
          {location && (
            <div className="bg-muted p-3 rounded-md">
              <p className="font-medium">{location.regionName}</p>
              <p className="text-sm text-muted-foreground">{location.departmentName}</p>
            </div>
          )}
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
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Location"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}