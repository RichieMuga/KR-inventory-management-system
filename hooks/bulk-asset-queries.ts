import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/axiosInterceptor';

// Types
export interface User {
  payrollNumber: string;
  firstName: string;
  lastName: string;
  role: string;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  user: User;
}

export interface Asset {
  assetId: number;
  name: string;
  serialNumber: string | null;
  keeperPayrollNumber: string | null;
  locationId: number;
  isBulk: boolean;
  individualStatus: string | null;
  bulkStatus: string | null;
  currentStockLevel: number | null;
  minimumThreshold: number | null;
  lastRestocked: string | null;
  modelNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetResponse {
  page: number;
  limit: number;
  total: string;
  totalPages: number;
  data: Asset[];
}

export interface CreateAssetRequest {
  name: string;
  keeperPayrollNumber?: string;
  locationId: number;
  serialNumber?: string;
  isBulk: boolean;
  individualStatus?: string;
  bulkStatus?: string;
  currentStockLevel?: number;
  minimumThreshold?: number;
  modelNumber?: string;
  notes?: string;
}

export interface UpdateAssetRequest extends Partial<CreateAssetRequest> {
  assetId: number;
}

// Query Keys
export const assetKeys = {
  all: ['assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  list: (page: number, limit: number, search?: string) => 
    [...assetKeys.lists(), { page, limit, search }] as const,
  details: () => [...assetKeys.all, 'detail'] as const,
  detail: (id: number) => [...assetKeys.details(), id] as const,
};

export const userKeys = {
  all: ['users'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (payrollNumber: string) => [...userKeys.details(), payrollNumber] as const,
};

// API Functions
export const assetApi = {
  // Fetch paginated assets
  getAssets: async (page: number, limit: number, search?: string): Promise<AssetResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    
    const response = await api.get(`/assets?${params.toString()}`);
    return response.data;
  },

  // Fetch single asset
  getAsset: async (id: number): Promise<Asset> => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  // Create new asset
  createAsset: async (data: CreateAssetRequest): Promise<Asset> => {
    const response = await api.post('/assets', data);
    return response.data;
  },

  // Update asset
  updateAsset: async (data: UpdateAssetRequest): Promise<Asset> => {
    const { assetId, ...updateData } = data;
    const response = await api.put(`/assets/${assetId}`, updateData);
    return response.data;
  },

  // Delete asset
  deleteAsset: async (id: number): Promise<void> => {
    await api.delete(`/assets/${id}`);
  },

  // Update stock level (for bulk assets)
  updateStock: async (id: number, stockLevel: number): Promise<Asset> => {
    const response = await api.patch(`/assets/${id}/stock`, { currentStockLevel: stockLevel });
    return response.data;
  },
};

export const userApi = {
  // Fetch single user by payroll number
  getUser: async (payrollNumber: string): Promise<User> => {
    const response = await api.get(`/users/${payrollNumber}`);
    return response.data.user;
  },
};

// Custom Hooks
export function useAssets(page: number, limit: number, search?: string) {
  return useQuery({
    queryKey: assetKeys.list(page, limit, search),
    queryFn: () => assetApi.getAssets(page, limit, search),
    placeholderData: (previousData) => previousData,
    staleTime: 30000, // 30 seconds
  });
}

export function useAsset(id: number) {
  return useQuery({
    queryKey: assetKeys.detail(id),
    queryFn: () => assetApi.getAsset(id),
    enabled: !!id,
  });
}

export function useUser(payrollNumber: string | null) {
  return useQuery({
    queryKey: userKeys.detail(payrollNumber || ''),
    queryFn: () => userApi.getUser(payrollNumber!),
    enabled: !!payrollNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes - user data changes less frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: assetApi.createAsset,
    onSuccess: () => {
      // Invalidate and refetch asset lists
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to create asset:', error);
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: assetApi.updateAsset,
    onSuccess: (data) => {
      // Update the specific asset in cache
      queryClient.setQueryData(assetKeys.detail(data.assetId), data);
      // Invalidate asset lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update asset:', error);
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: assetApi.deleteAsset,
    onSuccess: (_, assetId) => {
      // Remove the asset from cache
      queryClient.removeQueries({ queryKey: assetKeys.detail(assetId) });
      // Invalidate asset lists
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete asset:', error);
    },
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, stockLevel }: { id: number; stockLevel: number }) =>
      assetApi.updateStock(id, stockLevel),
    onSuccess: (data) => {
      // Update the specific asset in cache
      queryClient.setQueryData(assetKeys.detail(data.assetId), data);
      // Invalidate asset lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update stock:', error);
    },
  });
}
