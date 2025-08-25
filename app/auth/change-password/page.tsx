"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/axiosInterceptor";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

// 🔹 Zod Schema with UI fields
const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
    // UI state (not sent to API)
    showOldPassword: z.boolean().optional(),
    showNewPassword: z.boolean().optional(),
    showConfirmPassword: z.boolean().optional(),
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// 🔹 API Response
type ChangePasswordResponse = {
  message: string;
  accessToken: string;
};

// 🔹 Mutation function
const changePassword = async (
  values: ChangePasswordFormData,
): Promise<ChangePasswordResponse> => {
  // ✅ Send full body as expected by backend
  const { showOldPassword, showNewPassword, showConfirmPassword, ...payload } =
    values;
  const response = await api.post("/auth/change-password", payload);
  return response.data;
};

export default function ChangePasswordPage() {
  const router = useRouter();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
    },
  });

  const mutation = useMutation<
    ChangePasswordResponse,
    Error,
    Omit<
      ChangePasswordFormData,
      "showOldPassword" | "showNewPassword" | "showConfirmPassword"
    >
  >({
    mutationFn: changePassword,
    onSuccess: (data) => {
      if (data.accessToken) {
        localStorage.setItem("authToken", data.accessToken);
      }
      router.push("/dashboard");
      router.refresh();
    },
    onError: (err) => {
      form.setError("root", {
        message: err.message || "Failed to change password. Please try again.",
      });
    },
  });

  const onSubmit = (values: ChangePasswordFormData) => {
    form.clearErrors("root");
    mutation.mutate(values);
  };

  const isRequired =
    typeof window !== "undefined"
      ? !!localStorage.getItem("mustChangePassword")
      : false;

  const handleCancel = () => {
    if (isRequired) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("mustChangePassword");
      router.push("/login");
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-4">
            {!isRequired && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="text-kr-maroon hover:text-kr-maroon-dark"
                disabled={mutation.isPending}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex justify-center flex-1">
              <Image
                src="/kr_logo.png"
                alt="Kenya Railways Logo"
                width={50}
                height={50}
                className="h-12 w-auto"
              />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold text-kr-maroon-dark">
              {isRequired ? "Password Change Required" : "Change Password"}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {isRequired
                ? "Please change your temporary password to continue"
                : "Update your account password"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertDescription>
                {form.formState.errors.root.message?.toString()}
              </AlertDescription>
            </Alert>
          )}

          {isRequired && (
            <Alert className="border-kr-orange bg-kr-yellow/10 text-kr-maroon-dark">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                You must change your temporary password before accessing the
                system.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Current Password */}
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={
                            form.watch("showOldPassword") ? "text" : "password"
                          }
                          placeholder="Enter current password"
                          {...field}
                          disabled={mutation.isPending}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            form.setValue(
                              "showOldPassword",
                              !form.getValues("showOldPassword"),
                            )
                          }
                          disabled={mutation.isPending}
                        >
                          {form.watch("showOldPassword") ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Password */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={
                            form.watch("showNewPassword") ? "text" : "password"
                          }
                          placeholder="Enter new password"
                          {...field}
                          disabled={mutation.isPending}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            form.setValue(
                              "showNewPassword",
                              !form.getValues("showNewPassword"),
                            )
                          }
                          disabled={mutation.isPending}
                        >
                          {form.watch("showNewPassword") ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={
                            form.watch("showConfirmPassword")
                              ? "text"
                              : "password"
                          }
                          placeholder="Confirm new password"
                          {...field}
                          disabled={mutation.isPending}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            form.setValue(
                              "showConfirmPassword",
                              !form.getValues("showConfirmPassword"),
                            )
                          }
                          disabled={mutation.isPending}
                        >
                          {form.watch("showConfirmPassword") ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full bg-kr-orange hover:bg-kr-orange-dark text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating Password...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Update Password
                    </div>
                  )}
                </Button>

                {!isRequired && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={mutation.isPending}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>

          {isRequired && (
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={mutation.isPending}
                className="text-sm text-kr-maroon hover:text-kr-maroon-dark"
              >
                Logout Instead
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
