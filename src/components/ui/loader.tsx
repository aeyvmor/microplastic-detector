// src/components/ui/loader.tsx
"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  text?: string;
}

export const Loader = ({ className, text }: LoaderProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};