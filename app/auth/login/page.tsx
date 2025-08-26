"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, LogIn } from "lucide-react";
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

// 🔹 Extend schema to include showPassword (non-submitted field)
const loginSchema = z.object({
  payrollNumber: z.string().min(1, "Payroll number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  showPassword: z.boolean().optional(), // For UI control
});

type LoginFormData = z.infer<typeof loginSchema>;

type LoginResponse = {
  accessToken: string;
  mustChangePassword: boolean;
};

const login = async (values: LoginFormData): Promise<LoginResponse> => {
  const { showPassword, ...submitData } = values;
  const response = await api.post("/auth/login", submitData);
  return response.data;
};

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      payrollNumber: "",
      password: "",
      showPassword: false,
    },
  });

  const mutation = useMutation<
    LoginResponse,
    Error,
    Omit<LoginFormData, "showPassword">
  >({
    mutationFn: login,
    onSuccess: (data) => {
      const { accessToken, mustChangePassword } = data;

      if (!accessToken || typeof accessToken !== "string") {
        form.setError("root", {
          message: "Invalid token received from server.",
        });
        return;
      }

      localStorage.setItem("authToken", accessToken);

      if (mustChangePassword) {
        router.push("/auth/change-password");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (err) => {
      form.setError("root", {
        message: err.message || "Invalid credentials. Please try again.",
      });
    },
  });

  const onSubmit = (values: LoginFormData) => {
    form.clearErrors("root");
    const { showPassword, ...submitData } = values;
    mutation.mutate(submitData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image
              src="/kr_logo.png"
              alt="Kenya Railways Logo"
              width={60}
              height={60}
              className="h-15 w-auto"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-kr-maroon-dark">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Store Keeping and Asset Tracking System
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="payrollNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payroll Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter payroll number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={
                            form.watch("showPassword") ? "text" : "password"
                          }
                          placeholder="Enter your password"
                          {...field}
                          className="pr-10"
                          disabled={mutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            form.setValue(
                              "showPassword",
                              !form.getValues("showPassword"),
                            )
                          }
                          disabled={mutation.isPending}
                        >
                          {form.watch("showPassword") ? (
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

              <Button
                type="submit"
                className="w-full bg-kr-orange hover:bg-kr-orange-dark text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Forgot your password?{" "}
              <span className="text-kr-orange hover:text-kr-orange-dark font-medium cursor-pointer">
                Contact your administrator
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
