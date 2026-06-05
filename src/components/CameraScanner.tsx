'use client';

import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface CameraScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
  active: boolean;
}

export default function CameraScanner({ onScanSuccess, onScanError, active }: CameraScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!active) return;

    let isStopped = false;

    // Use a short delay to guarantee React has updated the DOM and mounted the #qr-reader element
    const timer = setTimeout(() => {
      const el = document.getElementById('qr-reader');
      if (!el || isStopped) return;

      try {
        // Stop any existing scanner just in case
        if (scannerRef.current) {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
          scannerRef.current = null;
        }

        const html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 220, height: 220 } };

        html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText: string) => {
            if (!isStopped) {
              onScanSuccess(decodedText);
            }
          },
          (errorMessage: string) => {
            if (onScanError && !isStopped) {
              onScanError(errorMessage);
            }
          }
        ).catch((err: any) => {
          console.error('Camera start error', err);
        });
      } catch (err) {
        console.error('Scanner init error', err);
      }
    }, 150);

    return () => {
      isStopped = true;
      clearTimeout(timer);
      
      const currentScanner = scannerRef.current;
      if (currentScanner) {
        if (currentScanner.isScanning) {
          currentScanner.stop().then(() => {
            scannerRef.current = null;
          }).catch((err: any) => console.error('Failed to clean scanner in stop', err));
        } else {
          scannerRef.current = null;
        }
      }
    };
  }, [active, onScanSuccess, onScanError]);

  return (
    <div className={`mb-4 border-2 border-emerald-500 rounded overflow-hidden bg-black relative ${active ? '' : 'hidden'}`}>
      <div id="qr-reader" className="w-full h-[260px]"></div>
      <div className="p-2 text-center text-[10px] text-zinc-450 bg-zinc-950 border-t border-zinc-900 font-medium font-mono">
        Hold a visitor QR pass card in front of your camera.
      </div>
    </div>
  );
}
