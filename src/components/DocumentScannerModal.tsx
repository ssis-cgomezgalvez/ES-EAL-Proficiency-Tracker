import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  RotateCw,
  RefreshCw,
  Check,
  Sliders,
  Sparkles,
  AlertCircle,
  Upload,
  FileText,
  Sun
} from 'lucide-react';

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (scannedDataUrl: string, fileName: string) => void;
  documentTitle?: string;
}

type ScanFilter = 'document' | 'enhanced' | 'grayscale' | 'original';

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  documentTitle = 'Student Writing Sample'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<HTMLImageElement | null>(null);
  const [activeFilter, setActiveFilter] = useState<ScanFilter>('document');
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);

  // Stop video stream helper
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    stopStream();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);

        // Check torch support
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.() as { torch?: boolean } | undefined;
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        }
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError(
        'Unable to access camera. Please allow camera permissions, or choose "Select Photo" below.'
      );
      setCameraActive(false);
    }
  }, [stopStream]);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, capturedImage, startCamera, stopStream]);

  // Toggle flashlight / torch if supported
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        await (track as any).applyConstraints({
          advanced: [{ torch: !torchOn }]
        });
        setTorchOn(!torchOn);
      } catch (e) {
        console.warn('Torch toggle failed:', e);
      }
    }
  };

  // Capture frame from video stream
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);

    const img = new Image();
    img.onload = () => {
      setCapturedImage(img);
      stopStream();
    };
    img.src = dataUrl;
  };

  // Handle fallback file upload from file picker
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setCapturedImage(img);
        stopStream();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Render processed image with filters and rotation
  const renderProcessedCanvas = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const isRotated90or270 = rotationDegrees % 180 !== 0;
    const width = isRotated90or270 ? capturedImage.height : capturedImage.width;
    const height = isRotated90or270 ? capturedImage.width : capturedImage.height;

    canvas.width = width;
    canvas.height = height;

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotationDegrees * Math.PI) / 180);
    ctx.drawImage(
      capturedImage,
      -capturedImage.width / 2,
      -capturedImage.height / 2,
      capturedImage.width,
      capturedImage.height
    );
    ctx.restore();

    // Apply filters
    if (activeFilter === 'original') {
      return;
    }

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    if (activeFilter === 'document') {
      // Document scan: high-contrast monochrome with adaptive background whitening
      for (let i = 0; i < data.length; i += 4) {
        // Luminance
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        // High contrast curve: stretch paper shadows toward 255 and pencil toward 0
        let val: number;
        if (gray > 135) {
          val = Math.min(255, 140 + (gray - 135) * 1.8);
        } else {
          val = Math.max(0, gray * 0.7);
        }
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      ctx.putImageData(imgData, 0, 0);
    } else if (activeFilter === 'grayscale') {
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      ctx.putImageData(imgData, 0, 0);
    } else if (activeFilter === 'enhanced') {
      // Color boost + contrast
      const contrast = 1.35;
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
        data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
        data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }, [capturedImage, rotationDegrees, activeFilter]);

  useEffect(() => {
    if (capturedImage) {
      renderProcessedCanvas();
    }
  }, [capturedImage, rotationDegrees, activeFilter, renderProcessedCanvas]);

  const handleRetake = () => {
    setCapturedImage(null);
    setRotationDegrees(0);
    startCamera();
  };

  const handleRotate = () => {
    setRotationDegrees((prev) => (prev + 90) % 360);
  };

  const handleSaveAndAttach = () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);

    try {
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
      const timestamp = new Date().toISOString().slice(0, 10);
      const safeTitle = documentTitle.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Scanned_${safeTitle}_${timestamp}.jpg`;

      onScanComplete(dataUrl, filename);
      onClose();
    } catch (err) {
      console.error('Failed to export scanned canvas:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">
                {capturedImage ? 'Review & Enhance Scanned Document' : 'Document Scanner & Sample Capture'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {capturedImage
                  ? 'Adjust scan filters and orientation before attaching'
                  : 'Align student writing or rubric worksheet inside the guide frame'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="flex-1 bg-slate-900 flex items-center justify-center overflow-hidden relative min-h-[360px] max-h-[520px]">
          {!capturedImage ? (
            /* Live Camera Viewfinder */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-contain"
              />

              {/* Viewfinder Framing Guide Overlay */}
              <div className="absolute inset-8 sm:inset-12 border-2 border-white/60 border-dashed rounded-xl pointer-events-none flex flex-col justify-between p-3 shadow-lg">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-l-4 border-white" />
                  <div className="w-6 h-6 border-t-4 border-r-4 border-white" />
                </div>
                <div className="text-center">
                  <span className="bg-slate-900/80 text-white/90 text-[11px] px-3 py-1 rounded-full backdrop-blur-xs font-medium">
                    Position document inside the frame
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-l-4 border-white" />
                  <div className="w-6 h-6 border-b-4 border-r-4 border-white" />
                </div>
              </div>

              {/* Camera Error / Fallback State */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                  <AlertCircle className="h-8 w-8 text-amber-400" />
                  <p className="text-xs max-w-sm text-slate-200">{cameraError}</p>
                  <label className="inline-flex items-center space-x-2 bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 transition-colors shadow-xs">
                    <Upload className="h-4 w-4" />
                    <span>Upload Image File Instead</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          ) : (
            /* Scanned Image Preview */
            <div className="w-full h-full flex items-center justify-center p-3">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[480px] object-contain rounded-lg shadow-xl"
              />
            </div>
          )}
        </div>

        {/* Controls & Filter Bar */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-3">
          {!capturedImage ? (
            /* Live Camera Controls */
            <div className="flex items-center justify-between">
              {/* Fallback File Picker Button */}
              <label className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                <Upload className="h-4 w-4 text-slate-500" />
                <span>Upload from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Snap Button */}
              <button
                type="button"
                onClick={handleCapture}
                disabled={!cameraActive}
                className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                title="Snap Document"
              >
                <div className="w-11 h-11 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white" />
                </div>
              </button>

              {/* Torch Toggle if available */}
              {hasTorch ? (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`inline-flex items-center space-x-1 text-xs px-3 py-2 rounded-lg font-medium transition-colors ${
                    torchOn ? 'bg-amber-100 text-amber-900' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  <span>Flash {torchOn ? 'On' : 'Off'}</span>
                </button>
              ) : (
                <div className="w-28 text-right text-[11px] text-slate-400">
                  Hold document flat
                </div>
              )}
            </div>
          ) : (
            /* Scanned Review Controls */
            <div className="space-y-3">
              {/* Filter Pills */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <span className="text-slate-500 font-medium mr-1 flex items-center space-x-1">
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Filter:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('document')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      activeFilter === 'document'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Document Scan (B&amp;W)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('enhanced')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      activeFilter === 'enhanced'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Color Enhanced
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('grayscale')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      activeFilter === 'grayscale'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Grayscale
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('original')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      activeFilter === 'original'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Original Photo
                  </button>
                </div>

                {/* Rotate button */}
                <button
                  type="button"
                  onClick={handleRotate}
                  className="inline-flex items-center space-x-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Rotate 90°</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retake Scan</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      stopStream();
                      onClose();
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAndAttach}
                    disabled={isProcessing}
                    className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>{isProcessing ? 'Processing...' : 'Attach Scanned Document'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
