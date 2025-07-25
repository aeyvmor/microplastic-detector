// src/components/ui/slider.tsx
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider" // Uses Radix UI Slider primitive

import { cn } from "@/lib/utils"

// Uses forwardRef and extends Radix Slider props, which include standard HTML attributes
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> // This type includes standard attributes like id, className, aria-* etc.
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root // Renders the Radix root component
    ref={ref} // Forward the ref
    // Merges default styles with any passed className
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props} // Spreads all props (including id, value, onValueChange, min, max, step, disabled, aria-*, etc.)
  >
    {/* Track element (the background bar) */}
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary dark:bg-slate-800">
       {/* Range element (the filled part of the bar) */}
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    {/* Thumb element (the draggable handle) */}
    {/* Note: Radix handles multiple thumbs if 'value' is an array > 1 element */}
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName // Use Radix display name

export { Slider } // Export the component