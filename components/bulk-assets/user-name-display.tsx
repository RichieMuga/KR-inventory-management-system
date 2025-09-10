"use client";

import { useUser } from "@/hooks/bulk-asset-queries";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserNameDisplayProps {
  payrollNumber: string | null;
  maxLength?: number;
  showTooltip?: boolean;
  fallback?: string;
  className?: string;
}

export function UserNameDisplay({
  payrollNumber,
  maxLength = 20,
  showTooltip = true,
  fallback = "Unassigned",
  className = "",
}: UserNameDisplayProps) {
  const { data: user, isLoading, isError } = useUser(payrollNumber);

  // Handle no payroll number
  if (!payrollNumber) {
    return (
      <span className={`text-muted-foreground ${className}`}>{fallback}</span>
    );
  }

  // Handle loading state
  if (isLoading) {
    return <Skeleton className={`h-4 w-20 ${className}`} />;
  }

  // Handle error state - fallback to payroll number
  if (isError || !user) {
    return (
      <span className={`text-muted-foreground font-mono text-xs ${className}`}>
        {payrollNumber}
      </span>
    );
  }

  // Format full name
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  // Truncate if necessary
  const displayName =
    fullName.length > maxLength
      ? `${fullName.substring(0, maxLength - 3)}...`
      : fullName;

  // If name wasn't truncated or tooltip is disabled, show without tooltip
  if (!showTooltip || fullName === displayName) {
    return (
      <span className={`font-medium ${className}`} title={fullName}>
        {displayName}
      </span>
    );
  }

  // Show with tooltip if truncated
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`font-medium cursor-help ${className}`}>
            {displayName}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{fullName}</p>
            <p className="text-xs text-muted-foreground">ID: {payrollNumber}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact version for tight spaces
export function UserNameCompact({
  payrollNumber,
  className = "",
}: {
  payrollNumber: string | null;
  className?: string;
}) {
  return (
    <UserNameDisplay
      payrollNumber={payrollNumber}
      maxLength={15}
      showTooltip={true}
      fallback="N/A"
      className={className}
    />
  );
}

// Version that shows initials when space is very limited
export function UserInitials({
  payrollNumber,
  className = "",
}: {
  payrollNumber: string | null;
  className?: string;
}) {
  const { data: user, isLoading, isError } = useUser(payrollNumber);

  if (!payrollNumber) {
    return <span className={`text-muted-foreground ${className}`}>--</span>;
  }

  if (isLoading) {
    return <Skeleton className={`h-6 w-6 rounded-full ${className}`} />;
  }

  if (isError || !user) {
    return (
      <span className={`text-xs font-mono ${className}`}>
        {payrollNumber.slice(-2)}
      </span>
    );
  }

  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-kr-maroon text-white text-xs font-medium cursor-help ${className}`}
          >
            {initials}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{fullName}</p>
            <p className="text-xs text-muted-foreground">ID: {payrollNumber}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
