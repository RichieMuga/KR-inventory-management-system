import Link from "next/link"
import * as React from "react"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

const Breadcrumb = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"nav">>(({ ...props }, ref) => (
  <nav ref={ref} aria-label="breadcrumb" {...props} />
))
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
        className,
      )}
      {...props}
    />
  ),
)
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("inline-flex items-center", className)} {...props} />,
)
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean
  }
>(({ asChild, className, ...props }, ref) => (
  <Link ref={ref} className={cn("transition-colors hover:text-foreground", className)} {...props} />
))
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbSeparator = React.forwardRef<SVGSVGElement, React.ComponentPropsWithoutRef<typeof ChevronRight>>(
  ({ className, ...props }, ref) => (
    <li role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)}>
      <ChevronRight ref={ref} {...props} />
    </li>
  ),
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
  ({ className, ...props }, ref) => (
    <span ref={ref} aria-current="page" className={cn("font-normal text-foreground", className)} {...props} />
  ),
)
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbEllipsis = React.forwardRef<SVGSVGElement, React.ComponentPropsWithoutRef<typeof MoreHorizontal>>(
  ({ className, ...props }, ref) => (
    <span role="presentation" aria-hidden="true" className={cn("flex h-9 w-9 items-center justify-center", className)}>
      <MoreHorizontal ref={ref} className="h-4 w-4" {...props} />
      <span className="sr-only">More</span>
    </span>
  ),
)
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbEllipsis,
}
