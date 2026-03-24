"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, SwitchCamera, Zap, ZapOff, Volume2 } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  active: boolean;
}

// Web Audio beep on successful scan
function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 1200;
    oscillator.type = "sine";
    gain.gain.value = 0.3;
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.15);
  } catch {
    // Audio not available
  }
}

export default function BarcodeScanner({ onScan, active }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<unknown>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = useCallback(
    (decodedText: string) => {
      playBeep();
      onScan(decodedText);
    },
    [onScan]
  );

  useEffect(() => {
    if (!active || !scannerRef.current) return;

    let scanner: { start: Function; stop: Function; clear: Function; applyVideoConstraints: Function } | null = null;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const scannerId = "barcode-scanner-region";

        // Ensure the container exists
        if (!scannerRef.current) return;
        scannerRef.current.id = scannerId;

        scanner = new Html5Qrcode(scannerId) as unknown as typeof scanner;
        html5QrRef.current = scanner;

        await scanner!.start(
          { facingMode },
          {
            fps: 10,
            qrbox: { width: 280, height: 280 },
            aspectRatio: 1,
          },
          (decodedText: string) => {
            handleScan(decodedText);
          },
          () => {
            // scan failure (no QR found in frame) — ignore
          }
        );
        setScanning(true);
        setError(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setScanning(false);
      }
    }

    startScanner();

    return () => {
      if (scanner) {
        scanner.stop().catch(() => {});
        scanner.clear();
      }
      setScanning(false);
    };
  }, [active, facingMode, handleScan]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="space-y-4">
      {/* Camera viewfinder */}
      <div className="relative bg-black rounded-2xl overflow-hidden" style={{ minHeight: 320 }}>
        <div ref={scannerRef} className="w-full" />

        {!scanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-zinc-400">
              <Camera className="h-10 w-10 mx-auto mb-2 animate-pulse" />
              <p className="text-sm">Starting camera...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center p-6">
              <Camera className="h-10 w-10 mx-auto mb-2 text-red-400" />
              <p className="text-red-400 text-sm mb-2">Camera Error</p>
              <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Scan overlay */}
        {scanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-72 h-72 border-2 border-green-400/50 rounded-xl">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-400 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-400 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-400 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-400 rounded-br-xl" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={toggleCamera}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <SwitchCamera className="h-4 w-4" />
          {facingMode === "environment" ? "Front" : "Rear"} Camera
        </button>
        <button
          onClick={() => setTorchOn(!torchOn)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
        >
          {torchOn ? <ZapOff className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
          Flash
        </button>
        <div className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-500">
          <Volume2 className="h-4 w-4" /> Sound on scan
        </div>
      </div>
    </div>
  );
}
