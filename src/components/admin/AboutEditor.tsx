"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Flex, Button, Heading, Text, useToast, SegmentedControl } from "@once-ui-system/core";
import { KeystaticLayout } from "@/components/admin/KeystaticLayout";
import ui from "./AboutEditor.module.css";
import { Trash2 } from "lucide-react";
import { WorkPeriodPicker } from "./ui/WorkPeriodPicker";
import { parseTimeframeToSerialized, formatSerializedToTimeframe } from "../../utils/timeframe";
import { TagsEditor } from "@/components/admin/ui/TagsEditor";

// Types based on the schema
interface Image {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

interface Experience {
  company: string;
  timeframe: string;
  role: string;
  achievements: string[];
  images: Image[];
}

interface Institution {
  name: string;
  description: string;
}

interface Tag {
  name: string;
  icon: string;
}

interface Skill {
  title: string;
  description: string;
  tags: Tag[];
  images: Image[];
}

interface AboutData {
  title: string;
  description: string;
  avatar: { display: boolean };
  calendar: { display: boolean; link: string };
  work: { display: boolean; title: string; experiences: Experience[] };
  studies: { display: boolean; title: string; institutions: Institution[] };
  technical: { display: boolean; title: string; skills: Skill[] };
  // blocks are ignored for now as per plan
}

export const AboutEditor = () => {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("general");
  const { addToast } = useToast();

  useEffect(() => {
    fetch("/api/admin/about")
      .then((r) => r.json())
      .then((d) => {
        // Normalize data structures
        const raw = d as Partial<AboutData> | null | undefined;
        const normalized: AboutData = {
          title: raw?.title ?? "",
          description: raw?.description ?? "",
          avatar: raw?.avatar ?? { display: true },
          calendar: raw?.calendar ?? { display: true, link: "" },
          work: raw?.work ?? { display: true, title: "Опыт работы", experiences: [] },
          studies: raw?.studies ?? { display: true, title: "Образование", institutions: [] },
          technical: raw?.technical ?? { display: true, title: "Навыки", skills: [] },
        };
        setData(normalized);
        setLoading(false);
      })
      .catch(() => {
        addToast({ variant: "danger", message: "Не удалось загрузить данные" });
        setLoading(false);
      });
  }, [addToast]);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save failed");
      addToast({ variant: "success", message: "Данные сохранены" });
    } catch (err) {
      addToast({ variant: "danger", message: "Ошибка при сохранении" });
    } finally {
      setSaving(false);
    }
  };
  const ids = useMemo(
    () => ({
      title: "about-title",
      description: "about-description",
      avatarDisplay: "about-avatar-display",
      calendarDisplay: "about-calendar-display",
      calendarLink: "about-calendar-link",
    }),
    [],
  );

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!data) return <div style={{ padding: 20 }}>Error loading data</div>;

  const headerActions = (
    <Button variant="primary" onClick={handleSave} loading={saving}>
      Сохранить
    </Button>
  );

  return (
    <KeystaticLayout customHeaderActions={headerActions}>
      <div className={ui.container}>
        <div style={{ padding: '0 40px', paddingTop: '20px' }}>
            <SegmentedControl
                buttons={[
                    { label: 'Основное', value: 'general' },
                    { label: 'Опыт работы', value: 'work' },
                    { label: 'Образование', value: 'studies' },
                    { label: 'Навыки', value: 'technical' },
                ]}
                selected={activeTab}
                onToggle={(val) => setActiveTab(val)}
            />
        </div>

        <div className={ui.content} role="region" aria-label="Содержимое редактора About">
          <div className={ui.formContainer}>
            
            {activeTab === 'general' && (
                <section className={ui.section}>
                    <Heading as="h2" variant="display-default-m" marginBottom="l">Общая информация</Heading>
                    <Flex direction="column" gap="l">
                        <div className={ui.fieldGroup}>
                            <label className={ui.label} htmlFor={ids.title}>Заголовок страницы</label>
                            <input 
                                id={ids.title}
                                className={ui.input} 
                                value={data.title} 
                                onChange={(e) => setData((prev) => (prev ? { ...prev, title: e.target.value } : prev))} 
                            />
                        </div>
                        <div className={ui.fieldGroup}>
                            <label className={ui.label} htmlFor={ids.description}>Описание (SEO)</label>
                            <textarea 
                                id={ids.description}
                                className={ui.textarea} 
                                rows={4}
                                value={data.description} 
                                onChange={(e) => setData((prev) => (prev ? { ...prev, description: e.target.value } : prev))} 
                            />
                        </div>
                        
                        <div className={ui.checkboxRow}>
                            <input 
                                id={ids.avatarDisplay}
                                type="checkbox" 
                                className={ui.checkbox}
                                checked={data.avatar.display} 
                                onChange={(e) =>
                                  setData((prev) =>
                                    prev ? { ...prev, avatar: { ...prev.avatar, display: e.target.checked } } : prev,
                                  )
                                } 
                            />
                            <label className={ui.label} htmlFor={ids.avatarDisplay}>Показывать аватар</label>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                            <Heading as="h3" variant="heading-default-s" marginBottom="m">Календарь</Heading>
                            <Flex direction="column" gap="m">
                                <div className={ui.checkboxRow}>
                                    <input 
                                        id={ids.calendarDisplay}
                                        type="checkbox" 
                                        className={ui.checkbox}
                                        checked={data.calendar.display} 
                                        onChange={(e) =>
                                          setData((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  calendar: { ...prev.calendar, display: e.target.checked },
                                                }
                                              : prev,
                                          )
                                        } 
                                    />
                                    <label className={ui.label} htmlFor={ids.calendarDisplay}>Показывать кнопку календаря</label>
                                </div>
                                {data.calendar.display && (
                                    <div className={ui.fieldGroup}>
                                        <label className={ui.label} htmlFor={ids.calendarLink}>Ссылка на календарь</label>
                                        <input 
                                            id={ids.calendarLink}
                                            className={ui.input} 
                                            value={data.calendar.link} 
                                            onChange={(e) =>
                                              setData((prev) =>
                                                prev ? { ...prev, calendar: { ...prev.calendar, link: e.target.value } } : prev,
                                              )
                                            } 
                                        />
                                    </div>
                                )}
                            </Flex>
                        </div>
                    </Flex>
                </section>
            )}

            {activeTab === 'work' && (
                <SectionEditor 
                    title="Опыт работы"
                    data={data.work}
                    itemsKey="experiences"
                    onChange={(val) => setData((prev) => (prev ? { ...prev, work: val } : prev))}
                    getKey={(item, index) => `${item.company}-${item.role}-${index}`}
                    renderItem={(item, index, onChange) => (
                        <ExperienceItem baseId={`work-${index}`} item={item} onChange={onChange} />
                    )}
                    newItem={() => ({ company: "", timeframe: "", role: "", achievements: [], images: [] })}
                />
            )}

            {activeTab === 'studies' && (
                <SectionEditor<Institution, "institutions">
                    title="Образование"
                    data={data.studies}
                    itemsKey="institutions"
                    onChange={(val) => setData((prev) => (prev ? { ...prev, studies: val } : prev))}
                    getKey={(item, index) => `${item.name}-${index}`}
                    renderItem={(item, index, onChange) => (
                        <div className={ui.fieldGroup}>
                            <label className={ui.label} htmlFor={`studies-${index}-name`}>Учебное заведение</label>
                            <input 
                                id={`studies-${index}-name`}
                                className={ui.input} 
                                value={item.name} 
                                onChange={(e) => onChange({ ...item, name: e.target.value })} 
                            />
                            <label className={ui.label} htmlFor={`studies-${index}-description`}>Описание</label>
                            <textarea 
                                id={`studies-${index}-description`}
                                className={ui.textarea} 
                                rows={3}
                                value={item.description} 
                                onChange={(e) => onChange({ ...item, description: e.target.value })} 
                            />
                        </div>
                    )}
                    newItem={() => ({ name: "", description: "" })}
                />
            )}

            {activeTab === 'technical' && (
                <SectionEditor<Skill, "skills">
                    title="Технические навыки"
                    data={data.technical}
                    itemsKey="skills"
                    onChange={(val) => setData((prev) => (prev ? { ...prev, technical: val } : prev))}
                    getKey={(item, index) => `${item.title}-${index}`}
                    renderItem={(item, index, onChange) => (
                        <SkillItem baseId={`skills-${index}`} item={item} onChange={onChange} />
                    )}
                    newItem={() => ({ title: "", description: "", tags: [], images: [] })}
                />
            )}

          </div>
        </div>
      </div>
    </KeystaticLayout>
  );
};

