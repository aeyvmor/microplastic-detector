// src/components/ui/label.tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label" // Uses Radix Label primitive
import { cva, type VariantProps } from "class-variance-authority" // Import cva if needed for variants (optional here)

import { cn } from "@/lib/utils"

// Optional: Define variants if needed (usually not needed for basic label)
// const labelVariants = cva(
//   "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
// )

// Use forwardRef and extend Radix Label props
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> // Includes standard HTML attributes for <label>
  // & VariantProps<typeof labelVariants> // Uncomment if using labelVariants with cva
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root // Renders the Radix Root component (<label>)
    ref={ref} // Forward the ref
    // Use cn to merge base styles/variants with passed className
    className={cn(
        // labelVariants(), // Uncomment if using variants
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", // Default base styles
        className
    )}
    {...props} // Spread remaining props (like htmlFor, children, etc.)
  />
))
Label.displayName = LabelPrimitive.Root.displayName // Use Radix display name

export { Label }