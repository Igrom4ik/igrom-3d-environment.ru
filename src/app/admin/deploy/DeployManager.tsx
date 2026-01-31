'use client';

import React, { useState, useEffect } from 'react';
import { getGitStatus, deployToGit, triggerVercelDeploy } from './actions';
import { GitBranch, Globe, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import styles from '../portfolio/portfolio.module.css';

export default function DeployManager() {
  const [status, setStatus] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [gitLoading, setGitLoading] = useState(false);
  const [vercelLoading, setVercelLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchStatus = async () => {
    const res = await getGitStatus();
    if (res.success) {
      setStatus(res.status || 'Clean working directory');
    } else {
      setStatus('Error fetching status: ' + res.error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleGitDeploy = async () => {
    if (!message) return;
    setGitLoading(true);
    setResult(null);
    try {
      const res = await deployToGit(message);
      setResult({ success: res.success, message: res.success ? res.message : res.error });
      if (res.success) {
        setMessage('');
        fetchStatus();
      }
    } catch (e) {
      setResult({ success: false, message: 'Unexpected error occurred' });
    } finally {
      setGitLoading(false);
    }
  };

  const handleVercelDeploy = async () => {
    setVercelLoading(true);
    setResult(null);
    try {
      const res = await triggerVercelDeploy();
      setResult({ success: res.success, message: res.success ? res.message : res.error });
    } catch (e) {
      setResult({ success: false, message: 'Unexpected error occurred' });
    } finally {
      setVercelLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px', color: '#fff' }}>Deploy Manager</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        {/* Git Section */}
        <div style={{ 
          background: 'rgba(5, 8, 20, 0.6)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '24px', 
          padding: '32px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: 'rgba(240, 80, 51, 0.1)', borderRadius: '12px', color: '#f05033' }}>
              <GitBranch size={24} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', margin: 0 }}>Git Repository</h2>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#9a9cab', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Status</span>
              <button onClick={fetchStatus} style={{ background: 'none', border: 'none', color: '#1e90ff', cursor: 'pointer' }}>
                <RefreshCw size={16} />
              </button>
            </div>
            <div style={{ 
              background: '#0d1117', 
              padding: '16px', 
              borderRadius: '12px', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#c9d1d9',
              minHeight: '100px',
              maxHeight: '200px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {status}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <textarea
              placeholder="Commit message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '15px',
                minHeight: '100px',
                resize: 'vertical',
                outline: 'none'
              }}
            />
            <button
              onClick={handleGitDeploy}
              disabled={gitLoading || !message}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                background: gitLoading || !message ? 'rgba(255, 255, 255, 0.05)' : '#1e90ff',
                color: gitLoading || !message ? '#555' : '#fff',
                border: 'none',
                fontSize: '16px',
                fontWeight: 600,
                cursor: gitLoading || !message ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              {gitLoading ? <Loader2 size={20} className="spin" /> : <GitBranch size={20} />}
              {gitLoading ? 'Pushing...' : 'Commit & Push'}
            </button>
          </div>
        </div>

        {/* Vercel Section */}
        <div style={{ 
          background: 'rgba(5, 8, 20, 0.6)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '24px', 
          padding: '32px',
          height: 'fit-content'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff' }}>
              <Globe size={24} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', margin: 0 }}>Vercel Deploy</h2>
          </div>

          <p style={{ color: '#9a9cab', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
            Trigger a manual deployment on Vercel. This uses the configured Deploy Hook to rebuild your site from the latest Git commit.
          </p>

          <button
            onClick={handleVercelDeploy}
            disabled={vercelLoading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              background: vercelLoading ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              color: vercelLoading ? '#555' : '#000',
              border: 'none',
              fontSize: '16px',
              fontWeight: 600,
              cursor: vercelLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
          >
            {vercelLoading ? <Loader2 size={20} className="spin" /> : <Upload size={20} />}
            {vercelLoading ? 'Triggering...' : 'Trigger Deployment'}
          </button>
        </div>
      </div>

      {result && (
        <div style={{
          marginTop: '32px',
          padding: '16px',
          borderRadius: '12px',
          background: result.success ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
          border: `1px solid ${result.success ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)'}`,
          color: result.success ? '#2ecc71' : '#e74c3c',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '600px'
        }}>
          {result.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{result.message}</span>
        </div>
      )}
      
      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