// Sub-components

type SectionData<TItemsKey extends string, TItem> = {
  display: boolean;
  title: string;
} & Record<TItemsKey, TItem[]>;

type SectionEditorProps<TItem, TItemsKey extends string> = {
  title: string;
  data: SectionData<TItemsKey, TItem>;
  itemsKey: TItemsKey;
  onChange: (value: SectionData<TItemsKey, TItem>) => void;
  renderItem: (item: TItem, index: number, onChange: (value: TItem) => void) => React.ReactNode;
  newItem: () => TItem;
  getKey?: (item: TItem, index: number) => string;
};

function SectionEditor<TItem, TItemsKey extends string>({
  title,
  data,
  itemsKey,
  onChange,
  renderItem,
  newItem,
  getKey,
}: SectionEditorProps<TItem, TItemsKey>) {
  const items = data[itemsKey] ?? [];
  const displayId = `section-${itemsKey}-display`;
  const titleId = `section-${itemsKey}-title`;

  const updateItem = (index: number, val: TItem) => {
    const nextItems = items.slice();
    nextItems[index] = val;
    onChange({ ...data, [itemsKey]: nextItems });
  };

  const removeItem = (index: number) => {
    if (!confirm("Удалить элемент?")) return;
    onChange({ ...data, [itemsKey]: items.filter((_, i) => i !== index) });
  };

  return (
    <section className={ui.section}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <Heading as="h2" variant="display-default-m">
          {title}
        </Heading>
        <div className={ui.checkboxRow}>
          <input
            id={displayId}
            type="checkbox"
            className={ui.checkbox}
            checked={data.display}
            onChange={(e) => onChange({ ...data, display: e.target.checked })}
          />
          <label className={ui.label} htmlFor={displayId}>
            Включить секцию
          </label>
        </div>
      </div>

      {data.display && (
        <Flex direction="column" gap="l">
          <div className={ui.fieldGroup}>
            <label className={ui.label} htmlFor={titleId}>
              Заголовок секции
            </label>
            <input
              id={titleId}
              className={ui.input}
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {items.map((item, index) => (
              <div key={getKey ? getKey(item, index) : `${itemsKey}-${index}`} className={ui.itemCard}>
                <div className={ui.itemHeader}>
                  <Text variant="heading-strong-s">Элемент #{index + 1}</Text>
                  <button
                    type="button"
                    className={ui.removeButton}
                    onClick={() => removeItem(index)}
                    aria-label="Delete item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {renderItem(item, index, (val) => updateItem(index, val))}
              </div>
            ))}
          </div>

          <Button
            variant="secondary"
            onClick={() => onChange({ ...data, [itemsKey]: [...items, newItem()] })}
          >
            Добавить элемент
          </Button>
        </Flex>
      )}
    </section>
  );
}

