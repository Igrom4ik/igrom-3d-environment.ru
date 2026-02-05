"use client";

import React, { useEffect, useState } from "react";
import { Flex, Button, Heading, Text, Avatar } from "@once-ui-system/core";

import { KeystaticLayout } from "@/components/admin/KeystaticLayout";

export const SettingsEditor = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
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
      const res = await fetch("/api/admin/settings", {
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

  const updatePerson = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      person: {
        ...prev.person,
        [key]: value,
      },
    }));
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!settings) return <div style={{ padding: 20 }}>Error loading settings</div>;

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
        <Heading as="h1" variant="display-default-s">Global Settings</Heading>
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="primary" onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </header>

      <div style={{ flex: 1, padding: "40px", overflowY: "auto", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: "800px" }}>
            
            <section style={{ 
                background: "var(--neutral-background-weak)", 
                padding: "32px", 
                borderRadius: "16px",
                border: "1px solid var(--neutral-border-medium)"
            }}>
                <Heading as="h2" variant="display-default-m" marginBottom="l">Personal Information</Heading>
                
                <Flex direction="column" gap="l">
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                             <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 500 }}>Full Name</label>
                             <input 
                                type="text"
                                value={settings.person?.name || ''}
                                onChange={e => updatePerson('name', e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--neutral-border-medium)',
                                    background: 'var(--neutral-background)',
                                    color: 'var(--neutral-on-background-strong)'
                                }}
                             />
                        </div>
                        <div style={{ flex: 1 }}>
                             <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 500 }}>Role / Title</label>
                             <input 
                                type="text"
                                value={settings.person?.role || ''}
                                onChange={e => updatePerson('role', e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--neutral-border-medium)',
                                    background: 'var(--neutral-background)',
                                    color: 'var(--neutral-on-background-strong)'
                                }}
                             />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '24px' }}>
                        <div style={{ flex: 1 }}>
                             <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 500 }}>Location</label>
                             <input 
                                type="text"
                                value={settings.person?.location || ''}
                                onChange={e => updatePerson('location', e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--neutral-border-medium)',
                                    background: 'var(--neutral-background)',
                                    color: 'var(--neutral-on-background-strong)'
                                }}
                             />
                        </div>
                        <div style={{ flex: 1 }}>
                             <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 500 }}>Time Zone</label>
                             <input 
                                type="text"
                                value={settings.person?.timeZone || ''}
                                onChange={e => updatePerson('timeZone', e.target.value)}
                                placeholder="e.g. Europe/London"
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--neutral-border-medium)',
                                    background: 'var(--neutral-background)',
                                    color: 'var(--neutral-on-background-strong)'
                                }}
                             />
                        </div>
                    </div>

                    <div>
                         <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 500 }}>Avatar Path</label>
                         <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <Avatar size="xl" src={settings.person?.avatar} />
                            <input 
                                type="text"
                                value={settings.person?.avatar || ''}
                                onChange={e => updatePerson('avatar', e.target.value)}
                                placeholder="/images/avatar.jpg"
                                style={{ 
                                    flex: 1,
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--neutral-border-medium)',
                                    background: 'var(--neutral-background)',
                                    color: 'var(--neutral-on-background-strong)'
                                }}
                             />
                         </div>
                         <Text size="s" variant="body-default-s" onBackground="neutral-weak" marginTop="xs">
                            Path relative to the public folder. Use Keystatic Media Manager to upload files.
                         </Text>
                    </div>

                </Flex>
            </section>
        </div>
      </div>
    </div>
    </KeystaticLayout>
  );
};
