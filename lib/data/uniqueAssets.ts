export interface UniqueAsset {
  id: string;
  name: string;
  serialNumber: string;
  defaultLocation: string;
  movedTo: string;
  issuedTo: string;
  status: "In Use" | "Not In Use";
  keeper: string;
}

export const initialUniqueAssetsData: UniqueAsset[] = [
  {
    id: "KR-LAP-001",
    name: "Dell Latitude 7420",
    serialNumber: "DL7420-2024-001",
    defaultLocation: "IT Store Room A",
    movedTo: "Office 101",
    issuedTo: "John Doe",
    status: "In Use" as const,
    keeper: "John Doe",
  },
  {
    id: "KR-PRT-002",
    name: "HP LaserJet Pro M404n",
    serialNumber: "HP404-2024-002",
    defaultLocation: "IT Store Room A",
    movedTo: "IT Store Room A",
    issuedTo: "-",
    status: "Not In Use" as const,
    keeper: "Alice Brown",
  },
  {
    id: "KR-MON-003",
    name: "Samsung 27-inch Monitor",
    serialNumber: "SAM27-2024-003",
    defaultLocation: "IT Store Room B",
    movedTo: "Office 205",
    issuedTo: "David Green",
    status: "In Use" as const,
    keeper: "David Green",
  },
  {
    id: "KR-TAB-004",
    name: "iPad Pro 11-inch",
    serialNumber: "IPD11-2024-004",
    defaultLocation: "IT Store Room A",
    movedTo: "User Desk 205",
    issuedTo: "Sarah White",
    status: "In Use" as const,
    keeper: "Sarah White",
  },
  {
    id: "KR-CAM-005",
    name: "Canon EOS R6 Camera",
    serialNumber: "CAN-R6-2024-005",
    defaultLocation: "Media Room",
    movedTo: "Marketing Department",
    issuedTo: "Lisa Chen",
    status: "In Use" as const,
    keeper: "Lisa Chen",
  },
  {
    id: "KR-SRV-006",
    name: "Dell PowerEdge R740",
    serialNumber: "DELL-R740-2024-006",
    defaultLocation: "Server Room 1",
    movedTo: "Server Room 1",
    issuedTo: "-",
    status: "In Use" as const,
    keeper: "Tom Wilson",
  },
  {
    id: "KR-LAP-007",
    name: "MacBook Pro 16-inch",
    serialNumber: "MBP16-2024-007",
    defaultLocation: "IT Store Room B",
    movedTo: "IT Store Room B",
    issuedTo: "-",
    status: "Not In Use" as const,
    keeper: "Mike Johnson",
  },
  {
    id: "KR-PRJ-008",
    name: "Epson PowerLite Projector",
    serialNumber: "EPL-2024-008",
    defaultLocation: "Conference Room A",
    movedTo: "Conference Room B",
    issuedTo: "Meeting Room",
    status: "In Use" as const,
    keeper: "Emily Davis",
  },
];