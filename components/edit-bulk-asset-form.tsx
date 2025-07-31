"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { editBulkAssetSchema, type EditBulkAssetFormData } from "@/lib/schemas"
import { useEffect } from "react"

interface EditBulkAssetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (data: EditBulkAssetFormData) => void
  initialData: EditBulkAssetFormData | null
}

const MOCK_REGIONS = ["Nairobi", "Mombasa", "Kisumu"]
const MOCK_LOCATIONS = [
  "IT Store Room A",
  "IT Store Room B",
  "Server Room 1",
  "Office 101",
  "Repair Workshop",
  "Training Room",
  "Conference Room 3",
  "User Desk 101",
  "Server Room 2",
]
const MOCK_KEEPERS = [
  "John Doe",
  "Jane Smith",
  "Peter Jones",
  "Alice Brown",
  "David Green",
  "Sarah White",
  "Michael Black",
  "Emily Davis",
  "Chris Wilson",
  "Olivia Taylor",
]
const MOCK_AVAILABILITY = ["Available", "Assigned", "In Repair", "Disposed"]

export function EditBulkAssetForm({ open, onOpenChange, onSuccess, initialData }: EditBulkAssetFormProps) {
  const form = useForm<EditBulkAssetFormData>({
    resolver: zodResolver(editBulkAssetSchema),
    defaultValues: initialData || {
      id: "",
      name: "",
      region: "",
      location: "",
      keeper: "",
      availability: "Available",
      quantity: 1,
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  const onSubmit = (data: EditBulkAssetFormData) => {
    onSuccess(data)
    onOpenChange(false) // Close the dialog on success
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Bulk Asset</DialogTitle>
          <DialogDescription>Update the details for the bulk asset.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., HP Toner Cartridge (Black)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 25"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                    />
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_REGIONS.map((region) => (
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_LOCATIONS.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a keeper" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_KEEPERS.map((keeper) => (
                        <SelectItem key={keeper} value={keeper}>
                          {keeper}
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
                  <FormLabel>Availability</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_AVAILABILITY.map((status) => (
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
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
