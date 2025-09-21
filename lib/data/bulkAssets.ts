// lib/data/bulkAssets.ts

export interface BulkAsset {
  id: number;
  name: string;
  issuedBy: string;
  department: string;
  issuedTo: string;
  signatory: string;
  timestamp: string;
  quantity: number;
  notes: string;
  status: "Issued" | "Not Issued";
}

export const initialBulkAssetsData: BulkAsset[] = [
  {
    id: 1,
    name: "HP Toner Cartridge (Black)",
    issuedBy: "Alice Brown",
    department: "IT Department",
    issuedTo: "John Doe",
    signatory: "John Doe",
    timestamp: "2024-07-30 10:30 AM",
    quantity: 1,
    notes: "For printer in Office 101",
    status: "Issued" as const,
  },
  {
    id: 2,
    name: "Network Cable (CAT6, 10m)",
    issuedBy: "Mike Johnson",
    department: "Network Operations",
    issuedTo: "Alice Brown",
    signatory: "Alice Brown",
    timestamp: "2024-07-29 02:15 PM",
    quantity: 2,
    notes: "New workstation setup",
    status: "Not Issued" as const,
  },
  {
    id: 3,
    name: "24-Inch Dell Monitor",
    issuedBy: "Emily Davis",
    department: "IT Support",
    issuedTo: "David Green",
    signatory: "David Green",
    timestamp: "2024-07-28 11:00 AM",
    quantity: 1,
    notes: "Monitor for workstation",
    status: "Issued" as const,
  },
  {
    id: 4,
    name: "USB Flash Drive (64GB)",
    issuedBy: "Sarah White",
    department: "IT Department",
    issuedTo: "Lisa Chen",
    signatory: "Lisa Chen",
    timestamp: "2024-07-27 09:45 AM",
    quantity: 1,
    notes: "Issued to new employee",
    status: "Issued" as const,
  },
  {
    id: 5,
    name: "Wireless Mouse (Logitech)",
    issuedBy: "Tom Wilson",
    department: "IT Support",
    issuedTo: "Sarah White",
    signatory: "Sarah White",
    timestamp: "2024-07-26 03:00 PM",
    quantity: 1,
    notes: "Replacement for faulty mouse",
    status: "Not Issued" as const,
  },
  {
    id: 6,
    name: "Ethernet Switch (24-port)",
    issuedBy: "Mike Johnson",
    department: "Network Operations",
    issuedTo: "IT Department",
    signatory: "Tom Wilson",
    timestamp: "2024-07-25 01:20 PM",
    quantity: 1,
    notes: "Network expansion",
    status: "Issued" as const,
  },
  {
    id: 7,
    name: "Power Cable (IEC C13)",
    issuedBy: "Alice Brown",
    department: "IT Department",
    issuedTo: "Server Team",
    signatory: "Mike Johnson",
    timestamp: "2024-07-24 09:15 AM",
    quantity: 5,
    notes: "Server maintenance",
    status: "Issued" as const,
  },
  {
    id: 8,
    name: "A4 Paper (Ream)",
    issuedBy: "Sarah White",
    department: "Administration",
    issuedTo: "Finance Department",
    signatory: "Lisa Chen",
    timestamp: "2024-07-23 02:30 PM",
    quantity: 10,
    notes: "Monthly office supplies",
    status: "Not Issued" as const,
  },
  {
    id: 9,
    name: "Printer Ink Cartridge (Color)",
    issuedBy: "Tom Wilson",
    department: "IT Support",
    issuedTo: "Marketing Team",
    signatory: "David Green",
    timestamp: "2024-07-22 11:15 AM",
    quantity: 3,
    notes: "For marketing materials printing",
    status: "Issued" as const,
  },
];