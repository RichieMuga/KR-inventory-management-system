"use client"; // This component needs to be a client component to use usePathname

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation"; // Import usePathname
import { Menu, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils"; // Import cn utility for conditional class names

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/", label: "Store Keeping bulk assets" }, // Root path for Assets
    { href: "/uniqueAssets", label: "ICT unique assets" },
    { href: "/bulkAssetTracking", label: "Bulk Asset tracking" },
    { href: "/uniqueAssetTracking", label: "Unique Asset Tracking" },
    { href: "/assignments", label: "Assignments" },
    { href: "/users", label: "Users" },
    { href: "/locations", label: "Locations" },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
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
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
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
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden bg-transparent"
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
              <span className="sr-only">Kenya Railways Inventory</span>
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
      <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {/* Placeholder for user menu or other actions */}
        <Button variant="ghost" size="icon" className="rounded-full">
          <Package2 className="h-5 w-5" />
          <span className="sr-only">User menu</span>
        </Button>
      </div>
    </header>
  );
}
