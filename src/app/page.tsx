"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import Webcam from "react-webcam";
import ImageInput from "@/components/microplastic-app/ImageInput";
import AnalysisSettings from "@/components/microplastic-app/AnalysisSettings";
import AnalysisResults from "@/components/microplastic-app/AnalysisResults";
import { createAnnotatedImage } from '@/lib/imageUtils';
import { resizeImage } from '@/lib/canvasUtils';
import type { BoundingBox, ParticleAnalysis, AnalyzedParticle, AnalysisStats, DisplayMode } from "@/types";

/**
 * This is the heart of the Microplastic Detector App!
 * It's the main page component that ties everything together. It manages all the
 * state, orchestrates the API calls for detection and analysis, and renders all
 * the child components that make up the UI. I've also included the logic for
 * the interactive highlighting between the particle table and the image view here.
 */
export default function MicroplasticDetectorApp() {
  // Core state for the application's logic and UI
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const [analyzedParticles, setAnalyzedParticles] = useState<AnalyzedParticle[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [analysisErrorState, setAnalysisErrorState] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("confidence");
  const [highlightedParticleIndex, setHighlightedParticleIndex] = useState<number | null>(null);

  // A ref to access the webcam component directly
  const webcamRef = useRef<Webcam>(null);

  // A memoized value to easily check if either detection or analysis is in progress.
  // This simplifies disabling buttons and showing loading states in the UI.
  const isProcessing = useMemo(() => isDetecting || isAnalyzing, [isDetecting, isAnalyzing]);

  // This is where the magic happens for filtering particles.
  // It decides which particles to show based on the confidence threshold.
  // It also cleverly combines raw bounding boxes (before analysis) and
  // fully analyzed particles into one list for display.
  const particlesToDisplay = useMemo<AnalyzedParticle[]>(() => {
    let particles: (BoundingBox | AnalyzedParticle)[] = [];
    if (analyzedParticles.length > 0) {
      particles = analyzedParticles;
    } else if (boundingBoxes.length > 0) {
      // If we only have detection data, map it to the particle structure
      particles = boundingBoxes.map((box, index) => ({ ...box, index: index, analysis: null }));
    }
    // Finally, filter by the user-defined confidence level
    return particles.filter(p => p.confidence >= confidenceThreshold) as AnalyzedParticle[];
  }, [analyzedParticles, boundingBoxes, confidenceThreshold]);

  // Calculates all the summary statistics for the results view.
  // It counts up the different shapes, colors, and transparency levels.
  const analysisStats = useMemo<AnalysisStats | null>(() => {
    if (!particlesToDisplay || particlesToDisplay.length === 0) return null;

    const shapes: Record<string, number> = {};
    const colors: Record<string, number> = {};
    const transparency: Record<string, number> = {};
    let analyzedCount = 0;

    particlesToDisplay.forEach(particle => {
      if (particle.analysis && !particle.analysis.error && particle.analysis.shape !== 'Not Analyzed') {
        analyzedCount++;
        shapes[particle.analysis.shape || "Unknown"] = (shapes[particle.analysis.shape || "Unknown"] || 0) + 1;
        colors[particle.analysis.color || "Unknown"] = (colors[particle.analysis.color || "Unknown"] || 0) + 1;
        transparency[particle.analysis.transparency || "Unknown"] = (transparency[particle.analysis.transparency || "Unknown"] || 0) + 1;
      }
    });

    const hasStats = analyzedCount > 0;
    return { shapes, colors, transparency, count: particlesToDisplay.length, analyzedCount, hasStats };
  }, [particlesToDisplay]);

  // Determines which display modes are available in the settings dropdown.
  // For example, 'type' and 'color' are only available after a successful analysis.
  const availableDisplayModes = useMemo<DisplayMode[]>(() => {
    const modes: DisplayMode[] = ['confidence'];
    if (analysisStats?.hasStats) {
      modes.push('type', 'color', 'transparency');
    }
    return modes;
  }, [analysisStats]);

  // A simple utility to reset all the analysis-related state.
  // I call this whenever a new image is uploaded or captured.
  const resetAnalysisState = useCallback(() => {
    setErrorState(null);
    setAnalysisErrorState(null);
    setBoundingBoxes([]);
    setAnalyzedParticles([]);
    setDisplayMode('confidence');
    setHighlightedParticleIndex(null);
  }, []);

  // Clears the current image and resets the analysis state.
  const handleClearImage = useCallback(() => {
    setCapturedImage(null);
    resetAnalysisState();
  }, [resetAnalysisState]);

  // This function takes the raw data from the Roboflow API and transforms it
  // into the BoundingBox format that I use throughout the app.
  const processRoboflowResults = (roboflowData: any): BoundingBox[] => {
    if (!roboflowData?.image?.width || !roboflowData?.image?.height) {
      throw new Error("Invalid detection data structure (missing image dimensions).");
    }
    if (!roboflowData.predictions || !Array.isArray(roboflowData.predictions)) {
      return []; // No predictions, return empty array
    }

    const boxes: BoundingBox[] = [];
    const imgWidth = roboflowData.image.width;
    const imgHeight = roboflowData.image.height;

    roboflowData.predictions.forEach((pred: any) => {
      // Basic validation to make sure the prediction object is what I expect
      if (pred && typeof pred.x === 'number' && typeof pred.y === 'number' && typeof pred.width === 'number' && typeof pred.height === 'number' && typeof pred.confidence === 'number' && typeof pred.class === 'string') {
        boxes.push({
          x: pred.x / imgWidth,
          y: pred.y / imgHeight,
          width: pred.width / imgWidth,
          height: pred.height / imgHeight,
          confidence: pred.confidence,
          class: pred.class
        });
      } else {
        console.warn("Skipping invalid prediction object:", pred);
      }
    });
    return boxes;
  };

  // Kicks off the second stage of the process: sending the detected particles to Gemini for analysis.
  const startAnalysis = useCallback(async (imageDataUrl: string, boxesToAnalyze: BoundingBox[]) => {
    setIsDetecting(false);
    setIsAnalyzing(true);
    setAnalysisErrorState(null);

    try {
      // First, I create an image with the bounding boxes drawn on it for Gemini to see.
      const annotatedImageDataUrl = await createAnnotatedImage(imageDataUrl, boxesToAnalyze);
      const boxesWithIndices = boxesToAnalyze.map((box, index) => ({ ...box, index }));

      const response = await fetch('/api/analyze-particles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: annotatedImageDataUrl, boundingBoxes: boxesWithIndices })
      });

      let analysisData;
      try {
        analysisData = await response.json();
      } catch (jsonError) {
        throw new Error(`Analysis API non-JSON response (Status: ${response.status})`);
      }

      if (!response.ok) {
        console.error("Analysis API Error:", analysisData);
        throw new Error(analysisData.error || `Analysis API failed: ${response.status}`);
      }

      if (analysisData.particles && Array.isArray(analysisData.particles)) {
        setAnalyzedParticles(analysisData.particles as AnalyzedParticle[]);
        if (analysisData.error) {
          setAnalysisErrorState(analysisData.error);
        }
      } else {
        throw new Error("Invalid data structure from analysis API.");
      }
    } catch (error: any) {
      console.error('Error during analysis phase:', error);
      setAnalysisErrorState(`Analysis Error: ${error.message}`);
      setAnalyzedParticles([]); // Clear any partial data
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // This is the main function that starts the whole detection and analysis pipeline.
  const startDetection = useCallback(async (imageDataUrl: string) => {
    setIsDetecting(true);
    setIsAnalyzing(false);
    setErrorState(null);
    setAnalysisErrorState(null);
    setBoundingBoxes([]);
    setAnalyzedParticles([]);
    setHighlightedParticleIndex(null);

    try {
      // I resize the image here to speed things up.
      const resizedImageDataUrl = await resizeImage(imageDataUrl, 1024);
      const fetchResponse = await fetch(resizedImageDataUrl);
      if (!fetchResponse.ok) throw new Error("Failed to fetch image data.");

      const blob = await fetchResponse.blob();
      const formData = new FormData();
      formData.append('image', blob, 'image.png');

      const response = await fetch('/api/detect', { method: 'POST', body: formData });
      if (!response.ok) {
        const e = await response.json().catch(() => ({ error: `Detection failed: ${response.status}` }));
        throw new Error(e.error || 'Detection API request failed');
      }

      const detectionData = await response.json();
      const detectedBoxes = processRoboflowResults(detectionData);
      setBoundingBoxes(detectedBoxes);

      // Only proceed to the analysis step if we actually found something.
      const boxesAboveThreshold = detectedBoxes.filter(box => box.confidence >= confidenceThreshold);
      if (boxesAboveThreshold.length > 0) {
        // I don't need to `await` this, as the UI will update reactively.
        void startAnalysis(resizedImageDataUrl, boxesAboveThreshold);
      } else {
        setIsDetecting(false);
      }
    } catch (error: any) {
      console.error('Error during detection phase:', error);
      setErrorState(`Detection Error: ${error.message}`);
      setIsDetecting(false);
      setIsAnalyzing(false);
    }
  }, [confidenceThreshold, startAnalysis]);

  // Grabs a screenshot from the webcam and starts the detection process.
  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot({ width: 1920, height: 1080 });
      if (imageSrc) {
        resetAnalysisState();
        setCapturedImage(imageSrc);
        void startDetection(imageSrc);
      } else {
        setErrorState("Failed to capture image.");
      }
    }
  }, [webcamRef, resetAnalysisState, startDetection]);

  // Handles the file upload event, reads the file as a data URL, and starts detection.
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resetAnalysisState();
          const imageDataUrl = reader.result as string;
          setCapturedImage(imageDataUrl);
          void startDetection(imageDataUrl);
        } else {
          setErrorState("Failed to read file.");
        }
      };
      reader.onerror = () => {
        setErrorState("Error reading file.");
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value to allow uploading the same file again.
    event.target.value = '';
  }, [resetAnalysisState, startDetection]);

  // A nice little utility to export the particle data to a CSV file.
  const handleExportCsv = useCallback(() => {
    if (particlesToDisplay.length === 0) {
      alert("No particle data above threshold to export.");
      return;
    }
    const headers = ["Index", "Confidence (%)", "Class", "Center X (rel)", "Center Y (rel)", "Width (rel)", "Height (rel)", "Shape", "Color", "Transparency", "Analysis Note"];
    const rows = particlesToDisplay.map(p => [
      p.index,
      (p.confidence * 100).toFixed(1),
      p.class,
      p.x.toFixed(5),
      p.y.toFixed(5),
      p.width.toFixed(5),
      p.height.toFixed(5),
      p.analysis?.shape || '',
      p.analysis?.color || '',
      p.analysis?.transparency || '',
      p.analysis?.error || p.analysis?.reason || ''
    ]);

    // Simple CSV field escaping
    const escapeCsvField = (field: any): string => {
      const s = String(field ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    try {
      const csvContent = [
        headers.map(escapeCsvField).join(','),
        ...rows.map(row => row.map(escapeCsvField).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      const ts = new Date().toISOString().slice(0, 10);
      link.setAttribute("download", `microplastic_analysis_${ts}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      setErrorState("Failed to generate CSV.");
    }
  }, [particlesToDisplay]);

  // This handler is for the interactive highlighting feature.
  // It just sets the state when the user hovers over a particle in the table.
  const handleHoverParticle = useCallback((index: number | null) => {
    setHighlightedParticleIndex(index);
  }, []);


  // Here's where I render the actual UI, splitting it into two columns.
  return (
    <div className="p-4 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* The left column contains the image input and settings. */}
      <div className="space-y-4 flex flex-col">
        <ImageInput
            webcamRef={webcamRef}
            capturedImage={capturedImage}
            isProcessing={isProcessing}
            errorState={errorState}
            onCapture={captureImage}
            onFileUpload={handleFileUpload}
            onClearImage={handleClearImage}
        />
        {capturedImage && (
             <AnalysisSettings
                confidence={confidenceThreshold}
                onConfidenceChange={setConfidenceThreshold}
                displayMode={displayMode}
                onDisplayModeChange={setDisplayMode}
                availableDisplayModes={availableDisplayModes}
                isProcessing={isProcessing}
            />
        )}
      </div>

      {/* The right column is for all the results. */}
      <AnalysisResults
          capturedImage={capturedImage}
          isLoading={isProcessing}
          errorState={errorState}
          analysisError={analysisErrorState}
          particlesToDisplay={particlesToDisplay}
          analysisStats={analysisStats}
          displayMode={displayMode}
          totalDetectedCount={boundingBoxes.length}
          confidenceThreshold={confidenceThreshold}
          onExportCsv={handleExportCsv}
          highlightedParticleIndex={highlightedParticleIndex}
          onHoverParticle={handleHoverParticle}
      />
    </div>
  );
}