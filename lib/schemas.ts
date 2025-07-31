import { z } from "zod"

export const uniqueAssetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  region: z.string().min(1, "Region is required"),
  location: z.string().min(1, "Location is required"),
  keeper: z.string().min(1, "Keeper is required"),
  availability: z.enum(["Available", "Assigned", "In Repair", "Disposed"]),
})

export type UniqueAssetFormData = z.infer<typeof uniqueAssetSchema>

export const bulkAssetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  region: z.string().min(1, "Region is required"),
  location: z.string().min(1, "Location is required"),
  keeper: z.string().min(1, "Keeper is required"),
  availability: z.enum(["Available", "Assigned", "In Repair", "Disposed"]),
})

export type BulkAssetFormData = z.infer<typeof bulkAssetSchema>
