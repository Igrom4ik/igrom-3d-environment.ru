"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Flex, Button, Heading, Text, Avatar, useToast } from "@once-ui-system/core";

import { KeystaticLayout } from "@/components/admin/KeystaticLayout";
import ui from "./SettingsEditor.module.css";

export const SettingsEditor = () => {
  const [settings, setSettings] = useState<any>(null);
  const [meta, setMeta] = useState<{ avatarAbsolutePath?: string | null } | null>(null);
  const [about, setAbout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarCacheKey, setAvatarCacheKey] = useState(() => Date.now());

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingDims, setPendingDims] = useState<{ w: number; h: number } | null>(null);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropScale, setCropScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isDropActive, setIsDropActive] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/admin/settings").then((r) => r.json()), fetch("/api/admin/about").then((r) => r.json())])
      .then(([settingsData, aboutData]) => {
        const { __meta, ...rest } = settingsData ?? {};
        setMeta(__meta ?? null);
        setSettings(rest);
        setAbout(aboutData ?? {});
        setLoading(false);
      })
      .catch(() => {
        addToast({ variant: "danger", message: "Не удалось загрузить данные" });
        setLoading(false);
      });
  }, [addToast]);

  const safeSettingsPayload = useMemo(() => {
    if (!settings) return null;
    const { __meta, ...rest } = settings;
    return rest;
  }, [settings]);

  const refreshSettings = async () => {
    const res = await fetch("/api/admin/settings", { cache: "no-store" });
    const data = await res.json();
    const { __meta, ...rest } = data ?? {};
    setMeta(__meta ?? null);
    setSettings(rest);
    setAvatarCacheKey(Date.now());
  };

  useEffect(() => {
    const avatar = settings?.person?.avatar;
    if (!avatar || typeof avatar !== "string" || !avatar.startsWith("/")) return;

    const es = new EventSource(`/api/admin/fs/watch?publicPath=${encodeURIComponent(avatar)}`);
    const onChange = () => setAvatarCacheKey(Date.now());
    const onError = () => {
      try {
        es.close();
      } catch {}
    };

    es.addEventListener("change", onChange);
    es.addEventListener("error", onError as any);

    return () => {
      try {
        es.close();
      } catch {}
    };
  }, [settings?.person?.avatar]);

  const handleSave = async () => {
    if (!safeSettingsPayload || !about) return;
    setSaving(true);
    try {
      const resSettings = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safeSettingsPayload),
      });
      if (!resSettings.ok) throw new Error("SETTINGS");

      const resAbout = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(about),
      });
      if (!resAbout.ok) throw new Error("ABOUT");

      addToast({ variant: "success", message: "Данные сохранены" });
      await refreshSettings();
    } catch (err) {
      addToast({ variant: "danger", message: "Ошибка при сохранении" });
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

  const revokePendingUrl = () => {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
  };

  useEffect(() => {
    return () => {
      revokePendingUrl();
    };
  }, [pendingUrl]);

  const validateAndLoadImage = async (file: File) => {
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error("Файл слишком большой. Максимум 5 МБ.");
    }

    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(file.type)) {
      throw new Error("Неверный формат. Разрешены JPEG, PNG, WebP.");
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Не удалось прочитать изображение."));
      img.src = url;
    });

    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (w < 200 || h < 200) {
      URL.revokeObjectURL(url);
      throw new Error("Слишком маленькое изображение. Минимум 200×200 пикселей.");
    }
    if (w > 1000 || h > 1000) {
      URL.revokeObjectURL(url);
      throw new Error("Слишком большое изображение. Максимум 1000×1000 пикселей.");
    }

    return { url, w, h };
  };

  const handlePickAvatarFile = () => fileInputRef.current?.click();

  const handleFileSelected = async (file: File | null) => {
    if (!file) return;
    try {
      revokePendingUrl();
      const { url, w, h } = await validateAndLoadImage(file);
      setPendingFile(file);
      setPendingUrl(url);
      setPendingDims({ w, h });
      setCropOffset({ x: 0, y: 0 });
      setCropScale(1);
      addToast({
        variant: "success",
        message: "Изображение загружено. Настройте кадрирование 1:1 и нажмите «Загрузить».",
      });
    } catch (e: any) {
      setPendingFile(null);
      setPendingUrl(null);
      setPendingDims(null);
      addToast({ variant: "danger", message: e?.message ?? "Ошибка валидации файла" });
    }
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    setIsDropActive(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    await handleFileSelected(file);
  };

  const handleCropPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!pendingUrl || !pendingDims) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, ox: cropOffset.x, oy: cropOffset.y };
  };

  const clampOffset = (x: number, y: number) => {
    if (!pendingDims) return { x, y };
    const viewport = 240;
    const baseScale = Math.max(viewport / pendingDims.w, viewport / pendingDims.h);
    const totalScale = baseScale * cropScale;
    const maxX = Math.max(0, (pendingDims.w * totalScale - viewport) / 2);
    const maxY = Math.max(0, (pendingDims.h * totalScale - viewport) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  const handleCropPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const next = clampOffset(dragStartRef.current.ox + dx, dragStartRef.current.oy + dy);
    setCropOffset(next);
  };

  const handleCropPointerUp: React.PointerEventHandler<HTMLDivElement> = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const buildCroppedBlob = async () => {
    if (!pendingUrl || !pendingDims) throw new Error("Нет изображения для кадрирования");

    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Не удалось прочитать изображение."));
      img.src = pendingUrl;
    });

    const viewport = 240;
    const baseScale = Math.max(viewport / pendingDims.w, viewport / pendingDims.h);
    const totalScale = baseScale * cropScale;
    const cropSide = viewport / totalScale;

    const maxCenterX = pendingDims.w - cropSide / 2;
    const minCenterX = cropSide / 2;
    const maxCenterY = pendingDims.h - cropSide / 2;
    const minCenterY = cropSide / 2;

    const centerX = Math.max(minCenterX, Math.min(maxCenterX, pendingDims.w / 2 - cropOffset.x / totalScale));
    const centerY = Math.max(minCenterY, Math.min(maxCenterY, pendingDims.h / 2 - cropOffset.y / totalScale));

    const sx = centerX - cropSide / 2;
    const sy = centerY - cropSide / 2;

    const out = 512;
    const canvas = document.createElement("canvas");
    canvas.width = out;
    canvas.height = out;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Не удалось подготовить кадрирование");

    ctx.drawImage(img, sx, sy, cropSide, cropSide, 0, 0, out, out);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Не удалось подготовить файл для загрузки"))),
        "image/webp",
        0.92,
      );
    });
    return blob;
  };

  const uploadAvatar = async (mode: "upload" | "reset", file?: Blob) => {
    if (!safeSettingsPayload) return;

    const nextPayload = structuredClone(safeSettingsPayload);
    if (!nextPayload.person) nextPayload.person = {};
    if (mode === "reset") nextPayload.person.avatar = "/images/avatar.jpg";

    const form = new FormData();
    form.append("settings", JSON.stringify(nextPayload));
    form.append("avatarMode", mode);
    if (mode === "upload" && file) {
      form.append("avatar", new File([file], "avatar.webp", { type: "image/webp" }));
    }

    setUploadingAvatar(true);
    setUploadProgress(0);

    const sendOnce = () =>
      new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", "/api/admin/settings");
        xhr.responseType = "json";
        xhr.upload.onprogress = (evt) => {
          if (!evt.lengthComputable) return;
          setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(xhr.response?.error || "Ошибка загрузки"));
        };
        xhr.onerror = () => reject(new Error("Ошибка сети при загрузке"));
        xhr.send(form);
      });

    try {
      await sendOnce();
      addToast({ variant: "success", message: mode === "reset" ? "Аватар сброшен" : "Аватар загружен" });
      await refreshSettings();
      setPendingFile(null);
      revokePendingUrl();
      setPendingUrl(null);
      setPendingDims(null);
    } catch (e: any) {
      addToast({ variant: "danger", message: e?.message ?? "Не удалось загрузить аватар" });
    } finally {
      setUploadingAvatar(false);
      setUploadProgress(0);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!settings) return <div style={{ padding: 20 }}>Error loading settings</div>;

  return (
    <KeystaticLayout>
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-app)" }}>
      {/* Header */}
      <header style={{ 
          padding: "16px 24px", 
          borderBottom: "1px solid var(--border-subtle)", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          background: "var(--bg-panel)"
      }}>
        <Heading as="h1" variant="display-default-s">Настройки</Heading>
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="primary" onClick={handleSave} loading={saving}>Сохранить</Button>
        </div>
      </header>

      <div style={{ flex: 1, padding: "40px", overflowY: "auto", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: "800px" }}>
            
            <section style={{ 
                background: "var(--bg-panel)", 
                padding: "32px", 
                borderRadius: "16px",
                border: "1px solid var(--border-subtle)"
            }}>
                <Heading as="h2" variant="display-default-m" marginBottom="l">Личные данные</Heading>
                
                <Flex direction="column" gap="l">
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                             <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 500, color: "var(--text-primary)" }}>Имя</label>
                             <input 
                                type="text"
                                value={settings.person?.name || ''}
                                onChange={e => updatePerson('name', e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--border-subtle)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-primary)'
                                }}
                             />
                        </div>
                        <div style={{ flex: 1 }}>
                             <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 500, color: "var(--text-primary)" }}>Роль / Должность</label>
                             <input 
                                type="text"
                                value={settings.person?.role || ''}
                                onChange={e => updatePerson('role', e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--border-subtle)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-primary)'
                                }}
                             />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '24px' }}>
                        <div style={{ flex: 1 }}>
                             <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 500, color: "var(--text-primary)" }}>Локация</label>
                             <input 
                                type="text"
                                value={settings.person?.location || ''}
                                onChange={e => updatePerson('location', e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--border-subtle)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-primary)'
                                }}
                             />
                        </div>
                        <div style={{ flex: 1 }}>
                             <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 500, color: "var(--text-primary)" }}>Часовой пояс</label>
                             <input 
                                type="text"
                                value={settings.person?.timeZone || ''}
                                onChange={e => updatePerson('timeZone', e.target.value)}
                                placeholder="например Europe/Kaliningrad"
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--border-subtle)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-primary)'
                                }}
                             />
                        </div>
                    </div>

                    <div>
                         <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 500, color: "var(--text-primary)" }}>Аватар</label>

                         <div className={ui.avatarSectionRow}>
                            <div className={ui.avatarPreview}>
                              {settings.person?.avatar ? (
                                <img
                                  alt="Avatar"
                                  src={`${settings.person.avatar}?v=${avatarCacheKey}`}
                                  className={ui.avatarImg}
                                />
                              ) : (
                                <Avatar size="l" />
                              )}
                            </div>

                            <div className={ui.avatarControls}>
                              <div className={ui.avatarButtons}>
                                <Button
                                  variant="secondary"
                                  onClick={handlePickAvatarFile}
                                  disabled={uploadingAvatar}
                                  title="Выберите изображение (JPEG/PNG/WebP, до 5 МБ, 200–1000px)"
                                >
                                  Выбрать файл
                                </Button>
                                <Button
                                  variant="tertiary"
                                  onClick={() => {
                                    if (window.confirm("Удалить текущий аватар и сбросить к значению по умолчанию?")) {
                                      uploadAvatar("reset");
                                    }
                                  }}
                                  disabled={uploadingAvatar}
                                  title="Сбросить к /images/avatar.jpg и удалить загруженный файл (если был)"
                                >
                                  Сбросить
                                </Button>
                              </div>

                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                style={{ display: "none" }}
                                onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
                              />

                              <div className={ui.fieldGroup}>
                                <label className={ui.fieldLabel}>Публичный путь</label>
                                <input
                                  type="text"
                                  value={settings.person?.avatar || ""}
                                  onChange={(e) => updatePerson("avatar", e.target.value)}
                                  placeholder="/images/avatar.jpg"
                                  style={{
                                    width: "100%",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid var(--border-subtle)",
                                    background: "var(--bg-card)",
                                    color: "var(--text-primary)",
                                    boxSizing: "border-box",
                                  }}
                                />
                              </div>

                              <div className={ui.fieldGroup} style={{ gap: 6 }}>
                                <label className={ui.fieldLabel}>Абсолютный путь (сервер)</label>
                                <div className={ui.monoValue} title={meta?.avatarAbsolutePath ?? ""}>
                                  {meta?.avatarAbsolutePath ?? "—"}
                                </div>
                              </div>
                            </div>
                         </div>

                         <div
                           onDragEnter={(e) => {
                             e.preventDefault();
                             setIsDropActive(true);
                           }}
                           onDragLeave={() => setIsDropActive(false)}
                           onDragOver={(e) => {
                             e.preventDefault();
                             setIsDropActive(true);
                           }}
                           onDrop={handleDrop}
                           title="Перетащите изображение сюда (JPEG/PNG/WebP, до 5 МБ, 200–1000px)"
                           className={[ui.dropZone, isDropActive ? ui.dropZoneActive : ""].filter(Boolean).join(" ")}
                         >
                           Перетащите файл сюда или нажмите «Выбрать файл»
                         </div>

                         {pendingUrl && pendingDims && (
                           <div className={ui.cropGrid}>
                             <div
                               className={ui.cropViewport}
                               style={{ cursor: isDragging ? "grabbing" : "grab" }}
                               onPointerDown={handleCropPointerDown}
                               onPointerMove={handleCropPointerMove}
                               onPointerUp={handleCropPointerUp}
                               onPointerCancel={handleCropPointerUp}
                             >
                               <div
                                 style={{
                                   position: "absolute",
                                   left: "50%",
                                   top: "50%",
                                   transform: `translate(-50%, -50%) translate(${cropOffset.x}px, ${cropOffset.y}px)`,
                                 }}
                               >
                                 <img
                                   alt="Avatar preview"
                                   src={pendingUrl}
                                   style={{
                                     width: pendingDims.w * Math.max(240 / pendingDims.w, 240 / pendingDims.h),
                                     height: pendingDims.h * Math.max(240 / pendingDims.w, 240 / pendingDims.h),
                                     transform: `scale(${cropScale})`,
                                     transformOrigin: "center center",
                                     userSelect: "none",
                                     pointerEvents: "none",
                                   }}
                                 />
                               </div>
                               <div
                                 style={{
                                   position: "absolute",
                                   inset: 0,
                                   boxShadow: "inset 0 0 0 2px rgba(34, 211, 238, 0.35)",
                                   borderRadius: 16,
                                   pointerEvents: "none",
                                 }}
                               />
                             </div>

                             <div className={ui.cropControls}>
                               <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                 <label className={ui.fieldLabel}>Масштаб</label>
                                 <input
                                   type="range"
                                   min={1}
                                   max={2.5}
                                   step={0.01}
                                   value={cropScale}
                                   onChange={(e) => {
                                     const next = Number(e.target.value);
                                     setCropScale(next);
                                     setCropOffset((prev) => clampOffset(prev.x, prev.y));
                                   }}
                                   style={{ width: "100%" }}
                                 />
                               </div>

                               <div className={ui.cropNumbers}>
                                 <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                   <label className={ui.fieldLabel}>X</label>
                                   <input
                                     type="number"
                                     value={Math.round(cropOffset.x)}
                                     onChange={(e) => setCropOffset((prev) => clampOffset(Number(e.target.value), prev.y))}
                                     style={{
                                       width: "100%",
                                       padding: "10px 12px",
                                       borderRadius: 8,
                                       border: "1px solid var(--border-subtle)",
                                       background: "var(--bg-card)",
                                       color: "var(--text-primary)",
                                       boxSizing: "border-box",
                                     }}
                                   />
                                 </div>
                                 <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                   <label className={ui.fieldLabel}>Y</label>
                                   <input
                                     type="number"
                                     value={Math.round(cropOffset.y)}
                                     onChange={(e) => setCropOffset((prev) => clampOffset(prev.x, Number(e.target.value)))}
                                     style={{
                                       width: "100%",
                                       padding: "10px 12px",
                                       borderRadius: 8,
                                       border: "1px solid var(--border-subtle)",
                                       background: "var(--bg-card)",
                                       color: "var(--text-primary)",
                                       boxSizing: "border-box",
                                     }}
                                   />
                                 </div>
                                 <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                   <label className={ui.fieldLabel}>Scale</label>
                                   <input
                                     type="number"
                                     min={1}
                                     max={2.5}
                                     step={0.01}
                                     value={Number(cropScale.toFixed(2))}
                                     onChange={(e) => {
                                       const next = Math.max(1, Math.min(2.5, Number(e.target.value)));
                                       setCropScale(next);
                                       setCropOffset((prev) => clampOffset(prev.x, prev.y));
                                     }}
                                     style={{
                                       width: "100%",
                                       padding: "10px 12px",
                                       borderRadius: 8,
                                       border: "1px solid var(--border-subtle)",
                                       background: "var(--bg-card)",
                                       color: "var(--text-primary)",
                                       boxSizing: "border-box",
                                     }}
                                   />
                                 </div>
                               </div>

                               <div className={ui.actionsRow}>
                                 <Button
                                   variant="secondary"
                                   onClick={() => {
                                     setCropScale(1);
                                     setCropOffset({ x: 0, y: 0 });
                                   }}
                                   disabled={uploadingAvatar}
                                   title="Сбросить кадрирование"
                                 >
                                   Сбросить кроп
                                 </Button>
                               </div>

                               <div className={ui.actionsRow}>
                                 <Button
                                   variant="primary"
                                   onClick={async () => {
                                     try {
                                       const blob = await buildCroppedBlob();
                                       await uploadAvatar("upload", blob);
                                     } catch (e: any) {
                                       addToast({ variant: "danger", message: e?.message ?? "Ошибка загрузки" });
                                     }
                                   }}
                                   loading={uploadingAvatar}
                                   disabled={uploadingAvatar}
                                   title="Загрузить кадрированный аватар"
                                 >
                                   Загрузить
                                 </Button>

                                 <Button
                                   variant="tertiary"
                                   onClick={() => {
                                     setPendingFile(null);
                                     revokePendingUrl();
                                     setPendingUrl(null);
                                     setPendingDims(null);
                                   }}
                                   disabled={uploadingAvatar}
                                   title="Отменить кадрирование"
                                 >
                                   Отмена
                                 </Button>
                               </div>

                               {uploadingAvatar && (
                                 <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                   <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)" }}>
                                     <span>Загрузка</span>
                                     <span>{uploadProgress}%</span>
                                   </div>
                                   <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                     <div
                                       style={{
                                         width: `${uploadProgress}%`,
                                         height: "100%",
                                         background: "linear-gradient(90deg, #22d3ee, #2dd4bf)",
                                         transition: "width 120ms linear",
                                       }}
                                     />
                                   </div>
                                 </div>
                               )}

                               <Text size="s" variant="body-default-s" onBackground="neutral-weak">
                                 Форматы: JPEG, PNG, WebP. Размер: до 5 МБ. Разрешение: 200–1000 px. Кадрирование фиксировано 1:1.
                               </Text>
                             </div>
                           </div>
                         )}
                    </div>

                </Flex>
            </section>

            <section
              style={{
                marginTop: 24,
                background: "var(--bg-panel)",
                padding: "32px",
                borderRadius: "16px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Heading as="h2" variant="display-default-m" marginBottom="l">
                About
              </Heading>

              <Flex direction="column" gap="l">
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                    Заголовок страницы
                  </label>
                  <input
                    type="text"
                    value={about?.title || ""}
                    onChange={(e) => setAbout((prev: any) => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-subtle)",
                      background: "var(--bg-card)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                    Описание
                  </label>
                  <textarea
                    value={about?.description || ""}
                    onChange={(e) => setAbout((prev: any) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-subtle)",
                      background: "var(--bg-card)",
                      color: "var(--text-primary)",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <input
                    id="about-avatar-display"
                    type="checkbox"
                    checked={Boolean(about?.avatar?.display)}
                    onChange={(e) =>
                      setAbout((prev: any) => ({
                        ...prev,
                        avatar: { ...(prev?.avatar ?? {}), display: e.target.checked },
                      }))
                    }
                    style={{ width: 18, height: 18 }}
                  />
                  <label htmlFor="about-avatar-display" style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                    Показывать блок аватара на странице About
                  </label>
                </div>
              </Flex>
            </section>
        </div>
      </div>
    </div>
    </KeystaticLayout>
  );
};
