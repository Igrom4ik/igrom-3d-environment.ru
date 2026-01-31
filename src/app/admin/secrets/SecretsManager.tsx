"use client";

import React, { useState } from 'react';
import styles from './secrets.module.css';
import { Save, Eye, EyeOff, Lock, Mail, Send, AlertTriangle } from 'lucide-react';

interface Secrets {
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SECRET_2FA?: string;
  [key: string]: string | undefined;
}

interface SecretsManagerProps {
  initialSecrets: Secrets;
}

export default function SecretsManager({ initialSecrets }: SecretsManagerProps) {
  const [secrets, setSecrets] = useState<Secrets>(initialSecrets);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});

  const handleChange = (key: string, value: string) => {
    setSecrets(prev => ({ ...prev, [key]: value }));
    setStatus('idle');
  };

  const toggleVisibility = (key: string) => {
    setVisibleFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');

    try {
      const res = await fetch('/api/admin/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(secrets)
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

  const renderField = (key: string, label: string, type: 'text' | 'password' = 'text', placeholder?: string) => {
    const isVisible = visibleFields[key] || type === 'text';
    
    return (
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor={key}>{label}</label>
        <div className={styles.inputWrapper}>
          <input
            id={key}
            type={isVisible ? 'text' : 'password'}
            className={styles.input}
            value={secrets[key] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
          />
          {type === 'password' && (
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => toggleVisibility(key)}
              title={isVisible ? "Hide" : "Show"}
            >
              {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Secrets Management</h1>
        <p className={styles.subtitle}>
          Configure sensitive data and API keys securely. These values are stored on the server.
        </p>
      </div>

      <div className={styles.warning}>
        <AlertTriangle size={20} />
        <div>
          <strong>Security Notice:</strong>
          <p style={{ margin: 0, marginTop: 4, opacity: 0.8 }}>
            These values are stored in a local <code>secrets.json</code> file on the server.
            They are NOT committed to Git. Ensure this file is backed up securely if needed.
          </p>
        </div>
      </div>

      {status === 'success' && (
        <div className={`${styles.message} ${styles.success}`}>
          Settings saved successfully!
        </div>
      )}

      {status === 'error' && (
        <div className={`${styles.message} ${styles.error}`}>
          Failed to save settings. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Email Settings */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Mail size={18} />
            Email / SMTP Configuration
          </div>
          {renderField('SMTP_HOST', 'SMTP Host', 'text', 'smtp.beget.com')}
          {renderField('SMTP_PORT', 'SMTP Port', 'text', '465')}
          {renderField('SMTP_USER', 'SMTP User', 'text', 'contact@igrom-3d-environment.ru')}
          {renderField('SMTP_PASS', 'SMTP Password', 'password')}
        </div>

        {/* Telegram Settings */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Send size={18} />
            Telegram Integration
          </div>
          {renderField('TELEGRAM_BOT_TOKEN', 'Bot Token', 'password')}
          {renderField('TELEGRAM_CHAT_ID', 'Chat ID', 'text')}
        </div>

        {/* Admin Access */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Lock size={18} />
            Admin Access
          </div>
          {renderField('ADMIN_PASSWORD', 'Admin Password', 'password')}
          {renderField('ADMIN_SECRET_2FA', '2FA Secret', 'password')}
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
