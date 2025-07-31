"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppDispatch } from "@/hooks/redux-hooks"
import { addAsset } from "@/lib/features/assets/assetsSlice"
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(2, { message: "Asset name must be at least 2 characters." }),
  serialNumber: z.string().min(2, { message: "Serial number must be at least 2 characters." }),
  region: z.string().min(1, { message: "Region is required." }),
  location: z.string().min(1, { message: "Location is required." }),
  keeper: z.string().min(1, { message: "Keeper is required." }),
  availability: z.enum(["Available", "Assigned", "In Repair", "Disposed"]),
})

interface AddUniqueAssetFormProps {
  onClose: () => void
}

export function AddUniqueAssetForm({ onClose }: AddUniqueAssetFormProps) {
  const dispatch = useAppDispatch()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      serialNumber: "",
      region: "",
      location: "",
      keeper: "",
      availability: "Available",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newAsset = {
      id: `U${Date.now()}`, // Simple unique ID generation
      ...values,
      isBulk: false,
      quantity: undefined, // Ensure quantity is undefined for unique assets
    }
    dispatch(addAsset(newAsset))
    toast({
      title: "Unique Asset Added!",
      description: `${newAsset.name} (Serial: ${newAsset.serialNumber}) has been added to inventory.`,
    })
    onClose()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Projector (Epson)" {...field} />
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
                <Input placeholder="e.g., PROJ-EPS-009" {...field} />
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
                <Input placeholder="e.g., Training Room" {...field} />
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
              <FormControl>
                <Input placeholder="e.g., Chris Wilson" {...field} />
              </FormControl>
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
          Add Unique Asset
        </Button>
      </form>
    </Form>
  )
}