function ExperienceItem({
  baseId,
  item,
  onChange,
}: {
  baseId: string;
  item: Experience;
  onChange: (value: Experience) => void;
}) {
  return (
    <Flex direction="column" gap="m">
      <div style={{ display: "flex", gap: "16px" }}>
        <div className={ui.fieldGroup} style={{ flex: 1 }}>
          <label className={ui.label} htmlFor={`${baseId}-company`}>
            Компания
          </label>
          <input
            id={`${baseId}-company`}
            className={ui.input}
            value={item.company}
            onChange={(e) => onChange({ ...item, company: e.target.value })}
          />
        </div>
        <div className={ui.fieldGroup} style={{ flex: 1 }}>
          <label className={ui.label} htmlFor={`${baseId}-timeframe`}>
            Период
          </label>
          <div id={`${baseId}-timeframe`} style={{ marginTop: 6 }}>
            <WorkPeriodPicker
              id={`${baseId}-timeframe-picker`}
              aria-label="Период работы"
              value={parseTimeframeToSerialized(item.timeframe)}
              onChange={(val) => {
                const tf = formatSerializedToTimeframe(val);
                onChange({ ...item, timeframe: tf });
              }}
            />
          </div>
        </div>
      </div>
      <div className={ui.fieldGroup}>
        <label className={ui.label} htmlFor={`${baseId}-role`}>
          Должность
        </label>
        <input
          id={`${baseId}-role`}
          className={ui.input}
          value={item.role}
          onChange={(e) => onChange({ ...item, role: e.target.value })}
        />
      </div>
      <div className={ui.fieldGroup}>
        <label className={ui.label} htmlFor={`${baseId}-achievements`}>
          Достижения (каждое с новой строки)
        </label>
        <textarea
          id={`${baseId}-achievements`}
          className={ui.textarea}
          rows={4}
          value={item.achievements.join("\n")}
          onChange={(e) => onChange({ ...item, achievements: e.target.value.split("\n") })}
        />
      </div>
    </Flex>
  );
}

function SkillItem({
  baseId,
  item,
  onChange,
}: {
  baseId: string;
  item: Skill;
  onChange: (value: Skill) => void;
}) {
  return (
    <Flex direction="column" gap="m">
      <div className={ui.fieldGroup}>
        <label className={ui.label} htmlFor={`${baseId}-title`}>
          Название навыка
        </label>
        <input
          id={`${baseId}-title`}
          className={ui.input}
          value={item.title}
          onChange={(e) => onChange({ ...item, title: e.target.value })}
        />
      </div>
      <div className={ui.fieldGroup}>
        <label className={ui.label} htmlFor={`${baseId}-description`}>
          Описание
        </label>
        <textarea
          id={`${baseId}-description`}
          className={ui.textarea}
          rows={3}
          value={item.description}
          onChange={(e) => onChange({ ...item, description: e.target.value })}
        />
      </div>

      <div className={ui.fieldGroup}>
        <label className={ui.label} htmlFor={`${baseId}-tags-ui`}>
          Теги
        </label>
        <div id={`${baseId}-tags-ui`}>
          <TagsEditor
            value={item.tags}
            onChange={(next: Tag[]) => onChange({ ...item, tags: next })}
          />
        </div>
      </div>
    </Flex>
  );
}
