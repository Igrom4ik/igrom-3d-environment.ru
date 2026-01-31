"use client";

import React, { useState } from 'react';
import styles from './secrets.module.css';
import { Save, Eye, EyeOff, Lock, Mail, Send, AlertTriangle, QrCode, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

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

export default function SecretsManager() {
  const [secrets, setSecrets] = useState<Secrets>({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  
  // 2FA Setup State
  const [isSetup2FA, setIsSetup2FA] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [tempSecret, setTempSecret] = useState<string | null>(null);
  const [verifyToken, setVerifyToken] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  React.useEffect(() => {
    fetchSecrets();
  }, []);

  const fetchSecrets = async () => {
    try {
      const res = await fetch('/api/admin/secrets');
      if (res.ok) {
        const data = await res.json();
        setSecrets(data);
      }
    } catch (error) {
      console.error('Failed to load secrets', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSecrets(prev => ({ ...prev, [key]: value }));
  };

  const toggleVisibility = (key: string) => {
    setShowPassword(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    
    try {
      const res = await fetch('/api/admin/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(secrets),
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const handleStart2FASetup = async () => {
    setIsSetup2FA(true);
    setVerifyStatus('idle');
    setVerifyToken('');
    try {
      const res = await fetch('/api/admin/2fa/generate', { method: 'POST' });
      const data = await res.json();
      if (data.qrCode && data.secret) {
        setQrCode(data.qrCode);
        setTempSecret(data.secret);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate QR code');
    }
  };

  const handleVerify2FA = async () => {
    if (!tempSecret || !verifyToken) return;
    
    try {
      const res = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken, secret: tempSecret }),
      });
      const data = await res.json();
      
      if (data.valid) {
        setVerifyStatus('valid');
        // Automatically apply the verified secret
        setSecrets(prev => ({ ...prev, ADMIN_SECRET_2FA: tempSecret }));
        setTimeout(() => {
           setIsSetup2FA(false);
           setQrCode(null);
           setTempSecret(null);
           setVerifyToken('');
        }, 1500);
      } else {
        setVerifyStatus('invalid');
      }
    } catch (e) {
      console.error(e);
      setVerifyStatus('invalid');
    }
  };

  const renderField = (key: string, label: string, type: 'text' | 'password' = 'text', placeholder?: string) => {
    const isPass = type === 'password';
    const isVisible = showPassword[key];
    
    return (
      <div className={styles.field} key={key}>
        <label htmlFor={key}>{label}</label>
        <div className={styles.inputWrapper}>
          <input
            id={key}
            type={isPass && !isVisible ? 'password' : 'text'}
            value={secrets[key] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            className={styles.input}
          />
          {isPass && (
            <button 
              type="button" 
              className={styles.toggleBtn}
              onClick={() => toggleVisibility(key)}
            >
              {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading secrets...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Environment Secrets</h1>
      <p className={styles.subtitle}>
        Manage sensitive configuration like API keys and passwords. 
        These are stored in <code>secrets.json</code> (not committed to git).
      </p>

      {status === 'success' && (
        <div className={styles.alertSuccess}>
          Secrets saved successfully!
        </div>
      )}

      {status === 'error' && (
        <div className={styles.alertError}>
          <AlertTriangle size={18} />
          Failed to save secrets. Check console for details.
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Email Settings */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Mail size={18} />
            SMTP Settings (Email)
          </div>
          {renderField('SMTP_HOST', 'SMTP Host', 'text', 'smtp.example.com')}
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
          {renderField('ADMIN_EMAIL', 'Admin Email', 'text')}
          {renderField('ADMIN_PASSWORD', 'Admin Password', 'password')}
          
          <div className={styles.field}>
            <label htmlFor="ADMIN_SECRET_2FA">2FA Secret (TOTP)</label>
            <div className={styles.inputWrapper}>
              <input
                id="ADMIN_SECRET_2FA"
                type={showPassword['ADMIN_SECRET_2FA'] ? 'text' : 'password'}
                value={secrets['ADMIN_SECRET_2FA'] || ''}
                onChange={(e) => handleChange('ADMIN_SECRET_2FA', e.target.value)}
                className={styles.input}
              />
               <button 
                  type="button" 
                  className={styles.toggleBtn}
                  onClick={() => toggleVisibility('ADMIN_SECRET_2FA')}
                  style={{ right: '40px' }}
                >
                  {showPassword['ADMIN_SECRET_2FA'] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
               <button 
                  type="button" 
                  className={styles.actionBtn}
                  onClick={handleStart2FASetup}
                  title="Setup 2FA"
                  style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4caf50' }}
                >
                  <QrCode size={20} />
                </button>
            </div>
          </div>
          
          {isSetup2FA && (
            <div className={styles.setup2FA}>
              <h3>Setup Two-Factor Authentication</h3>
              <div className={styles.qrContainer}>
                {qrCode ? (
                   <Image src={qrCode} alt="2FA QR Code" width={200} height={200} />
                ) : (
                   <p>Generating QR Code...</p>
                )}
              </div>
              <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
              
              <div className={styles.verifyBox}>
                <input 
                  type="text" 
                  placeholder="Enter 6-digit code" 
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  className={styles.input}
                  style={{ maxWidth: '200px', textAlign: 'center', letterSpacing: '2px' }}
                />
                <button type="button" onClick={handleVerify2FA} className={styles.saveButton} style={{ width: 'auto' }}>
                  Verify
                </button>
              </div>

              {verifyStatus === 'valid' && <p style={{ color: '#4caf50', display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle size={16}/> Verified! Updating secret...</p>}
              {verifyStatus === 'invalid' && <p style={{ color: '#ff4444', display: 'flex', alignItems: 'center', gap: '5px' }}><XCircle size={16}/> Invalid code. Try again.</p>}
              
              <button type="button" onClick={() => setIsSetup2FA(false)} className={styles.closeBtn} style={{ marginTop: '10px', background: 'transparent', border: '1px solid #555', padding: '5px 10px', color: '#aaa', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          )}

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
