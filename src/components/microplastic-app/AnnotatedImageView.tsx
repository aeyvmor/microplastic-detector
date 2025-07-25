"use client";

import React, { useEffect, useRef, forwardRef } from 'react';
import type { AnalyzedParticle, DisplayMode } from '@/types';
import { getColorForParticleType } from '@/lib/displayUtils';

interface AnnotatedImageViewProps {
    imageSrc: string;
    particles: AnalyzedParticle[];
    displayMode: DisplayMode;
    highlightedParticleIndex: number | null;
}

/**
 * This component is where the visual magic happens. It takes the original image
 * and uses a canvas overlay to draw all the bounding boxes and labels on top.
 * It's also responsible for the cool highlighting effect when you hover over the table.
 */
const AnnotatedImageView = forwardRef<HTMLDivElement, AnnotatedImageViewProps>(
    ({ imageSrc, particles, displayMode, highlightedParticleIndex }, ref) => {
        const imageRef = useRef<HTMLImageElement>(null);
        const canvasRef = useRef<HTMLCanvasElement>(null);

        // I use a useEffect hook to handle all the canvas drawing.
        // This effect re-runs whenever the image, particles, or display settings change.
        useEffect(() => {
            const img = imageRef.current;
            const canvas = canvasRef.current;
            if (!canvas || !img) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                console.error("Failed to get 2D context");
                return;
            }

            // This is the main drawing function.
            const drawBoxes = () => {
                if (!img.complete || img.naturalWidth === 0) return; // Make sure the image is actually loaded

                // I match the canvas size to the displayed image size, accounting for device pixel ratio.
                const rect = img.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr);
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;

                // Clear the canvas before drawing new boxes
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const scaleX = rect.width / img.naturalWidth;
                const scaleY = rect.height / img.naturalHeight;

                particles.forEach((particle) => {
                    // Convert the relative coordinates to absolute pixel values for drawing
                    const boxWidth = particle.width * img.naturalWidth * scaleX;
                    const boxHeight = particle.height * img.naturalHeight * scaleY;
                    const boxCenterX = particle.x * img.naturalWidth * scaleX;
                    const boxCenterY = particle.y * img.naturalHeight * scaleY;
                    const topLeftX = boxCenterX - boxWidth / 2;
                    const topLeftY = boxCenterY - boxHeight / 2;

                    // --- Highlighting Logic ---
                    const isHighlighted = particle.index === highlightedParticleIndex;
                    const currentLineWidth = isHighlighted ? 4 : 2; // Make highlighted box thicker
                    const strokeColor = getColorForParticleType(particle, displayMode);

                    // --- Draw the Bounding Box ---
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = currentLineWidth;
                    ctx.strokeRect(topLeftX, topLeftY, boxWidth, boxHeight);

                    // I add a subtle fill to the highlighted box for extra emphasis.
                    if (isHighlighted) {
                        ctx.fillStyle = getColorForParticleType(particle, displayMode, true).replace(/0.7\)$/, '0.2)');
                        ctx.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
                    }

                    // --- Draw the Label ---
                    let labelText = '';
                    const confidenceValue = (particle.confidence * 100).toFixed(0);
                    if (!particle.analysis || particle.analysis.error || particle.analysis.shape === 'Not Analyzed') {
                        labelText = `${particle.class} (${confidenceValue}%)`;
                    } else {
                        switch (displayMode) {
                            case 'confidence': labelText = `${confidenceValue}%`; break;
                            case 'type': labelText = `${particle.analysis.shape || 'Unknown'}`; break;
                            case 'color': labelText = `${particle.analysis.color || 'Unknown'}`; break;
                            case 'transparency': labelText = `${particle.analysis.transparency || 'Unknown'}`; break;
                            default: labelText = `${particle.class} (${confidenceValue}%)`;
                        }
                    }

                    ctx.font = "11px Arial";
                    const textMetrics = ctx.measureText(labelText);
                    const textWidth = textMetrics.width;
                    const textHeight = 11;
                    const padding = 3;

                    // Logic to position the label nicely above the box, avoiding edges.
                    let labelBgY = topLeftY - textHeight - padding * 1.5;
                    if (labelBgY < 0) { // If it would go off-screen, move it below the box
                        labelBgY = topLeftY + boxHeight + padding / 2;
                    }
                    let labelBgX = topLeftX + (boxWidth / 2) - (textWidth / 2) - padding;
                    labelBgX = Math.max(0, labelBgX); // Don't let it go off the left edge
                    if (labelBgX + textWidth + padding * 2 > rect.width) { // Or the right edge
                        labelBgX = rect.width - textWidth - padding * 2;
                    }

                    // Draw the label's background and text
                    ctx.fillStyle = getColorForParticleType(particle, displayMode, true);
                    ctx.fillRect(labelBgX, labelBgY, textWidth + padding * 2, textHeight + padding);
                    ctx.fillStyle = "white";
                    ctx.textAlign = "left";
                    ctx.textBaseline = "top";
                    ctx.fillText(labelText, labelBgX + padding, labelBgY + padding / 2);
                });
            };

            // I need to make sure the image is loaded before I try to draw on it.
            const handleLoad = () => { drawBoxes(); img.removeEventListener('load', handleLoad); };
            const handleError = () => { img.removeEventListener('error', handleError); };
            if (img.complete && img.naturalWidth > 0) {
                drawBoxes();
            } else {
                img.addEventListener('load', handleLoad);
                img.addEventListener('error', handleError);
            }

            // Redraw the boxes if the window is resized.
            const handleResize = () => { requestAnimationFrame(drawBoxes); };
            window.addEventListener('resize', handleResize);

            // Cleanup function to remove event listeners when the component unmounts.
            return () => {
                window.removeEventListener('resize', handleResize);
                if (canvas) {
                    const ctx = canvas.getContext("2d");
                    if (canvas.width > 0) {
                        ctx?.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }
                img.removeEventListener('load', handleLoad);
                img.removeEventListener('error', handleError);
            };
        }, [imageSrc, particles, displayMode, highlightedParticleIndex]);


        return (
            <div id="annotated-image-container" ref={ref} className="relative bg-white dark:bg-gray-900 rounded overflow-hidden">
                <img ref={imageRef} src={imageSrc} alt="Analyzed sample with annotations" className="block w-full h-auto max-h-[70vh] object-contain" crossOrigin="anonymous" />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
            </div>
        );
    }
);
AnnotatedImageView.displayName = 'AnnotatedImageView';
export default AnnotatedImageView;