"use client"

import React, { useState } from 'react';
import { X, MapPin, Building, FileText } from 'lucide-react';

interface CreateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (location: {
    id: string;
    region: string;
    departmentName: string;
    notes: string;
  }) => void;
}

const CreateLocationModal: React.FC<CreateLocationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    id: '',
    region: '',
    departmentName: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const regions = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Nyeri'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit")
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-kr-orange" />
            <h2 className="text-xl font-semibold text-gray-900">Create New Location</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <p className="text-gray-600 text-sm">
            Add a new location to the system with its details and regional assignment.
          </p>

          {/* Location ID */}
          <div>
            <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 mb-2">
              Location ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="locationId"
              placeholder="e.g. L011"
              value={formData.id}
              onChange={(e) => handleChange('id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-kr-orange focus:border-kr-orange transition-colors ${errors.id ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.id && <p className="text-red-500 text-sm mt-1">{errors.id}</p>}
          </div>

          {/* Region */}
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
              Region <span className="text-red-500">*</span>
            </label>
            <select
              id="region"
              value={formData.region}
              onChange={(e) => handleChange('region', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-kr-orange focus:border-kr-orange transition-colors ${errors.region ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">Select a region</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
          </div>

          {/* Department Name */}
          <div>
            <label htmlFor="departmentName" className="block text-sm font-medium text-gray-700 mb-2">
              Department Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="departmentName"
                placeholder="e.g. IT Store Room C"
                value={formData.departmentName}
                onChange={(e) => handleChange('departmentName', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-kr-orange focus:border-kr-orange transition-colors ${errors.departmentName ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
            </div>
            {errors.departmentName && <p className="text-red-500 text-sm mt-1">{errors.departmentName}</p>}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <textarea
                id="notes"
                rows={3}
                placeholder="e.g. Tertiary IT storage and backup systems"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-kr-orange focus:border-kr-orange transition-colors resize-none ${errors.notes ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
            </div>
            {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-kr-maroon hover:bg-kr-maroon/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MapPin className="h-4 w-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Location'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLocationModal;
