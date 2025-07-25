"use client";

import React from 'react';
import { Info } from "lucide-react";
import type { AnalysisStats } from '@/types';

interface SummaryStatsProps {
    stats: AnalysisStats | null;
    totalDetectedCount: number;
    confidenceThreshold: number;
    isProcessing: boolean;
    analysisError?: string | null;
}

/**
 * This component is responsible for rendering the summary statistics.
 * It shows a breakdown of the particle analysis, including counts for
 * different shapes, colors, and transparency levels.
 */
export default function SummaryStats({
    stats,
    totalDetectedCount,
    confidenceThreshold,
    isProcessing,
    analysisError
 }: SummaryStatsProps) {

    // If no particles were detected at all, show a simple message.
    if (!stats && !isProcessing && totalDetectedCount === 0) {
        return <p className="text-center text-gray-600 dark:text-gray-400 py-4">No microplastics detected in the image.</p>;
    }

    // This is a helpful message for when particles were detected, but none of them
    // met the user's confidence threshold.
    if (stats && totalDetectedCount > 0 && stats.count === 0 && !isProcessing) {
      return (
        <div className="text-center text-gray-600 dark:text-gray-400 py-4">
          <p>{totalDetectedCount} potential particle(s) detected, but none meet the current { (confidenceThreshold * 100).toFixed(0) }% confidence threshold.</p>
          <p className="text-sm mt-1">Try lowering the threshold in Settings.</p>
        </div>
      );
    }

    // This is the main view when we have valid stats to display.
    if (stats && stats.count > 0) {
      return (
        <div className="space-y-3 text-sm p-1">
          {/* A summary of how many particles are being displayed. */}
          <p className="font-semibold">
            {stats.count} particle(s) displayed (Confidence ≥ { (confidenceThreshold * 100).toFixed(0) }%).
            <span className='text-xs text-gray-500 ml-1'>(Total detected: {totalDetectedCount})</span>
          </p>

          {/* Displaying any errors or status messages related to the analysis. */}
          {analysisError && (
             <p className="text-red-600 dark:text-red-400 flex items-center text-xs">
                <Info size={14} className="mr-1 flex-shrink-0"/>
                Analysis Error: {analysisError}
            </p>
          )}
          {!stats.hasStats && !isProcessing && !analysisError && (
            <p className="text-orange-600 dark:text-orange-400 flex items-center text-xs">
                <Info size={14} className="mr-1 flex-shrink-0"/>
                Detailed analysis (shape, color, etc.) is unavailable or failed.
            </p>
          )}
           {isProcessing && stats.count > 0 && (
             <p className="text-blue-600 dark:text-blue-400 animate-pulse text-xs">Detailed analysis in progress...</p>
           )}

          {/* The detailed breakdown of the analysis results. */}
          {stats.hasStats && (
            <div className='space-y-2 pt-2 border-t border-border/50 mt-2'>
              <p className="text-xs text-gray-500 dark:text-gray-400">Breakdown for {stats.analyzedCount} analyzed particle(s):</p>

              {/* Shape Distribution */}
              {Object.keys(stats.shapes).length > 0 && (
                  <div>
                      <h4 className="font-medium text-xs mb-1">Shape Distribution:</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {Object.entries(stats.shapes).map(([shape, count]) => (
                              <div key={shape} className="flex justify-between text-xs bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded items-center">
                                  <span>{shape}:</span>
                                  <span className="font-medium">{count} ({((count / stats.analyzedCount) * 100).toFixed(0)}%)</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Color Distribution */}
              {Object.keys(stats.colors).length > 0 && (
                 <div className="mt-1">
                      <h4 className="font-medium text-xs mb-1">Color Distribution:</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {Object.entries(stats.colors).map(([color, count]) => (
                              <div key={color} className="flex justify-between text-xs bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded items-center">
                                  <span>{color}:</span>
                                  <span className="font-medium">{count} ({((count / stats.analyzedCount) * 100).toFixed(0)}%)</span>
                              </div>
                          ))}
                      </div>
                 </div>
              )}

              {/* Transparency Distribution */}
              {Object.keys(stats.transparency).length > 0 && (
                 <div className="mt-1">
                      <h4 className="font-medium text-xs mb-1">Transparency Distribution:</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {Object.entries(stats.transparency).map(([trans, count]) => (
                              <div key={trans} className="flex justify-between text-xs bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded items-center">
                                  <span>{trans}:</span>
                                  <span className="font-medium">{count} ({((count / stats.analyzedCount) * 100).toFixed(0)}%)</span>
                              </div>
                          ))}
                      </div>
                 </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // If none of the above conditions are met, render nothing.
    return null;
}