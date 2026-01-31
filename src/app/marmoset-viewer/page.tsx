"use client";

import { useEffect, useRef, Suspense, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

function MarmosetViewerContent() {
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const isViewerReadyRef = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const file = searchParams.get('file');
  const autoStart = searchParams.get('autoStart') === 'true';

  // Resize handler - stable reference
  const handleResize = useCallback(() => {
    if (viewerRef.current && isViewerReadyRef.current) {
        // console.log("[Marmoset] Resizing viewer");
        viewerRef.current.resize(window.innerWidth, window.innerHeight);
    }
  }, []);

  // Effect to attach/detach resize listener
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Effect to initialize viewer
  useEffect(() => {
    if (!scriptLoaded || !file) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
        if (!containerRef.current) return;

        // Check if marmoset is globally available
        const marmoset = (window as any).marmoset;
        if (!marmoset) {
            console.error("[Marmoset] 'marmoset' global object not found!");
            return;
        }

        // Cleanup existing viewer if any
        if (viewerRef.current) {
            // console.log("[Marmoset] Cleaning up existing viewer");
            if (viewerRef.current.domRoot && containerRef.current.contains(viewerRef.current.domRoot)) {
                containerRef.current.removeChild(viewerRef.current.domRoot);
            }
            viewerRef.current = null;
            isViewerReadyRef.current = false;
        }

        const width = window.innerWidth;
        const height = window.innerHeight;

        if (width === 0 || height === 0) {
            console.warn("[Marmoset] Window dimensions are 0, skipping init");
            return;
        }

        try {
            console.log("[Marmoset] Initializing WebViewer with file:", file);
            
            // Create viewer
            const viewer = new marmoset.WebViewer(width, height, file);
            
            viewer.domRoot.style.display = 'block'; // Ensure visibility
            
            viewerRef.current = viewer;
            containerRef.current.appendChild(viewer.domRoot);

            viewer.onLoad = () => {
              console.log("[Marmoset] Scene loaded successfully");
              isViewerReadyRef.current = true; // Mark as ready for resize events
              
              if (autoStart) {
                viewer.loadScene();
              }
            };
            
            viewer.onError = (err: any) => {
                console.error("[Marmoset] Viewer error:", err);
            };

        } catch (e) {
            console.error("[Marmoset] Initialization exception:", e);
        }
    }, 100);

    return () => {
        clearTimeout(timer);
        if (viewerRef.current) {
             // We don't necessarily destroy the viewer object as the library doesn't have a clear destroy method documented here,
             // but we remove it from DOM and null the ref.
             if (viewerRef.current.domRoot && containerRef.current?.contains(viewerRef.current.domRoot)) {
                containerRef.current.removeChild(viewerRef.current.domRoot);
             }
             viewerRef.current = null;
             isViewerReadyRef.current = false;
        }
    };
  }, [scriptLoaded, file, autoStart]);

  return (
    <>
      <Script 
        src={`${basePath}/marmoset/marmoset.js`} 
        strategy="afterInteractive"
        onLoad={() => {
            console.log("[Marmoset] Script loaded via onLoad");
            setScriptLoaded(true);
        }}
        onError={(e) => {
            console.error("[Marmoset] Script failed to load", e);
        }}
      />
      <div 
        id="marmoset-viewer" 
        ref={containerRef} 
        style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: 'transparent' }} 
      />
    </>
  );
}

export default function MarmosetViewerPage() {
  return (
    <Suspense fallback={null}>
      <MarmosetViewerContent />
    </Suspense>
  );
}
