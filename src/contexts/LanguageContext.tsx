"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Locale = "en" | "ru";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface NestedMessages {
  [key: string]: string | NestedMessages;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [messages, setMessages] = useState<NestedMessages>({});

  useEffect(() => {
    // Load messages for current locale
    const loadMessages = async () => {
      try {
        const msgs = await import(`../../messages/${locale}.json`);
        setMessages(msgs.default);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };
    loadMessages();
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split(".");
    let value: string | NestedMessages = messages;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as NestedMessages)[k];
      } else {
        return key;
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    // Replace params like {name}
    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, paramKey) => params[paramKey] || "");
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
