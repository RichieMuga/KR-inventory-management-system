"use client";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toggleMoveModal } from "@/lib/features/modals/unique-asset-tracking-modal";
import { UniqueAsset } from "@/lib/data/uniqueAssets";
import type { RootState } from "@/lib/store";

interface Location {
  locationId: number;
  regionName: string;
  departmentName: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface MoveAssetFormData {
  toLocationId: number;
  notes?: string;
}

interface MoveAssetModalProps {
  selectedAsset: UniqueAsset | null;
  locations: Location[];
  locationsLoading: boolean;
  onMove: (assignmentId: string, moveData: MoveAssetFormData) => void;
  isLoading: boolean;
}

export default function MoveAssetModal({
  selectedAsset,
  locations,
  locationsLoading,
  onMove,
  isLoading
}: MoveAssetModalProps) {
  const dispatch = useDispatch();
  const { isMoveModalOpen } = useSelector(
    (state: RootState) => state.uniqueAssetTrackingModal
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<MoveAssetFormData>();

  const watchedLocationId = watch("toLocationId");

  const handleClose = () => {
    reset();
    dispatch(toggleMoveModal());
  };

  const onSubmit = (data: MoveAssetFormData) => {
    if (selectedAsset) {
      // For now, we'll use the asset ID as assignment ID
      // You may need to adjust this based on your data structure
      const assignmentId = selectedAsset.id;
      onMove(assignmentId, data);
      reset();
    }
  };

  const handleLocationChange = (value: string) => {
    setValue("toLocationId", parseInt(value), { shouldValidate: true });
  };

  return (
    <Dialog open={isMoveModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Asset</DialogTitle>
          <DialogDescription>
            Update the current location of {selectedAsset?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Asset Info */}
          {selectedAsset && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm">
                <p><span className="font-medium">Asset:</span> {selectedAsset.name}</p>
                <p><span className="font-medium">Serial:</span> {selectedAsset.serialNumber}</p>
                <p><span className="font-medium">Current Location:</span> {selectedAsset.movedTo}</p>
              </div>
            </div>
          )}

          {/* New Location Selection */}
          <div className="space-y-2">
            <Label htmlFor="location">New Location *</Label>
            {locationsLoading ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading locations...</span>
              </div>
            ) : (
              <Select onValueChange={handleLocationChange} value={watchedLocationId?.toString() || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.locationId} value={location.locationId.toString()}>
                      {location.regionName} - {location.departmentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.toLocationId && (
              <p className="text-sm text-red-500">Please select a location</p>
            )}
            {/* Hidden input for form validation */}
            <input
              type="hidden"
              {...register("toLocationId", { 
                required: "Please select a location",
                valueAsNumber: true
              })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this move..."
              {...register("notes")}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isLoading || locationsLoading || !watchedLocationId}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Moving...
                </>
              ) : (
                "Move Asset"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}