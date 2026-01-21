"use client";

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function GoogleTranslate() {
  const { locale } = useLanguage();

  useEffect(() => {
    // Load Google Translate script
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    // Initialize Google Translate
    window.googleTranslateElementInit = function() {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,ru',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };
  }, []);

  useEffect(() => {
    // Trigger translation when locale changes
    const translateTo = locale === 'ru' ? 'ru' : 'en';

    setTimeout(() => {
      const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = translateTo;
        selectElement.dispatchEvent(new Event('change'));
      }
    }, 1000);
  }, [locale]);

  return (
    <div
      id="google_translate_element"
      style={{
        display: 'none',
        visibility: 'hidden',
        position: 'absolute',
        left: '-9999px'
      }}
    />
  );
}
