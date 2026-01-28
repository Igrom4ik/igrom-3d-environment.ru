"use client";

import KeystaticPage from "./KeystaticPage";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TelegramPublishButton } from "@/components/blog/TelegramPublishButton";
import { getTelegramSettings } from "@/utils/reader";
import { BlogListActions } from "./BlogListActions";

export default function KeystaticWrapper() {
  const pathname = usePathname();
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPostSlug, setCurrentPostSlug] = useState<string | null>(null);
  const [telegramChatId, setTelegramChatId] = useState<string>('');
  const [isCollectionList, setIsCollectionList] = useState(false);

  useEffect(() => {
    // Redirect "Portfolio (Albums)" list view to custom Admin Dashboard
    if (pathname?.includes('/collection/albums') && !pathname?.includes('/item/') && !pathname?.includes('/create')) {
        router.replace('/admin/portfolio');
    }
  }, [pathname, router]);

  useEffect(() => {
    // Fetch Telegram settings on mount
    fetch('/api/keystatic/telegram-settings') // We need an API for this since it's client-side
        .then(res => res.json())
        .then(data => {
            if (data.chatId) setTelegramChatId(data.chatId);
        })
        .catch(() => {});
  }, []);

  useEffect(() => {
    setIsCollectionList(pathname?.includes('/collection/posts') && !pathname?.includes('/item/') || false);

    // Check if we are editing a singleton that has a preview
    // Path pattern: /keystatic/branch/[branch]/singleton/[name] or /keystatic/singleton/[name]
    // Since we are in local mode usually, it's /keystatic/singleton/...
    
    // We match specific singletons we know have previews
    if (pathname?.includes('/singleton/home')) {
      setPreviewUrl('/preview/home');
    } else if (pathname?.includes('/singleton/gallery')) {
      setPreviewUrl('/preview/gallery');
    } else if (pathname?.includes('/collection/posts/item/')) {
      const match = pathname.match(/\/collection\/posts\/item\/([^/]+)/);
      if (match && match[1]) {
        setPreviewUrl(`/preview/post/${match[1]}`);
        setCurrentPostSlug(match[1]);
      } else {
        setPreviewUrl(null);
        setCurrentPostSlug(null);
      }
    } else {
      setPreviewUrl(null);
      setCurrentPostSlug(null);
    }
  }, [pathname]);

  if (previewUrl) {
     return (
       <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
         <div style={{ flex: '1', minWidth: '0', borderRight: '1px solid #2e2e33', position: 'relative', transform: 'translate3d(0,0,0)', overflowY: 'auto', height: '100%' }}>
           {/* Keystatic Container */}
           <KeystaticPage />
           {currentPostSlug && (
             <div style={{ position: 'absolute', bottom: '24px', left: '24px', zIndex: 100 }}>
                <TelegramPublishButton 
                    chatId={telegramChatId} 
                    slug={currentPostSlug} 
                    compact={true}
                />
             </div>
           )}
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

  return (
    <>
        <KeystaticPage />
        {isCollectionList && telegramChatId && (
            <BlogListActions chatId={telegramChatId} />
        )}
    </>
  );
}
