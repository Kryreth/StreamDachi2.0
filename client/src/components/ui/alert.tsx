import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

// ✅ Fix 1: Ensure <h5> has accessible content
const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  >
    {children || <span className="sr-only">Alert title</span>}
  </h5>
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// ✅ Fix 2 + Fix 3: Accessible Breadcrumb link and separator
const BreadcrumbPage = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a">
>(({ className, children, href, ...props }, ref) => {
  const isDisabled = props["aria-disabled"] === "true" || !href
  const accessibleHref = !isDisabled && href ? href : undefined

  return (
    <a
      ref={ref}
      href={accessibleHref}
      role={isDisabled ? "link" : undefined}
      aria-disabled={isDisabled ? "true" : undefined}
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    >
      {children || <span className="sr-only">Current page</span>}
    </a>
  )
})
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({ children }: { children?: React.ReactNode }) => (
  <span aria-hidden="true" className="mx-2 text-muted-foreground">
    {children || "/"}
  </span>
)

export {
  Alert,
  AlertTitle,
  AlertDescription,
  BreadcrumbPage,
  BreadcrumbSeparator,
}
