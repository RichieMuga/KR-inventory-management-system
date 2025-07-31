"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Mock data for dropdowns (reusing from other pages)
const MOCK_LOCATIONS = [
  { id: "L001", regionName: "Nairobi", departmentName: "IT Store Room A", notes: "Main IT storage" },
  { id: "L002", regionName: "Nairobi", departmentName: "IT Store Room B", notes: "Secondary IT storage" },
  { id: "L003", regionName: "Nairobi", departmentName: "Server Room 1", notes: "Primary data center" },
  { id: "L004", regionName: "Nairobi", departmentName: "Server Room 2", notes: "Secondary data center" },
  { id: "L005", regionName: "Nairobi", departmentName: "Office 101", notes: "General office space" },
  { id: "L006", regionName: "Mombasa", departmentName: "Workshop 3", notes: "Repair and maintenance workshop" },
  { id: "L007", regionName: "Mombasa", departmentName: "Conference Room 3", notes: "Meeting room" },
  { id: "L008", regionName: "Kisumu", departmentName: "Tool Crib", notes: "Tools and small equipment storage" },
  { id: "L009", regionName: "Kisumu", departmentName: "Training Room", notes: "Employee training facility" },
  { id: "L010", regionName: "Kisumu", departmentName: "Scrap Yard", notes: "Disposed assets area" },
]

const MOCK_USERS = [
  { payrollNumber: "P001", firstName: "John", lastName: "Doe", role: "Admin" },
  { payrollNumber: "P002", firstName: "Jane", lastName: "Smith", role: "Keeper" },
  { payrollNumber: "P003", firstName: "Peter", lastName: "Jones", role: "Keeper" },
  { payrollNumber: "P004", firstName: "Alice", lastName: "Brown", role: "Viewer" },
  { payrollNumber: "P005", firstName: "David", lastName: "Green", role: "Keeper" },
  { payrollNumber: "P006", firstName: "Sarah", lastName: "White", role: "Viewer" },
  { payrollNumber: "P007", firstName: "Michael", lastName: "Black", role: "Admin" },
  { payrollNumber: "P008", firstName: "Emily", lastName: "Davis", role: "Keeper" },
  { payrollNumber: "P009", firstName: "Chris", lastName: "Wilson", role: "Viewer" },
  { payrollNumber: "P010", firstName: "Olivia", lastName: "Taylor", role: "Keeper" },
]

const AVAILABILITY_OPTIONS = ["Available", "Assigned", "In Repair", "Disposed"]

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Asset name must be at least 2 characters.",
    }),
    serialNumber: z.string().min(3, {
      message: "Serial number must be at least 3 characters.",
    }),
    region: z.string().min(1, {
      message: "Please select a region.",
    }),
    location: z.string().min(1, {
      message: "Please select a location.",
    }),
    keeper: z.string().min(1, {
      message: "Please select a keeper.",
    }),
    availability: z.enum(["Available", "Assigned", "In Repair", "Disposed"], {
      message: "Please select an availability status.",
    }),
    isBulk: z.boolean().default(false),
    quantity: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().int().min(1, { message: "Quantity must be at least 1." }).optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.isBulk && (data.quantity === undefined || data.quantity === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Quantity is required for bulk assets.",
        path: ["quantity"],
      })
    }
  })

interface CreateAssetFormProps {
  onAddAsset: (newAsset: Omit<z.infer<typeof formSchema>, "id">) => void
}

export function CreateAssetForm({ onAddAsset }: CreateAssetFormProps) {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      serialNumber: "",
      region: "",
      location: "",
      keeper: "",
      availability: "Available",
      isBulk: false,
      quantity: 1,
    },
  })

  const isBulk = form.watch("isBulk")

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Simulate API call or data processing
    console.log("New Asset Data:", values)
    onAddAsset(values)
    toast({
      title: "Asset Created!",
      description: `Asset "${values.name}" with serial "${values.serialNumber}" has been added.`,
    })
    form.reset() // Reset form after successful submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Laptop, Projector" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="serialNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serial Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., SN123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.from(new Set(MOCK_LOCATIONS.map((loc) => loc.regionName))).map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MOCK_LOCATIONS.map((location) => (
                    <SelectItem key={location.id} value={location.departmentName}>
                      {location.departmentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="keeper"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keeper</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset keeper" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MOCK_USERS.map((user) => (
                    <SelectItem key={user.payrollNumber} value={`${user.firstName} ${user.lastName}`}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isBulk"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Is this a bulk item?</FormLabel>
                <FormDescription>
                  Check if this asset represents multiple identical items (e.g., toner cartridges).
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        {isBulk && (
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter quantity" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" className="w-full bg-kr-maroon hover:bg-kr-maroon-dark">
          Create Asset
        </Button>
      </form>
    </Form>
  )
}
