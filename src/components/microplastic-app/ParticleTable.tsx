"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AnalyzedParticle } from '@/types';

interface ParticleTableProps {
  particles: AnalyzedParticle[];
  highlightedIndex: number | null;
  onHoverRow: (index: number | null) => void;
}

/**
 * This component renders the detailed table of all the detected particles.
 * It's a key part of the interactive experience, as hovering over a row here
 * triggers the highlighting on the image.
 */
export default function ParticleTable({
    particles,
    highlightedIndex,
    onHoverRow,
}: ParticleTableProps) {

  // If there are no particles to display, don't render anything.
  if (!particles || particles.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border rounded-md">
      {/* I've wrapped the table in a scrollable container to handle many particles. */}
      <div className="max-h-[400px] overflow-y-auto relative">
        <Table>
          {/* I made the table header sticky so it's always visible when scrolling. */}
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Shape</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Transparency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {particles.map((p) => (
              <TableRow
                key={p.index}
                // These event handlers are the magic behind the interactive highlighting.
                onMouseEnter={() => onHoverRow(p.index)}
                onMouseLeave={() => onHoverRow(null)}
                // I use the `cn` utility to conditionally apply a background color
                // when this row is the one being highlighted.
                className={cn(
                    "cursor-pointer",
                    highlightedIndex === p.index && "bg-muted/50 dark:bg-muted/30"
                )}
                data-testid={`particle-row-${p.index}`}
              >
                <TableCell className="font-medium">{p.index}</TableCell>
                <TableCell>{(p.confidence * 100).toFixed(1)}%</TableCell>
                <TableCell>
                  {p.analysis?.shape && !p.analysis.error ? p.analysis.shape : <span className="text-muted-foreground italic">N/A</span>}
                </TableCell>
                <TableCell>
                  {p.analysis?.color && !p.analysis.error ? p.analysis.color : <span className="text-muted-foreground italic">N/A</span>}
                </TableCell>
                <TableCell>
                  {p.analysis?.transparency && !p.analysis.error ? p.analysis.transparency : <span className="text-muted-foreground italic">N/A</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* A little footer to give the user some context. */}
      <div className="p-2 text-xs text-muted-foreground border-t text-center">
        Displaying {particles.length} particle(s) above threshold. Hover rows to highlight on image.
      </div>
    </div>
  );
}