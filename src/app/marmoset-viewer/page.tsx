"use client";

import { useEffect, useRef, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

function MarmosetViewerContent() {
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const file = searchParams.get('file');
  const autoStart = searchParams.get('autoStart') === 'true';

  // Check if marmoset is already on window
  useEffect(() => {
    const checkMarmoset = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).marmoset) {
            setScriptLoaded(true);
            clearInterval(checkMarmoset);
        }
    }, 100);
    return () => clearInterval(checkMarmoset);
  }, []);

  useEffect(() => {
    // Add a small delay to ensure DOM is ready and script is fully processed
    const timer = setTimeout(() => {
        if (!file || !containerRef.current || viewerRef.current) return;

        const marmoset = (window as any).marmoset;
        if (!marmoset) {
            console.warn("Marmoset object not found on window, waiting...");
            // If scriptLoaded is true but marmoset is missing, we might need to retry
            return;
        }
        
        // Ensure noExisting viewer
        if (containerRef.current.innerHTML !== '') {
            containerRef.current.innerHTML = '';
        }

        try {
            console.log("Initializing Marmoset Viewer with file:", file);
            const viewer = new marmoset.WebViewer(
              window.innerWidth,
              window.innerHeight,
              file
            );
            
            // Fix: ensure viewer is visible
            viewer.domRoot.style.display = 'block';
            viewer.domRoot.style.width = '100%';
            viewer.domRoot.style.height = '100%';

            viewerRef.current = viewer;
            containerRef.current.appendChild(viewer.domRoot);

            viewer.onLoad = () => {
              console.log("Marmoset scene loaded");
              if (autoStart) {
                viewer.loadScene();
              }
            };

            const handleResize = () => {
              if (viewerRef.current) {
                  viewerRef.current.resize(window.innerWidth, window.innerHeight);
              }
            };

            window.addEventListener('resize', handleResize);
            
            // Clean up function is handled by useEffect return
        } catch (e) {
            console.error("Marmoset initialization failed:", e);
        }
    }, 100);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', () => {}); // Placeholder cleanup
        if (viewerRef.current && viewerRef.current.domRoot && containerRef.current) {
             // Check if node is still a child before removing
             if (containerRef.current.contains(viewerRef.current.domRoot)) {
                containerRef.current.removeChild(viewerRef.current.domRoot);
             }
        }
        viewerRef.current = null;
    };
  }, [scriptLoaded, file, autoStart]);

  return (
    <>
      <Script 
        src={`${basePath}/marmoset/marmoset.js`} 
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div id="marmoset-viewer" ref={containerRef} style={{ width: '100vw', height: '100vh' }} />
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
