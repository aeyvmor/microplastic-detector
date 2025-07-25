"use client";

import React, { ChangeEvent, RefObject } from 'react';
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, RefreshCw } from "lucide-react";
import { Loader } from "@/components/ui/loader";

interface ImageInputProps {
  webcamRef: RefObject<Webcam | null>;
  capturedImage: string | null;
  isProcessing: boolean;
  errorState: string | null;
  onCapture: () => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
}

/**
 * This component handles all the ways a user can provide an image.
 * It shows the webcam feed, displays the captured/uploaded image,
 * and contains the buttons for capturing, uploading, and clearing the image.
 */
export default function ImageInput({
    webcamRef,
    capturedImage,
    isProcessing,
    errorState,
    onCapture,
    onFileUpload,
    onClearImage
}: ImageInputProps) {

    return (
        <Card>
            <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Camera className="mr-2 h-5 w-5"/> Input Image
                </h2>

                {/* I show the webcam feed only if there's no image captured yet. */}
                {!capturedImage && (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/png"
                    videoConstraints={{ facingMode: "environment" }} // I prefer the rear camera for this kind of work.
                    className="rounded-lg w-full aspect-video bg-gray-200 dark:bg-gray-700"
                  />
                )}

                 {/* Once an image is captured or uploaded, I display it here. */}
                 {capturedImage && (
                   <div className="relative">
                     <img
                        src={capturedImage}
                        alt="Input sample"
                        className="rounded-lg w-full aspect-video object-contain bg-gray-100 dark:bg-gray-800"
                     />
                     {/* The little 'x' button to clear the image and start over. */}
                     <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                        onClick={onClearImage}
                        title="Clear Image & Results"
                        disabled={isProcessing}
                     >
                         <RefreshCw size={16}/>
                     </Button>
                   </div>
                )}

                {/* The main action buttons for the user. */}
                <div className="flex flex-col sm:flex-row mt-4 gap-2">
                  {/* The capture button is disabled if there's already an image. */}
                  <Button
                    onClick={onCapture}
                    className="flex-1"
                    disabled={isProcessing || !!capturedImage}
                    title={capturedImage ? "Clear current image first" : "Capture from webcam"}
                  >
                    <Camera className="mr-2 h-4 w-4" /> Capture
                  </Button>

                  {/* I made the upload button a bit tricky. It's a styled button with a
                      hidden file input on top of it. This gives me full control over the look. */}
                  <Button
                    variant="outline"
                    className="flex-1 relative"
                    disabled={isProcessing || !!capturedImage}
                    title={capturedImage ? "Clear current image first" : "Upload an image file"}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Upload Image
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={onFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isProcessing || !!capturedImage}
                      aria-hidden="true"
                    />
                  </Button>
                </div>

                {/* Loading and error indicators are shown below the buttons. */}
                 {isProcessing && (
                    <div className="mt-3">
                        <Loader text="Processing image..." />
                    </div>
                 )}
                 {errorState && !isProcessing && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-3 text-center bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800/30">
                        {errorState}
                    </p>
                 )}

            </CardContent>
        </Card>
    );
}