"use client";

import React, { useState } from 'react';
import styles from '../secrets/secrets.module.css'; // Reusing secrets styles
import { Save, Globe, Image as ImageIcon, Link as LinkIcon, Type } from 'lucide-react';

interface SiteSettings {
  ogTitle: string;
  ogSiteName: string;
  ogDescription: string;
  ogType: string;
  ogUrl: string;
  ogImage: string;
}

interface SeoManagerProps {
  initialSettings: SiteSettings;
}

export default function SeoManager({ initialSettings }: SeoManagerProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleChange = (key: keyof SiteSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');

    try {
      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const renderField = (key: keyof SiteSettings, label: string, icon?: React.ReactNode, placeholder?: string) => {
    return (
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {icon}
          {label}
        </label>
        <div className={styles.inputWrapper}>
          <input
            id={key}
            type="text"
            className={styles.input}
            value={settings[key] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>SEO & Open Graph Settings</h1>
        <p className={styles.subtitle}>
          Configure how your site appears when shared on social media (Telegram, Facebook, etc.).
        </p>
      </div>

      {status === 'success' && (
        <div className={`${styles.message} ${styles.success}`}>
          Settings saved successfully! Re-deploy the site to apply changes.
        </div>
      )}

      {status === 'error' && (
        <div className={`${styles.message} ${styles.error}`}>
          Failed to save settings. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Globe size={18} />
            Open Graph Meta Tags
          </div>
          
          {renderField('ogTitle', 'Title (og:title)', <Type size={14} />)}
          {renderField('ogDescription', 'Description (og:description)', <Type size={14} />)}
          {renderField('ogSiteName', 'Site Name (og:site_name)', <Globe size={14} />)}
          {renderField('ogUrl', 'URL (og:url)', <LinkIcon size={14} />)}
          {renderField('ogType', 'Type (og:type)', <Type size={14} />, 'website')}
          {renderField('ogImage', 'Image URL (og:image)', <ImageIcon size={14} />)}
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.saveButton} disabled={status === 'saving'}>
            <Save size={16} />
            {status === 'saving' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
