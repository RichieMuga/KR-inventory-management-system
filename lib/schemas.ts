import { z } from "zod"

export const uniqueAssetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  region: z.string().min(1, "Region is required"),
  location: z.string().min(1, "Location is required"),
  keeper: z.string().min(1, "Keeper is required"),
  availability: z.enum(["Available", "Assigned", "In Repair", "Disposed"]),
})

export const bulkAssetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  region: z.string().min(1, "Region is required"),
  location: z.string().min(1, "Location is required"),
  keeper: z.string().min(1, "Keeper is required"),
  availability: z.enum(["Available", "Assigned", "In Repair", "Disposed"]),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
})

// New schemas for editing, including the ID
export const editUniqueAssetSchema = uniqueAssetSchema.extend({
  id: z.string(), // Add ID for editing
})

export const editBulkAssetSchema = bulkAssetSchema.extend({
  id: z.string(), // Add ID for editing
})

export type UniqueAssetFormData = z.infer<typeof uniqueAssetSchema>
export type BulkAssetFormData = z.infer<typeof bulkAssetSchema>
export type EditUniqueAssetFormData = z.infer<typeof editUniqueAssetSchema>
export type EditBulkAssetFormData = z.infer<typeof editBulkAssetSchema>
