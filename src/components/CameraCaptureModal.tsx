import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  X, 
  RotateCcw, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  Plus, 
  Upload
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (dataUrl: string) => void;
  photosCount: number;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  photosCount
}) => {
  const { t } = useApp();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileFallbackInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [flashEffect, setFlashEffect] = useState<boolean>(false);
  const [snappedCount, setSnappedCount] = useState<number>(0);

  // Stop current active media stream tracks
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // Start video stream from user camera
  const startCamera = useCallback(async (preferredFacing: 'environment' | 'user' = facingMode) => {
    setIsLoading(true);
    setErrorMessage(null);
    stopStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(t('cameraPermissionError') || "Votre navigateur ne supporte pas l'accès direct à la caméra.");
      setIsLoading(false);
      return;
    }

    try {
      // First attempt with ideal 1080p and facing mode
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: preferredFacing },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
      } catch {
        // Fallback with basic video constraint if complex constraints fail
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: preferredFacing }
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let msg = t('cameraPermissionError') || "Impossible d'accéder à la caméra. Vérifiez les autorisations de votre navigateur.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = "Autorisation caméra refusée. Veuillez autoriser la caméra dans votre navigateur ou importer une photo.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = "Aucune caméra détectée sur cet appareil.";
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, stopStream, t]);

  // Handle open/close state
  useEffect(() => {
    if (isOpen) {
      setCapturedPreview(null);
      setSnappedCount(0);
      startCamera('environment');
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen]);

  // Toggle front/back camera
  const toggleCameraFacing = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    await startCamera(nextFacing);
  };

  // Take photo
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    // Trigger visual flash effect
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If user camera, mirror horizontal for natural selfie if needed, but for properties normal orientation
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPreview(dataUrl);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPreview(null);
    if (!stream) {
      startCamera(facingMode);
    }
  };

  // Keep and save photo
  const handleKeepPhoto = (takeAnother: boolean = false) => {
    if (!capturedPreview) return;
    onPhotoCaptured(capturedPreview);
    setSnappedCount(prev => prev + 1);

    if (takeAnother) {
      setCapturedPreview(null);
      if (!stream) {
        startCamera(facingMode);
      }
    } else {
      stopStream();
      onClose();
    }
  };

  // Fallback direct capture through native system file input
  const handleNativeFallbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCapturedPreview(event.target.result as string);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
      {/* Hidden offscreen canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden fallback file input for native camera */}
      <input
        ref={fileFallbackInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleNativeFallbackChange}
      />

      <div className="relative w-full max-w-lg bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#181818]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#c5a36c]/10 border border-[#c5a36c]/30 flex items-center justify-center">
              <Camera className="w-4 h-4 text-[#c5a36c]" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-white">
                {t('cameraModalTitle')}
              </h3>
              <p className="text-[11px] text-[#999999]">
                {photosCount + snappedCount} {photosCount + snappedCount > 1 ? 'photos ajoutées' : 'photo ajoutée'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#cccccc] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder / Preview Container */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] sm:min-h-[380px] overflow-hidden">
          
          {/* Flash animation effect */}
          {flashEffect && (
            <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
          )}

          {/* 1. If photo was snapped, show captured preview */}
          {capturedPreview ? (
            <div className="relative w-full h-full flex items-center justify-center bg-[#0a0a0a]">
              <img
                src={capturedPreview}
                alt="Aperçu de la photo capturée"
                className="w-full h-full object-contain max-h-[55vh]"
              />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-white/10">
                Aperçu
              </div>
            </div>
          ) : errorMessage ? (
            /* 2. If error accessing camera */
            <div className="p-6 text-center max-w-sm space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold text-white mb-1">Accès caméra</h4>
                <p className="text-xs text-[#999999] leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => fileFallbackInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-[#c5a36c] hover:bg-[#d4b57e] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Prendre avec l'appareil photo du téléphone</span>
                </button>
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Réessayer l'accès direct</span>
                </button>
              </div>
            </div>
          ) : (
            /* 3. Live Camera Viewfinder */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[55vh]"
              />

              {/* Viewfinder guidelines overlay for architectural framing */}
              <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-2xl flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-[#c5a36c]" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-[#c5a36c]" />
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-[#c5a36c]" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-[#c5a36c]" />
                </div>
              </div>

              {/* Camera flip button */}
              <button
                type="button"
                onClick={toggleCameraFacing}
                title={t('switchCamera')}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer z-30"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                <span className="inline-block bg-black/60 backdrop-blur-md text-[11px] text-white/90 px-3 py-1 rounded-full border border-white/10">
                  Cadrez la pièce ou la façade
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 sm:p-5 bg-[#181818] border-t border-white/10">
          {capturedPreview ? (
            /* Controls after snapping photo */
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="py-3 px-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-[#888888]" />
                  <span>{t('retakePhoto')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleKeepPhoto(false)}
                  className="py-3 px-3 rounded-xl bg-[#c5a36c] hover:bg-[#d4b57e] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('confirmPhoto')}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleKeepPhoto(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-[#c5a36c]/40 bg-[#c5a36c]/10 hover:bg-[#c5a36c]/20 text-[#c5a36c] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{t('takeAnother')} (+ Continuer)</span>
              </button>
            </div>
          ) : (
            /* Live capture controls */
            <div className="flex items-center justify-between">
              {/* Native fallback button */}
              <button
                type="button"
                onClick={() => fileFallbackInputRef.current?.click()}
                className="text-xs text-[#888888] hover:text-white flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Importer un fichier</span>
              </button>

              {/* Shutter button */}
              <button
                type="button"
                onClick={capturePhoto}
                disabled={isLoading || !!errorMessage}
                className={`w-16 h-16 rounded-full border-4 border-[#c5a36c] p-1 flex items-center justify-center transition-all cursor-pointer ${
                  isLoading || !!errorMessage
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:scale-105 active:scale-95 shadow-lg shadow-[#c5a36c]/20'
                }`}
              >
                <div className="w-full h-full rounded-full bg-[#c5a36c] flex items-center justify-center">
                  <Camera className="w-6 h-6 text-[#0a0a0a]" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                className="text-xs text-[#888888] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
