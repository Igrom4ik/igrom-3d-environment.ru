"use client";

import KeystaticPage from "./KeystaticPage";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TelegramPublishButton } from "@/components/blog/TelegramPublishButton";
import { BlogListActions } from "./BlogListActions";
import ThemeEditorPage from "@/app/admin/theme-editor/page";
import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { TelegramPostsList } from "@/components/admin/TelegramPostsList";
import { KeystaticLayout } from "@/components/admin/KeystaticLayout"; // Import Layout
import "../keystatic-overrides.css"; // Import CSS overrides

export default function KeystaticWrapper() {
  const pathname = usePathname();
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPostSlug, setCurrentPostSlug] = useState<string | null>(null);
  const [telegramChatId, setTelegramChatId] = useState<string>('');
  const [currentCollection, setCurrentCollection] = useState<'posts' | 'telegramPosts'>('posts');
  const [isCollectionList, setIsCollectionList] = useState(false);

  // Determine if we are on a custom page
  const isThemeEditor = pathname?.includes('/singleton/design');
  const isSettingsEditor = pathname?.includes('/singleton/settings');
  const isTelegramList = pathname?.includes('/collection/telegramPosts') && !pathname?.includes('/item/') && !pathname?.includes('/create');

  useEffect(() => {
    // Redirect "Portfolio (Albums)" list view to custom Admin Dashboard
    if (pathname?.includes('/collection/albums') && !pathname?.includes('/item/') && !pathname?.includes('/create')) {
        router.replace('/admin/portfolio');
    }
    // Redirect "Posts" list view to custom Admin Blog Dashboard
    if (pathname?.includes('/collection/posts') && !pathname?.includes('/item/') && !pathname?.includes('/create')) {
        router.replace('/admin/blog');
    }
    if (pathname?.includes('/singleton/about')) {
        router.replace('/admin/about');
    }
  }, [pathname, router]);

  useEffect(() => {
    // Fetch Telegram settings on mount
    fetch('/api/keystatic/telegram-settings')
        .then(res => res.json())
        .then(data => {
            if (data.chatId) setTelegramChatId(data.chatId);
        })
        .catch(() => {});
  }, []);

  useEffect(() => {
    setIsCollectionList(pathname?.includes('/collection/posts') && !pathname?.includes('/item/') || false);

    if (pathname?.includes('/singleton/home')) {
      setPreviewUrl('/preview/home');
    } else if (pathname?.includes('/singleton/gallery')) {
      setPreviewUrl('/preview/gallery');
    } else if (pathname?.includes('/collection/posts/item/')) {
      const match = pathname.match(/\/collection\/posts\/item\/([^/]+)/);
      if (match && match[1]) {
        setPreviewUrl(`/preview/post/${match[1]}`);
        setCurrentPostSlug(match[1]);
        setCurrentCollection('posts');
      } else {
        setPreviewUrl(null);
        setCurrentPostSlug(null);
      }
    } else if (pathname?.includes('/collection/telegramPosts/item/')) {
      const match = pathname.match(/\/collection\/telegramPosts\/item\/([^/]+)/);
      if (match && match[1]) {
        setPreviewUrl(`/preview/telegram/post/${match[1]}`);
        setCurrentPostSlug(match[1]);
        setCurrentCollection('telegramPosts');
      } else {
        setPreviewUrl(null);
        setCurrentPostSlug(null);
      }
    } else {
      setPreviewUrl(null);
      setCurrentPostSlug(null);
    }
  }, [pathname]);

  // Render Custom Editors
  if (isThemeEditor) {
      return <ThemeEditorPage />;
  }

  if (isSettingsEditor) {
      return <SettingsEditor />;
  }

  if (isTelegramList) {
      return <TelegramPostsList />;
  }

  // Helper to render Keystatic Page wrapped in our Layout + Overrides
  const renderWrappedKeystatic = (content: React.ReactNode) => (
      <KeystaticLayout>
          <div className="keystatic-override-wrapper" style={{ height: '100%', overflowY: 'auto' }}>
            {content}
          </div>
      </KeystaticLayout>
  );

  if (previewUrl) {
     return (
       <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
         <div style={{ flex: '1', minWidth: '0', borderRight: '1px solid #2e2e33', position: 'relative', transform: 'translate3d(0,0,0)', overflowY: 'auto', height: '100%' }}>
           {/* Wrap Keystatic Editor with our Layout logic? 
               NO, for split view we usually want max space. 
               But user said "Unify styles". 
               If we use Split View, we probably want to keep it simple or wrap it too?
               For now, let's keep Split View as is, or wrap it if user insists.
               The user complained about "Dashboards" (lists, main page).
               Let's wrap the Editor part only if needed. 
               Actually, replacing the sidebar in split view is tricky because of space.
               Let's leave split view alone for now, as it overrides the whole layout.
           */}
           <KeystaticPage />
           {currentPostSlug && (
             <div style={{ position: 'absolute', bottom: '24px', left: '24px', zIndex: 100 }}>
                <TelegramPublishButton 
                    chatId={telegramChatId} 
                    slug={currentPostSlug} 
                    compact={true}
                    collection={currentCollection}
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

  // Default Case: Wrap Keystatic Main Pages (Dashboard, Lists, etc.)
  return renderWrappedKeystatic(
    <>
        <KeystaticPage />
        {isCollectionList && telegramChatId && (
            <BlogListActions chatId={telegramChatId} />
        )}
    </>
  );
}
