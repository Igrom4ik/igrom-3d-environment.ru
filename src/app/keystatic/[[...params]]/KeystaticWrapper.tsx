"use client";

import KeystaticPage from "./KeystaticPage";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function KeystaticWrapper() {
  const pathname = usePathname();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check if we are editing a singleton that has a preview
    // Path pattern: /keystatic/branch/[branch]/singleton/[name] or /keystatic/singleton/[name]
    // Since we are in local mode usually, it's /keystatic/singleton/...
    
    // We match specific singletons we know have previews
    if (pathname?.includes('/singleton/home')) {
      setPreviewUrl('/preview?type=home');
    } else if (pathname?.includes('/singleton/work')) {
      setPreviewUrl('/preview?type=work');
    } else if (pathname?.includes('/singleton/blog')) {
      setPreviewUrl('/preview?type=blog');
    } else {
      setPreviewUrl(null);
    }
  }, [pathname]);

  if (previewUrl) {
     return (
       <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
         <div style={{ flex: '1', overflow: 'hidden', borderRight: '1px solid #2e2e33', position: 'relative' }}>
           {/* Keystatic Container */}
           <KeystaticPage />
         </div>
         <div style={{ width: '50%', height: '100%', backgroundColor: '#000' }}>
           <iframe 
             src={previewUrl} 
             style={{ width: '100%', height: '100%', border: 'none' }} 
             title="Live Preview"
           />
         </div>
       </div>
     );
  }

  return <KeystaticPage />;
}
