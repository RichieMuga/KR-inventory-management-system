"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, User, Lock, LogOut, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/axiosInterceptor";

interface UserInfo {
  payrollNumber: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface TokenPayload {
  payrollNumber: string;
  role: string;
  firstName: string;
  lastName: string;
  iat: number;
  exp: number;
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/", label: "Store Keeping bulk assets" },
    { href: "/uniqueAssets", label: "ICT unique assets" },
    { href: "/bulkAssetTracking", label: "Bulk Asset tracking" },
    { href: "/uniqueAssetTracking", label: "Unique Asset Tracking" },
    { href: "/assignments", label: "Assignments" },
    { href: "/users", label: "Users" },
    { href: "/locations", label: "Locations" },
  ];

  // Function to decode JWT token
  const decodeToken = (token: string): TokenPayload | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Fetch user data from API
  const fetchUserData = async (payrollNumber: string) => {
    try {
      const response = await api.get(`/users/${payrollNumber}`);
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to token data if API call fails
      const token = localStorage.getItem("authToken");
      if (token) {
        const tokenData = decodeToken(token);
        if (tokenData) {
          setUser({
            payrollNumber: tokenData.payrollNumber,
            firstName: tokenData.firstName,
            lastName: tokenData.lastName,
            role: tokenData.role,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize user data on component mount
  useEffect(() => {
    // Don't check auth on login/auth pages
    if (pathname.startsWith('/auth/')) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (token) {
      const tokenData = decodeToken(token);
      if (tokenData) {
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (tokenData.exp < currentTime) {
          // Token expired, redirect to login
          localStorage.removeItem("authToken");
          window.location.href = "/auth/login";
          return;
        }
        
        // Set initial user data from token (for immediate display)
        setUser({
          payrollNumber: tokenData.payrollNumber,
          firstName: tokenData.firstName,
          lastName: tokenData.lastName,
          role: tokenData.role,
        });
        
        // Fetch fresh user data from API
        fetchUserData(tokenData.payrollNumber);
      } else {
        setLoading(false);
      }
    } else {
      // No token found, redirect to login (but not if already on auth pages)
      if (!pathname.startsWith('/auth/')) {
        window.location.href = "/auth/login";
      } else {
        setLoading(false);
      }
    }
  }, [pathname]);

  const getUserInitials = (user: UserInfo) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.payrollNumber.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = (user: UserInfo) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.payrollNumber;
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/auth/login";
  };

  // Show loading state or return null if no user data
  if (loading) {
    return (
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center">
          <Image
            src="/kr_logo.png"
            alt="Kenya Railways Logo"
            width={40}
            height={40}
            className="h-8 w-auto"
          />
          <span className="ml-2 text-kr-maroon-dark font-bold">Loading...</span>
        </div>
      </header>
    );
  }

  // If on auth pages or no user, show minimal header
  if (pathname.startsWith('/auth/') || !user) {
    return (
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center">
          <Image
            src="/kr_logo.png"
            alt="Kenya Railways Logo"
            width={40}
            height={40}
            className="h-8 w-auto"
          />
          <span className="ml-2 text-kr-maroon-dark font-bold">
            Store Keeping and Asset Tracking System
          </span>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Mobile Left: Hamburger menu */}
      <div className="md:hidden flex items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 bg-transparent"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold"
                onClick={() => setIsOpen(false)}
              >
                <Image
                  src="/kr_logo.png"
                  alt="Kenya Railways Logo"
                  width={40}
                  height={40}
                  className="h-8 w-auto"
                />
                <span className="text-kr-maroon-dark font-bold">Inventory</span>
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    pathname === link.href
                      ? "text-kr-orange font-semibold" 
                      : "text-muted-foreground hover:text-kr-orange",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Center: Logo */}
      <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Image
            src="/kr_logo.png"
            alt="Kenya Railways Logo"
            width={40}
            height={40}
            className="h-8 w-auto"
          />
          <span className="sr-only">Kenya Railways Inventory</span>
          <span className="hidden md:inline-block text-kr-maroon-dark font-bold">
            Store Keeping and Asset Tracking System
          </span>
        </Link>
      </div>

      {/* Desktop nav (right side) */}
      <nav className="hidden md:flex md:items-center md:gap-2 lg:gap-5 text-sm font-medium ml-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              pathname === link.href
                ? "text-kr-orange font-semibold border-kr-orange"
                : "text-muted-foreground hover:text-kr-orange",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* User Dropdown - always right */}
      <div className="flex items-center gap-4 md:ml-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-auto p-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-kr-maroon text-white text-xs">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900">
                  {getUserDisplayName(user)}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {user.role}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {getUserDisplayName(user)}
                </p>
                <p className="text-xs text-gray-500">{user.payrollNumber}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Lock className="mr-2 h-4 w-4" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}