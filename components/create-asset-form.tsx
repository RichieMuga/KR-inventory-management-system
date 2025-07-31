"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Define the schema for the asset form
const formSchema = z
  .object({
    name: z.string().min(1, "Asset name is required"),
    serialNumber: z.string().optional(),
    region: z.string().min(1, "Region is required"),
    location: z.string().min(1, "Location is required"),
    keeper: z.string().min(1, "Keeper is required"),
    availability: z.enum(["Available", "Assigned", "In Repair", "Disposed"]),
    isBulk: z.boolean(),
    quantity: z.number().int().min(1, "Quantity must be at least 1").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isBulk && (data.quantity === undefined || data.quantity === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Quantity is required for bulk assets",
        path: ["quantity"],
      })
    }
    if (!data.isBulk && (!data.serialNumber || data.serialNumber.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Serial number is required for unique assets",
        path: ["serialNumber"],
      })
    }
  })

type AssetFormValues = z.infer<typeof formSchema>

interface CreateAssetFormProps {
  onCreateAsset: (newAsset: AssetFormValues) => void
}

export function CreateAssetForm({ onCreateAsset }: CreateAssetFormProps) {
  const [open, setOpen] = React.useState(false)

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      serialNumber: "",
      region: "",
      location: "",
      keeper: "",
      availability: "Available",
      isBulk: false,
      quantity: 1, // Default quantity to 1
    },
  })

  const isBulk = form.watch("isBulk")

  function onSubmit(values: AssetFormValues) {
    onCreateAsset(values)
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-kr-maroon hover:bg-kr-maroon-dark text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Asset</DialogTitle>
          <DialogDescription>Fill in the details for the new inventory asset.</DialogDescription>
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
                    <FormLabel>Is this a bulk item?</FormLabel>
                    <DialogDescription>
                      Check if this asset is a consumable or bulk item (e.g., toner, cables).
                    </DialogDescription>
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
                      <Input
                        type="number"
                        placeholder="e.g., 10"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
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
                  <FormControl>
                    <Input placeholder="e.g., IT Store Room A" {...field} />
                  </FormControl>
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
            <DialogFooter>
              <Button type="submit" className="bg-kr-maroon hover:bg-kr-maroon-dark text-white">
                Create Asset
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
