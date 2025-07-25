// src/lib/displayUtils.ts
import type { AnalyzedParticle, DisplayMode } from '@/types';

export const getColorForParticleType = (
    particle: AnalyzedParticle,
    mode: DisplayMode, // Now includes 'color', 'transparency'
    asRgba = false
): string => {
    const defaultColor = "red";
    const defaultRgba = "rgba(255, 0, 0, 0.7)";
    const alpha = asRgba ? 0.7 : 1;

    // Use default RED if mode is confidence or analysis is missing/invalid
    if (mode === 'confidence' || !particle.analysis || particle.analysis.error || particle.analysis.shape === 'Not Analyzed') {
        return asRgba ? defaultRgba : defaultColor;
    }

    // For 'type', 'color', 'transparency' modes, use color based on SHAPE for now
    // This provides visual grouping even when displaying other text labels.
    // Future: Could make boxes gray unless mode is 'color', etc.
    switch (particle.analysis.shape?.toLowerCase()) {
        case "fiber":     return asRgba ? `rgba(0, 0, 255, ${alpha})` : "blue";
        case "fragment":  return asRgba ? `rgba(0, 128, 0, ${alpha})` : "green";
        case "film":      return asRgba ? `rgba(255, 165, 0, ${alpha})`: "orange";
        case "bead":
        case "pellet":    return asRgba ? `rgba(128, 0, 128, ${alpha})`: "purple";
        case "foam":      return asRgba ? `rgba(255, 255, 0, ${alpha})`: "yellow";
        case "unknown":
        default:          return asRgba ? `rgba(128, 128, 128, ${alpha})` : "gray";
    }
};