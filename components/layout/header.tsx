"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function Header() {
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

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Mobile Left: Hamburger menu */}
      <div className="md:hidden flex items-center">
        <Sheet>
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
                    "hover:text-kr-orange",
                    pathname === link.href
                      ? "text-kr-orange font-semibold"
                      : "text-muted-foreground",
                  )}
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
      <nav className="hidden md:flex md:items-center md:gap-5 lg:gap-6 text-sm font-medium ml-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "transition-colors hover:text-kr-orange",
              pathname === link.href
                ? "text-kr-orange font-semibold"
                : "text-muted-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* User icon - always right */}
      <div className="md:flex items-center gap-4 md:ml-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Package2 className="h-5 w-5" />
          <span className="sr-only">User menu</span>
        </Button>
      </div>
    </header>
  );
}
