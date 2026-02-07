"use client";

import { useMemo, useState } from "react";
import styles from "./TagsEditor.module.css";
import { Trash2, Plus } from "lucide-react";

export type Tag = { name: string; icon: string };

export function TagsEditor({
  value,
  onChange,
}: {
  value: Tag[];
  onChange: (next: Tag[]) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const tags = useMemo(() => Array.isArray(value) ? value : [], [value]);

  const update = (index: number, next: Tag) => {
    const arr = tags.slice();
    arr[index] = next;
    onChange(arr);
  };

  const remove = (index: number) => {
    const arr = tags.filter((_, i) => i !== index);
    onChange(arr);
  };

  const add = () => {
    onChange([...tags, { name: "", icon: "" }]);
  };

  const validate = () => {
    const invalid = tags.find((t) => !t.name.trim());
    setError(invalid ? "Название тега обязательно" : null);
  };

  return (
    <div className={styles.root}>
      <div className={styles.list} role="list">
        {tags.map((t, i) => (
          <div className={styles.row} key={`${t.name}-${i}`} role="listitem">
            <input
              className={styles.input}
              value={t.name}
              placeholder="Название"
              onChange={(e) => update(i, { ...t, name: e.target.value })}
              onBlur={validate}
              aria-label="Название тега"
            />
            <input
              className={styles.input}
              value={t.icon}
              placeholder="Иконка"
              onChange={(e) => update(i, { ...t, icon: e.target.value })}
              onBlur={validate}
              aria-label="Иконка тега"
            />
            <button type="button" className={styles.remove} onClick={() => remove(i)} aria-label="Удалить тег">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className={styles.controls}>
        <button type="button" className={styles.add} onClick={add} aria-label="Добавить тег">
          <Plus size={16} /> Добавить тег
        </button>
      </div>
      {error && (
        <div className={styles.error} role="alert" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
}
