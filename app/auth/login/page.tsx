"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";

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

export default function LoginPage() {
  const [formData, setFormData] = useState({
    payrollNumber: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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

    // TODO: Replace with your API implementation
    console.log("Login attempt:", formData);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Add your login logic here
    }, 1000);
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
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="payrollNumber"
                className="text-sm font-medium text-gray-700"
              >
                Payroll Number
              </Label>
              <Input
                id="payrollNumber"
                name="payrollNumber"
                type="text"
                required
                value={formData.payrollNumber}
                onChange={handleInputChange}
                placeholder="Enter your payroll number"
                className="w-full"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-kr-orange hover:bg-kr-orange-dark text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              disabled={loading}
            >
              {loading ? (
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
