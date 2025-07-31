"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

// Define the schema for the asset form
const assetFormSchema = z
  .object({
    name: z.string().min(2, {
      message: "Asset name must be at least 2 characters.",
    }),
    serialNumber: z.string().optional(), // Optional for bulk items
    region: z.string().min(1, { message: "Region is required." }),
    location: z.string().min(1, { message: "Location is required." }),
    keeper: z.string().min(1, { message: "Keeper is required." }),
    availability: z.enum(["Available", "Assigned", "In Repair", "Disposed"], {
      message: "Please select a valid availability status.",
    }),
    isBulk: z.boolean().default(false),
    quantity: z.preprocess(
      (val) => Number(val),
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
    if (!data.isBulk && data.serialNumber === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Serial number is required for unique assets.",
        path: ["serialNumber"],
      })
    }
  })

type AssetFormValues = z.infer<typeof assetFormSchema>

interface CreateAssetFormProps {
  onAddAsset: (newAsset: AssetFormValues & { id: string }) => void
  onClose: () => void
}

export function CreateAssetForm({ onAddAsset, onClose }: CreateAssetFormProps) {
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
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

  const onSubmit = (values: AssetFormValues) => {
    // Generate a dummy ID for the new asset
    const newId = `ASSET-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    onAddAsset({ ...values, id: newId })
    toast({
      title: "Asset Created!",
      description: `Asset "${values.name}" has been added to the inventory.`,
    })
    onClose()
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
                <Input placeholder="e.g., HP Laptop" {...field} />
              </FormControl>
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
                <FormLabel>Bulk Item</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Check if this asset is a bulk consumable (e.g., toner, cables).
                </p>
              </div>
            </FormItem>
          )}
        />
        {!isBulk && (
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
        )}
        {isBulk && (
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
                  <SelectItem value="Nairobi">Nairobi</SelectItem>
                  <SelectItem value="Mombasa">Mombasa</SelectItem>
                  <SelectItem value="Kisumu">Kisumu</SelectItem>
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
                  <SelectItem value="IT Store Room A">IT Store Room A</SelectItem>
                  <SelectItem value="IT Store Room B">IT Store Room B</SelectItem>
                  <SelectItem value="Server Room 1">Server Room 1</SelectItem>
                  <SelectItem value="Office 101">Office 101</SelectItem>
                  <SelectItem value="Conference Room 3">Conference Room 3</SelectItem>
                  <SelectItem value="Repair Workshop">Repair Workshop</SelectItem>
                  <SelectItem value="Training Room">Training Room</SelectItem>
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
                    <SelectValue placeholder="Select a keeper" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="John Doe">John Doe</SelectItem>
                  <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                  <SelectItem value="Peter Jones">Peter Jones</SelectItem>
                  <SelectItem value="Alice Brown">Alice Brown</SelectItem>
                  <SelectItem value="David Green">David Green</SelectItem>
                  <SelectItem value="Sarah White">Sarah White</SelectItem>
                  <SelectItem value="Michael Black">Michael Black</SelectItem>
                  <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                  <SelectItem value="Chris Wilson">Chris Wilson</SelectItem>
                  <SelectItem value="Olivia Taylor">Olivia Taylor</SelectItem>
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
              <FormLabel>Availability</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="In Repair">In Repair</SelectItem>
                  <SelectItem value="Disposed">Disposed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-kr-maroon hover:bg-kr-maroon-dark">
          Create Asset
        </Button>
      </form>
    </Form>
  )
}
