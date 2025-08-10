"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";

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

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const router = useRouter();

  // useEffect(() => {
  //   // Check if password change is required
  //   const user = localStorage.getItem("user");
  //   if (user) {
  //     const userData = JSON.parse(user);
  //     setIsRequired(userData.mustChangePassword);
  //   }
  //
  //   // Verify user is authenticated
  //   const token = localStorage.getItem("accessToken");
  //   if (!token) {
  //     router.push("/auth/login");
  //   }
  // }, [router]);
  //
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      setError("New password must be different from current password");
      setLoading(false);
      return;
    }

    // TODO: Replace with your API implementation
    console.log("Change password attempt:", {
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
    });

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Add your change password logic here
      // router.push("/dashboard");
    }, 1000);
  };

  const handleCancel = () => {
    if (isRequired) {
      // If password change is required, logout user
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      router.push("/auth/login");
    } else {
      // Otherwise, go back
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
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="oldPassword"
                className="text-sm font-medium text-gray-700"
              >
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  required
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  placeholder="Enter current password"
                  className="pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  disabled={loading}
                >
                  {showOldPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-sm font-medium text-gray-700"
              >
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  className="pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={loading}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  className="pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-kr-orange hover:bg-kr-orange-dark text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                disabled={loading}
              >
                {loading ? (
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
                  disabled={loading}
                  className="w-full"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>

          {isRequired && (
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleCancel}
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
