// src/types/index.ts

/**
 * Represents the raw bounding box data from the detection model (e.g., Roboflow).
 * Coordinates and dimensions are relative to the image size (0.0 to 1.0).
 */
export interface BoundingBox {
    x: number;          // Center X
    y: number;          // Center Y
    width: number;      // Relative width
    height: number;     // Relative height
    confidence: number; // Detection confidence
    class: string;      // Detected class label
  }
  
  /**
   * Represents the analysis results for a single particle from the AI model (e.g., Gemini).
   */
  export interface ParticleAnalysis {
    shape?: string;        // e.g., "Fiber", "Fragment", "Unknown", "Error", "Parse Error", "Not Analyzed"
    color?: string;        // e.g., "Blue", "Clear", "Unknown"
    transparency?: string; // e.g., "Opaque", "Translucent", "Unknown"
    error?: string;        // Optional error message from backend/parsing
    reason?: string;       // Optional reason if not analyzed
  }
  
  /**
   * Combines the bounding box data with its assigned index and analysis results.
   * This is the primary data structure used for display and statistics after analysis.
   */
  export interface AnalyzedParticle extends BoundingBox {
    index: number;              // Index assigned during processing
    analysis: ParticleAnalysis | null; // Analysis results (or null/error state)
  }
  
  /**
   * Defines the possible modes for displaying labels on the annotated image.
   * Will be expanded later.
   */

export type DisplayMode = 'confidence' | 'type' | 'color' | 'transparency';
  
  /**
   * Structure for calculated statistics used in the summary component.
   */
  export interface AnalysisStats {
      shapes: Record<string, number>;
      colors: Record<string, number>;
      transparency: Record<string, number>;
      count: number; // Total particles meeting threshold
      analyzedCount: number; // Particles with valid analysis
      hasStats: boolean; // Flag indicating if any detailed analysis is available
  }