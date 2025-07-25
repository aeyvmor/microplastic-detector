"use client";

import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, Download, Printer } from "lucide-react";
import AnnotatedImageView from './AnnotatedImageView';
import SummaryStats from './SummaryStats';
import ParticleTable from './ParticleTable';
import { Loader } from '@/components/ui/loader';
import type { AnalyzedParticle, AnalysisStats, DisplayMode } from '@/types';

interface AnalysisResultsProps {
    capturedImage: string | null;
    isLoading: boolean;
    errorState: string | null;
    analysisError: string | null;
    particlesToDisplay: AnalyzedParticle[];
    analysisStats: AnalysisStats | null;
    displayMode: DisplayMode;
    totalDetectedCount: number;
    confidenceThreshold: number;
    onExportCsv: () => void;
    highlightedParticleIndex: number | null;
    onHoverParticle: (index: number | null) => void;
}

/**
 * This component is the main container for the entire results section.
 * It orchestrates the display of the annotated image, summary stats, export buttons,
 * and the detailed particle table. It also passes down the highlighting state
 * to its children so they can stay in sync.
 */
export default function AnalysisResults({
    capturedImage,
    isLoading,
    errorState,
    analysisError,
    particlesToDisplay,
    analysisStats,
    displayMode,
    totalDetectedCount,
    confidenceThreshold,
    onExportCsv,
    highlightedParticleIndex,
    onHoverParticle,
}: AnalysisResultsProps) {

    // A few boolean flags to make the render logic cleaner.
    const showResultsContent = !isLoading && capturedImage && (totalDetectedCount > 0 || particlesToDisplay.length > 0);
    const showResultsArea = capturedImage || isLoading;
    const canExport = showResultsContent && particlesToDisplay.length > 0;

    // This ref is here in case I want to add a feature to download the annotated image directly.
    const annotatedImageContainerRef = useRef<HTMLDivElement>(null);

    // If there's no image and we're not loading, show a simple placeholder.
    if (!showResultsArea) {
         return (
            <Card className="border-dashed">
                <CardContent className="pt-6 text-center text-gray-500">
                    <p>Analysis results will appear here once you upload an image.</p>
                </CardContent>
            </Card>
         );
    }

    return (
        <Card className="results-card-print">
            <CardContent className="pt-6">
                {/* Header section with title and export buttons */}
                <div className="flex justify-between items-start mb-4 gap-2 flex-wrap export-buttons-print">
                    <h2 className="text-xl font-bold flex items-center flex-shrink-0 mr-2">
                        <ZoomIn className="mr-2 h-5 w-5"/> Analysis Results
                    </h2>
                    {canExport && (
                       <div className="flex gap-2 flex-shrink-0">
                           <Button variant="outline" size="sm" onClick={onExportCsv} disabled={isLoading} title="Export CSV">
                                <Download className="mr-2 h-4 w-4" /> CSV
                           </Button>
                           <Button variant="outline" size="sm" onClick={() => window.print()} disabled={isLoading} title="Print / Save as PDF">
                                <Printer className="mr-2 h-4 w-4" /> Print / PDF
                           </Button>
                       </div>
                    )}
                </div>

                {/* Central area for loading indicators and error messages */}
                {isLoading && (
                    <div className="text-center py-10">
                        <Loader text="Processing image..." />
                    </div>
                )}
                {!isLoading && errorState && !analysisError && (
                    <div className="text-center py-10 text-red-600 dark:text-red-400">
                        Error: {errorState}
                    </div>
                )}

                {/* This is the main content area, shown only when we have results */}
                {showResultsContent && capturedImage && (
                    <div className="space-y-4">
                        {/* The annotated image itself */}
                        {particlesToDisplay.length > 0 ? (
                            <AnnotatedImageView
                                ref={annotatedImageContainerRef}
                                imageSrc={capturedImage}
                                particles={particlesToDisplay}
                                displayMode={displayMode}
                                highlightedParticleIndex={highlightedParticleIndex}
                            />
                        ) : (
                            // If there are no particles above the threshold, just show the original image.
                            <img src={capturedImage} alt="Input sample (no detections above threshold)" className="rounded-lg w-full aspect-video object-contain bg-gray-100 dark:bg-gray-800" />
                        )}

                        {/* The summary statistics section */}
                        <SummaryStats
                            stats={analysisStats}
                            totalDetectedCount={totalDetectedCount}
                            confidenceThreshold={confidenceThreshold}
                            isProcessing={isLoading}
                            analysisError={analysisError}
                        />

                        {/* The detailed table of particle data */}
                        {particlesToDisplay.length > 0 && (
                            <div className='mt-6'>
                                <h3 className='text-lg font-semibold mb-2'>Detailed Particle Data</h3>
                                <ParticleTable
                                    particles={particlesToDisplay}
                                    highlightedIndex={highlightedParticleIndex}
                                    onHoverRow={onHoverParticle}
                                />
                            </div>
                        )}
                    </div>
                )}

                 {/* A specific message for when the model finds nothing at all. */}
                 {!isLoading && capturedImage && totalDetectedCount === 0 && !errorState && (
                    <div className="text-center py-10 text-gray-500">
                        No microplastics were detected in the image.
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}