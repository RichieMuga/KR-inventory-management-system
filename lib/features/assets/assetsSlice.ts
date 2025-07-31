import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Asset {
  id: string
  name: string
  serialNumber: string
  region: string
  availability: "Available" | "Assigned" | "In Repair" | "Disposed"
  location: string
  keeper: string
  isBulk: boolean
  quantity?: number
}

interface AssetsState {
  assets: Asset[]
}

const MOCK_ASSETS: Asset[] = [
  {
    id: "1",
    name: "HP Toner Cartridge (Black)",
    serialNumber: "HP-TNR-BLK-001",
    region: "Nairobi",
    availability: "Available",
    location: "IT Store Room A",
    keeper: "John Doe",
    isBulk: true,
    quantity: 25,
  },
  {
    id: "2",
    name: "Samsung TV Remote",
    serialNumber: "SAMS-REM-TV-002",
    region: "Mombasa",
    availability: "Assigned",
    location: "Conference Room 3",
    keeper: "Jane Smith",
    isBulk: false,
  },
  {
    id: "3",
    name: "Epson Ink Cartridge (Cyan)",
    serialNumber: "EPS-INK-CYN-003",
    region: "Kisumu",
    availability: "Available",
    location: "IT Store Room B",
    keeper: "Peter Jones",
    isBulk: true,
    quantity: 15,
  },
  {
    id: "4",
    name: "Network Cable (CAT6, 10m)",
    serialNumber: "NET-CAB-CAT6-004",
    region: "Nairobi",
    availability: "Available",
    location: "Server Room 1",
    keeper: "Alice Brown",
    isBulk: true,
    quantity: 50,
  },
  {
    id: "5",
    name: "USB Flash Drive (64GB)",
    serialNumber: "USB-FLSH-64GB-005",
    region: "Mombasa",
    availability: "Assigned",
    location: "User Desk 101",
    keeper: "David Green",
    isBulk: false,
  },
  {
    id: "6",
    name: "Wireless Mouse (Logitech)",
    serialNumber: "WL-MSE-LOGI-006",
    region: "Kisumu",
    availability: "Available",
    location: "IT Store Room A",
    keeper: "Sarah White",
    isBulk: true,
    quantity: 10,
  },
  {
    id: "7",
    name: "Standard Keyboard",
    serialNumber: "STD-KEY-007",
    region: "Nairobi",
    availability: "Available",
    location: "IT Store Room B",
    keeper: "Michael Black",
    isBulk: true,
    quantity: 20,
  },
  {
    id: "8",
    name: "24-inch Dell Monitor",
    serialNumber: "MON-DELL-24-008",
    region: "Mombasa",
    availability: "In Repair",
    location: "Repair Workshop",
    keeper: "Emily Davis",
    isBulk: false,
  },
  {
    id: "9",
    name: "Projector (Epson)",
    serialNumber: "PROJ-EPS-009",
    region: "Kisumu",
    availability: "Assigned",
    location: "Training Room",
    keeper: "Chris Wilson",
    isBulk: false,
  },
  {
    id: "10",
    name: "Server Rack Unit (42U)",
    serialNumber: "SRV-RACK-42U-010",
    region: "Nairobi",
    availability: "Available",
    location: "Server Room 2",
    keeper: "Olivia Taylor",
    isBulk: false,
  },
]

const initialState: AssetsState = {
  assets: MOCK_ASSETS,
}

export const assetsSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {
    addAsset: (state, action: PayloadAction<Asset>) => {
      state.assets.push(action.payload)
    },
    // You can add more reducers here for update, delete, etc.
  },
})

export const { addAsset } = assetsSlice.actions
export default assetsSlice.reducer
