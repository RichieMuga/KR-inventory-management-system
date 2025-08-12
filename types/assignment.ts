// types/asset-types.ts

export interface Assignment {
  id: string;
  assetName: string;
  assetType: "bulk" | "unique";
  assetId: string | number;
  assignedTo: string;
  assignedBy: string;
  dateIssued: string;
  conditionIssued: string;
  quantityIssued: number;
  quantityRemaining: number;
  status: "In use" | "Returned" | "Not in use";
  dateReturned?: string;
  conditionReturned?: string;
  notes?: string;
}

export interface BulkAsset {
  id: number;
  name: string;
  status: "Issued" | "Not Issued";
  quantity: number;
}

export interface UniqueAsset {
  id: string;
  name: string;
  serialNumber: string;
  status: "In Use" | "Not In Use";
  dateIssued?: string;
  conditionIssued?: string;
  dateReturned?: string;
  conditionReturned?: string;
}

export type AvailableAsset = BulkAsset | UniqueAsset;

export interface AssignmentFormData extends Partial<Assignment> {
  assetType: "bulk" | "unique";
}
