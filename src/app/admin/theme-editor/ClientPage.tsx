"use client";

import React, { useEffect, useState } from "react";
import { ThemePreview } from "@/components/admin/ThemePreview";
import { ColorPicker } from "@/components/admin/ui/ColorPicker";
import { Slider } from "@/components/admin/ui/Slider";
import { Flex, Button, Text, Heading, Grid, Select } from "@once-ui-system/core";

import { KeystaticLayout } from "@/components/admin/KeystaticLayout";

export default function ThemeEditorPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/design")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/design", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      alert("Settings saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateBackground = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      background: {
        discriminant: value, // Ensure discriminant is set correctly
        value: {} // Reset value when type changes to avoid type mismatch
      },
    }));
  };
  
  const updateBackgroundValue = (key: string, value: any) => {
      setSettings((prev: any) => ({
      ...prev,
      background: {
        ...prev.background,
        value: {
            ...prev.background.value,
            [key]: value
        }
      },
    }));
  }

  const updateMusic = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      backgroundMusic: {
        ...prev.backgroundMusic,
        [key]: value,
      },
    }));
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!settings) return <div style={{ padding: 20 }}>Error loading settings</div>;

  // Helper to safely get the current background type
  const getBackgroundType = () => {
      if (settings.background && typeof settings.background === 'object' && 'discriminant' in settings.background) {
          return settings.background.discriminant;
      }
      return settings.backgroundEffect || 'none'; // Fallback to old format
  };

  const backgroundType = getBackgroundType();

  return (
    <KeystaticLayout>
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--neutral-background)" }}>
      {/* Header */}
      <header style={{ 
          padding: "16px 24px", 
          borderBottom: "1px solid var(--neutral-border-medium)", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          background: "var(--neutral-background-strong)"
      }}>
        <Heading as="h1" variant="display-default-s">Theme Editor</Heading>
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" href="/keystatic">Back to CMS</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", overflow: "auto" }}>
        {/* Sidebar Settings */}
        <aside style={{ 
            width: "350px", 
            overflowY: "auto", 
            borderRight: "1px solid var(--neutral-border-medium)", 
            padding: "24px",
            background: "var(--neutral-background)"
        }}>
          <Flex direction="column" gap="l">
            
            {/* Global Theme */}
            <section>
                <Heading as="h3" variant="display-default-m" marginBottom="m">Global Theme</Heading>
                
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>Base Theme</label>
                    <select 
                        value={settings.theme} 
                        onChange={e => updateSetting('theme', e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--neutral-border-medium)' }}
                    >
                        <option value="system">System</option>
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                    </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>Brand Color</label>
                    <select 
                        value={settings.brand} 
                        onChange={e => updateSetting('brand', e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--neutral-border-medium)' }}
                    >
                        <option value="cyan">Cyan</option>
                        <option value="blue">Blue</option>
                        <option value="indigo">Indigo</option>
                        <option value="violet">Violet</option>
                        <option value="magenta">Magenta</option>
                        <option value="pink">Pink</option>
                        <option value="red">Red</option>
                        <option value="orange">Orange</option>
                        <option value="yellow">Yellow</option>
                        <option value="moss">Moss</option>
                        <option value="green">Green</option>
                        <option value="emerald">Emerald</option>
                        <option value="aqua">Aqua</option>
                    </select>
                </div>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid var(--neutral-border-weak)', margin: '0' }} />

            {/* Background Effect */}
            <section>
                <Heading as="h3" variant="display-default-m" marginBottom="m">Background Effect</Heading>
                
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>Type</label>
                    <select 
                        value={backgroundType} 
                        onChange={e => updateBackground('discriminant', e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--neutral-border-medium)' }}
                    >
                        <option value="none">None</option>
                        <option value="aurora">Aurora</option>
                        <option value="particles">Particles (Dots)</option>
                        <option value="grid">Grid (Simple)</option>
                        <option value="constellation">Constellation</option>
                        <option value="interactive-grid">Interactive Grid</option>
                        <option value="vortex">Vortex</option>
                        <option value="topography">Topography</option>
                        <option value="wave-grid">Wave Grid (3D)</option>
                        <option value="beams">Beams</option>
                        <option value="snow">Snow</option>
                    </select>
                </div>

                {/* Dynamic fields based on background type */}
                {['constellation', 'interactive-grid', 'topography', 'wave-grid', 'beams'].includes(backgroundType) && (
                    <ColorPicker 
                        label="Effect Color" 
                        value={settings.background?.value?.color || 'rgba(255,255,255,0.5)'} 
                        onChange={(val) => updateBackgroundValue('color', val)} 
                    />
                )}
                
                {backgroundType === 'vortex' && (
                     <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>Particle Count</label>
                        <input 
                            type="number" 
                            value={settings.background?.value?.particleCount || 400} 
                            onChange={e => updateBackgroundValue('particleCount', parseInt(e.target.value))}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--neutral-border-medium)' }}
                        />
                    </div>
                )}

                {backgroundType === 'snow' && (
                     <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>Density</label>
                        <input 
                            type="number" 
                            value={settings.background?.value?.density || 150} 
                            onChange={e => updateBackgroundValue('density', parseInt(e.target.value))}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--neutral-border-medium)' }}
                        />
                    </div>
                )}

            </section>

            <hr style={{ border: 'none', borderTop: '1px solid var(--neutral-border-weak)', margin: '0' }} />

            {/* Background Music */}
            <section>
                <Heading as="h3" variant="display-default-m" marginBottom="m">Background Music</Heading>
                
                <Slider 
                    label="Volume" 
                    value={settings.backgroundMusic?.volume || 0.3} 
                    onChange={(val) => updateMusic('volume', val)}
                    max={1}
                    step={0.05}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 16 }}>
                    <input 
                        type="checkbox" 
                        id="autoplay"
                        checked={settings.backgroundMusic?.autoplay || false}
                        onChange={e => updateMusic('autoplay', e.target.checked)}
                    />
                    <label htmlFor="autoplay" style={{ fontSize: '14px' }}>Autoplay</label>
                </div>
                
                <div style={{ fontSize: '12px', opacity: 0.7 }}>
                    To change the music file, please use the Keystatic Media Manager.
                </div>
            </section>

          </Flex>
        </aside>

        {/* Preview Area */}
        <main style={{ flex: 1, padding: "40px", background: "var(--neutral-background-weak)", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '100%', maxWidth: '1200px', maxHeight: '800px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
                <ThemePreview settings={settings} />
            </div>
        </main>
      </div>
    </div>
    </KeystaticLayout>
  );
}

