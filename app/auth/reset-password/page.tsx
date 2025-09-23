"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { RotateCcw, ArrowLeft, Copy, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/lib/api/axiosInterceptor";

interface ResetPasswordForm {
  targetPayrollNumber: string;
}

interface ApiResponse {
  message: string;
  temporaryPassword: string;
}

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ResetPasswordForm>({
    mode: "onChange",
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    setLoading(true);
    setError("");
    setSuccess("");
    setTemporaryPassword("");

    try {
      const response = await api.post<ApiResponse>("/auth/reset-password", {
        targetPayrollNumber: data.targetPayrollNumber.trim(),
      });

      setTemporaryPassword(response.data.temporaryPassword);
      setSuccess(response.data.message);
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        "Failed to reset password. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = async () => {
    if (temporaryPassword) {
      try {
        await navigator.clipboard.writeText(temporaryPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy password:", err);
      }
    }
  };

  const handleReset = () => {
    reset();
    setError("");
    setSuccess("");
    setTemporaryPassword("");
    setCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-kr-maroon hover:text-kr-maroon-dark"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
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
              Reset User Password
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Generate a temporary password for a user (Admin Only)
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {temporaryPassword && (
            <Alert className="border-kr-orange bg-kr-yellow/10 text-kr-maroon-dark">
              <div className="flex items-center justify-between w-full">
                <div className="flex-1 pr-2">
                  <div className="font-medium text-sm mb-1">
                    Temporary Password:
                  </div>
                  <div className="font-mono text-lg bg-white px-3 py-2 rounded border">
                    {temporaryPassword}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPassword}
                  className={copied ? "text-green-600" : ""}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Alert>
          )}

          {!temporaryPassword ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="targetPayrollNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Employee Payroll Number
                </Label>
                <Input
                  id="targetPayrollNumber"
                  type="text"
                  placeholder="Enter employee payroll number"
                  disabled={loading}
                  className="w-full"
                  {...register("targetPayrollNumber", {
                    required: "Payroll number is required",
                    minLength: {
                      value: 1,
                      message: "Payroll number cannot be empty"
                    },
                    validate: (value) => 
                      value.trim().length > 0 || "Payroll number cannot be empty"
                  })}
                />
                {errors.targetPayrollNumber && (
                  <p className="text-sm text-red-600">
                    {errors.targetPayrollNumber.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-kr-orange hover:bg-kr-orange-dark text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                disabled={loading || !isValid}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting Password...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Password
                  </div>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center text-sm text-gray-600">
                Please provide this temporary password to the user. They will be
                required to change it on their next login.
              </div>

              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full"
              >
                Reset Another Password
              </Button>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500">
              The user will be required to change their password on next login
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}