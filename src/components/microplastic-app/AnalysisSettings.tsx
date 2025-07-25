"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import type { DisplayMode } from '@/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AnalysisSettingsProps {
    confidence: number;
    onConfidenceChange: (value: number) => void;
    displayMode: DisplayMode;
    onDisplayModeChange: (mode: DisplayMode) => void;
    availableDisplayModes: DisplayMode[];
    isProcessing: boolean;
}

/**
 * This component holds the settings for the analysis, like the confidence threshold slider
 * and the dropdown to select what data to display on the image labels.
 */
export default function AnalysisSettings({
    confidence,
    onConfidenceChange,
    displayMode,
    onDisplayModeChange,
    availableDisplayModes,
    isProcessing
}: AnalysisSettingsProps) {

    // I check here if the detailed analysis (shape, color, etc.) is available.
    // This is used to enable or disable the display mode options.
    const hasDetailedAnalysis = availableDisplayModes.includes('type');

    // I build the list of display options dynamically based on what's available.
    const displayOptions = [
        { value: 'confidence', label: 'Confidence (%)', available: true },
        { value: 'type', label: 'Particle Type', available: hasDetailedAnalysis },
        { value: 'color', label: 'Particle Color', available: hasDetailedAnalysis },
        { value: 'transparency', label: 'Particle Transparency', available: hasDetailedAnalysis },
    ].filter(option => option.available);

    return (
         <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Settings</h2>

              {/* The confidence threshold slider */}
              <div className="mb-4">
                <Label htmlFor="confidenceSlider" className="block mb-1 text-sm font-medium">
                  Confidence Threshold: {(confidence * 100).toFixed(0)}%
                </Label>
                <Slider
                  id="confidenceSlider"
                  value={[confidence * 100]} // The slider works with a 0-100 range
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(val) => onConfidenceChange(val[0] / 100)} // I convert it back to a 0-1 scale for the app logic
                  disabled={isProcessing}
                  className="mt-2"
                  aria-label="Confidence Threshold Slider"
                />
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                   Only show detections with confidence above this level.
                 </p>
              </div>

              {/* The dropdown for selecting the label display mode */}
              {displayOptions.length > 0 && (
                <div>
                  <Label className="block mb-1 text-sm font-medium">Label Display Mode:</Label>
                  <div className="mt-1">
                      <Select
                        value={displayMode}
                        onValueChange={(value) => onDisplayModeChange(value as DisplayMode)}
                        disabled={isProcessing || displayOptions.length <= 1}
                      >
                        <SelectTrigger className="w-full sm:w-[200px]" aria-label="Label Display Mode Selector">
                          <SelectValue placeholder="Select display mode..." />
                        </SelectTrigger>
                        <SelectContent>
                          {displayOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Choose what information to show on the image labels.
                      </p>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
    );
}