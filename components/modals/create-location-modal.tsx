"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/api/axiosInterceptor"; // Update this path to match your axios instance location
import { X, MapPin, Building, FileText } from "lucide-react";

interface LocationFormData {
  regionName: string;
  departmentName: string;
  notes: string;
}

interface LocationResponse {
  locationId: number;
  regionName: string;
  departmentName: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: LocationResponse;
  message: string;
}

interface CreateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (location: LocationResponse) => void;
}

const CreateLocationModal: React.FC<CreateLocationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LocationFormData>({
    defaultValues: {
      regionName: "",
      departmentName: "",
      notes: "",
    },
  });

  const regions = [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Eldoret",
    "Nyeri",
  ];

  // Create location mutation
  const createLocationMutation = useMutation({
    mutationFn: async (data: LocationFormData): Promise<ApiResponse> => {
      const response = await api.post("/locations", data);
      return response.data;
    },
    onSuccess: (response) => {
      // Invalidate and refetch any queries related to locations
      queryClient.invalidateQueries({ queryKey: ["locations"] });

      // Call the onSubmit prop if provided
      if (onSubmit) {
        onSubmit(response.data);
      }

      // Reset form and close modal
      reset();
      onClose();
    },
    onError: (error) => {
      console.error("Error creating location:", error);
      // You might want to show a toast notification here
    },
  });

  const onFormSubmit = (data: LocationFormData) => {
    createLocationMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-kr-orange" />
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Location
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={createLocationMutation.isPending}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          <p className="text-gray-600 text-sm">
            Add a new location to the system with its details and regional
            assignment.
          </p>

          {/* General error message */}
          {createLocationMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">
                {createLocationMutation.error instanceof AxiosError
                  ? createLocationMutation.error.response?.data?.message ||
                    createLocationMutation.error.message ||
                    "Failed to create location"
                  : "An unexpected error occurred"}
              </p>
            </div>
          )}

          {/* Region */}
          <div>
            <label
              htmlFor="regionName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Region <span className="text-red-500">*</span>
            </label>
            <select
              id="regionName"
              {...register("regionName", {
                required: "Region is required",
              })}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-kr-orange focus:border-kr-orange transition-colors ${
                errors.regionName ? "border-red-500" : "border-gray-300"
              }`}
              disabled={createLocationMutation.isPending}
            >
              <option value="">Select a region</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {errors.regionName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.regionName.message}
              </p>
            )}
          </div>

          {/* Department Name */}
          <div>
            <label
              htmlFor="departmentName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Department Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="departmentName"
                placeholder="e.g. ICT WING B"
                {...register("departmentName", {
                  required: "Department name is required",
                  minLength: {
                    value: 2,
                    message: "Department name must be at least 2 characters",
                  },
                })}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-kr-orange focus:border-kr-orange transition-colors ${
                  errors.departmentName ? "border-red-500" : "border-gray-300"
                }`}
                disabled={createLocationMutation.isPending}
              />
            </div>
            {errors.departmentName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.departmentName.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Notes <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <textarea
                id="notes"
                rows={3}
                placeholder="e.g. In ICT"
                {...register("notes", {
                  required: "Notes are required",
                  minLength: {
                    value: 3,
                    message: "Notes must be at least 3 characters",
                  },
                })}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-kr-orange focus:border-kr-orange transition-colors resize-none ${
                  errors.notes ? "border-red-500" : "border-gray-300"
                }`}
                disabled={createLocationMutation.isPending}
              />
            </div>
            {errors.notes && (
              <p className="text-red-500 text-sm mt-1">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={createLocationMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLocationMutation.isPending}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-kr-maroon hover:bg-kr-maroon/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MapPin className="h-4 w-4" />
              <span>
                {createLocationMutation.isPending
                  ? "Creating..."
                  : "Create Location"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLocationModal;
