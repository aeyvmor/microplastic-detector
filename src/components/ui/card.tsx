// src/components/ui/card.tsx

import * as React from "react"

import { cn } from "@/lib/utils" // Make sure you have this utility function

// --- Card ---
// The main container component. Uses forwardRef to accept a ref.
// Accepts standard HTMLDivElement attributes (like className, id, style, etc.).
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // Uses cn() to merge default styles with any className passed as a prop
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm", // Default Shadcn styles
      className // Include className passed via props
    )}
    {...props} // Spread any other props onto the div
  />
))
Card.displayName = "Card" // For React DevTools

// --- CardHeader ---
// Optional header section.
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)} // Default padding and layout
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// --- CardTitle ---
// Title element, typically used inside CardHeader. Renders as h3.
const CardTitle = React.forwardRef<
  HTMLParagraphElement, // Renders as <p>, but styled like h3
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight", // Default styling
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

// --- CardDescription ---
// Description element, typically used inside CardHeader.
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)} // Default styling
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

// --- CardContent ---
// The main content area of the card.
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} /> // Default padding
))
CardContent.displayName = "CardContent"

// --- CardFooter ---
// Optional footer section.
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)} // Default padding and layout
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Export all the components
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }