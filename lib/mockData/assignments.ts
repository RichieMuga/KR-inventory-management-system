// data/mock-data.ts
import { Assignment, BulkAsset, UniqueAsset } from "@/types/assignment";

export const initialAssignments: Assignment[] = [
  {
    id: "ASG-001",
    assetName: "Samsung TV Remote",
    assetType: "unique",
    assetId: "KR-REM-001",
    assignedTo: "Jane Smith",
    assignedBy: "John Doe",
    dateIssued: "2024-07-20",
    conditionIssued: "New",
    quantityIssued: 1,
    quantityRemaining: 0,
    status: "In use",
    notes: "For conference room setup",
  },
  {
    id: "ASG-002",
    assetName: "USB Flash Drive (64GB)",
    assetType: "bulk",
    assetId: 4,
    assignedTo: "David Green",
    assignedBy: "Alice Brown",
    dateIssued: "2024-07-27",
    conditionIssued: "Good",
    quantityIssued: 3,
    quantityRemaining: 7,
    status: "In use",
    notes: "For data transfer project",
  },
  {
    id: "ASG-003",
    assetName: "MacBook Pro 16-inch",
    assetType: "unique",
    assetId: "KR-LAP-008",
    assignedTo: "Mike Johnson",
    assignedBy: "Sarah Wilson",
    dateIssued: "2024-06-15",
    conditionIssued: "Good",
    quantityIssued: 1,
    quantityRemaining: 0,
    status: "Returned",
    dateReturned: "2024-08-01",
    conditionReturned: "Good",
    notes: "Development work completed",
  },
];

export const availableBulkAssets: BulkAsset[] = [
  {
    id: 1,
    name: "HP Toner Cartridge (Black)",
    status: "Not Issued",
    quantity: 5,
  },
  {
    id: 2,
    name: "Network Cable (CAT6, 10m)",
    status: "Not Issued",
    quantity: 10,
  },
  {
    id: 6,
    name: "Ethernet Switch (24-port)",
    status: "Not Issued",
    quantity: 2,
  },
  {
    id: 8,
    name: "A4 Paper (Ream)",
    status: "Not Issued",
    quantity: 50,
  },
];

export const availableUniqueAssets: UniqueAsset[] = [
  {
    id: "KR-PRT-002",
    name: "HP LaserJet Pro M404n",
    serialNumber: "HP404-2024-002",
    status: "Not In Use",
  },
  {
    id: "KR-LAP-007",
    name: "MacBook Pro 16-inch",
    serialNumber: "MBP16-2024-007",
    status: "Not In Use",
  },
  {
    id: "KR-MON-003",
    name: "Dell UltraSharp 27-inch Monitor",
    serialNumber: "DU27-2024-003",
    status: "In Use",
    dateIssued: "2024-07-10",
    conditionIssued: "New",
  },
  {
    id: "KR-TAB-005",
    name: "iPad Pro 12.9-inch",
    serialNumber: "IPP129-2024-005",
    status: "Not In Use",
    dateReturned: "2024-07-25",
    conditionReturned: "Good",
  },
];
