"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { Flex, Text, ToggleButton, Column } from "@once-ui-system/core";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
  }
}

interface GoogleTranslateWindow extends Window {
  google?: {
    translate?: {
      TranslateElement: {
        new (
          options: {
            pageLanguage: string;
            includedLanguages: string;
            layout: unknown;
            autoDisplay: boolean;
          },
          elementId: string
        ): unknown;
        InlineLayout: {
          SIMPLE: unknown;
        };
      };
    };
  };
}

const languages = [
  { code: 'en', label: 'English', labelShort: 'EN' },
  { code: 'ru', label: 'Русский', labelShort: 'RU' },
  { code: 'zh-CN', label: '中文', labelShort: 'ZH' },
];

export const GoogleTranslate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('ru');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Initialize Google Translate
    if (!initializedRef.current) {
      window.googleTranslateElementInit = () => {
        const g = (window as unknown as GoogleTranslateWindow).google;
        if (!g?.translate?.TranslateElement) return;
        new g.translate.TranslateElement(
          {
            pageLanguage: "ru",
            includedLanguages: "en,ru,zh-CN",
            layout: g.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      };
      initializedRef.current = true;
    }

    // Check current language from cookie
    const checkCookie = () => {
        const cookies = document.cookie.split(';');
        const googtrans = cookies.find(c => c.trim().startsWith('googtrans='));
        if (googtrans) {
            const val = googtrans.split('=')[1];
            // Value is usually /auto/en or /en/ru
            const lang = val.split('/').pop();
            if (lang && languages.some(l => l.code === lang)) {
                setCurrentLang(lang);
            }
        } else {
             // If no cookie, default to RU
             setCurrentLang('ru');
        }
    };
    
    checkCookie();
    
    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    // Set cookies for Google Translate
    // We need to set it for root path and potentially domain
    const domain = window.location.hostname;
    
    // Clear existing cookies to be safe
    document.cookie = `googtrans=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

    // Set new cookie
    // The format Google Translate expects is /sourceLang/targetLang or /auto/targetLang
    // Since pageLanguage is 'ru', we use /ru/targetLang
    const sourceLang = 'ru';
    document.cookie = `googtrans=/${sourceLang}/${langCode}; path=/; domain=${domain}`;
    document.cookie = `googtrans=/${sourceLang}/${langCode}; path=/;`; // For localhost fallback
    
    // Also save to localStorage for LanguageContext
    localStorage.setItem('locale', langCode);

    setCurrentLang(langCode);
    setIsOpen(false);
    
    // Reload page to apply translation
    window.location.reload();
  };

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }} />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      
      <Flex position="relative" ref={dropdownRef} vertical="center">
        <ToggleButton 
            prefixIcon="globe" 
            selected={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            label={languages.find(l => l.code === currentLang)?.labelShort || "EN"}
        />
        
        {isOpen && (
            <Column
                position="absolute"
                zIndex={10}
                padding="4"
                background="page"
                border="neutral-alpha-medium"
                radius="m"
                shadow="l"
                gap="4"
                style={{ marginTop: '8px', minWidth: '140px', top: '100%', right: 0 }}
            >
                {languages.map((lang) => (
                    <Flex
                        key={lang.code}
                        padding="8"
                        radius="s"
                        vertical="center"
                        style={{ 
                            cursor: 'pointer',
                            backgroundColor: currentLang === lang.code ? 'var(--neutral-alpha-weak)' : 'transparent',
                            transition: 'background-color 0.2s'
                        }}
                        onClick={() => handleLanguageChange(lang.code)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--neutral-alpha-medium)';
                        }}
                        onMouseLeave={(e) => {
                             if (currentLang !== lang.code) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                             } else {
                                e.currentTarget.style.backgroundColor = 'var(--neutral-alpha-weak)';
                             }
                        }}
                    >
                        <Text variant="body-default-s" onBackground="neutral-strong">
                            {lang.label}
                        </Text>
                    </Flex>
                ))}
            </Column>
        )}
      </Flex>
    </>
  );
};
