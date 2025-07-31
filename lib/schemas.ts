import { z } from "zod"

export const UniqueAssetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  region: z.string().min(1, "Region is required"),
  availability: z.enum(["Available", "Assigned", "In Repair", "Disposed"]),
  location: z.string().min(1, "Location is required"),
  keeper: z.string().min(1, "Keeper is required"),
})

export type UniqueAssetFormData = z.infer<typeof UniqueAssetSchema>

export const BulkAssetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  region: z.string().min(1, "Region is required"),
  availability: z.enum(["Available", "Assigned", "In Repair", "Disposed"]),
  location: z.string().min(1, "Location is required"),
  keeper: z.string().min(1, "Keeper is required"),
})

export type BulkAssetFormData = z.infer<typeof BulkAssetSchema>
