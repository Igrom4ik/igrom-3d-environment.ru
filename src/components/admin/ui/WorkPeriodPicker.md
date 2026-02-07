# WorkPeriodPicker

Интерактивный компонент выбора периода работы с календарём и опцией «По настоящее время».

## Props

- `value?: Partial<WorkPeriodSerialized>` — входное значение (строки в формате `ДД.ММ.ГГГГ`).
- `onChange?: (value: WorkPeriodSerialized) => void` — вызывается при любом изменении выбора.
- `id?: string` — id контейнера.
- `aria-label?: string` — a11y-лейбл контейнера.

Типы:

- `WorkPeriodSerialized`:
  - `start: string | null`
  - `end: string | null`
  - `present: boolean`

## Поведение

- Клик по дню:
  - если период пустой или уже выбран диапазон — устанавливает `start`, сбрасывает `end`;
  - если выбран только `start` — выбирает `end`;
  - если кликнули раньше `start` — переносит `start` на выбранную дату.
- «По настоящее время»:
  - включает `present=true` и фиксирует `end` на сегодняшней дате;
  - повторное выключение сбрасывает `end` в `null`.
- Валидация:
  - если `end < start`, отображается ошибка «Конечная дата не может быть раньше начальной».
- Клавиатура:
  - стрелки: перемещение по дням;
  - `PageUp`/`PageDown`: предыдущий/следующий месяц;
  - `Home`/`End`: начало/конец недели;
  - `Enter`/`Space`: выбрать текущий сфокусированный день.

## Пример

```tsx
import { WorkPeriodPicker } from "@/components/admin/ui/WorkPeriodPicker";
import type { WorkPeriodSerialized } from "@/utils/workPeriod";

export function Example() {
  const [value, setValue] = useState<WorkPeriodSerialized>({
    start: null,
    end: null,
    present: false,
  });

  return (
    <WorkPeriodPicker
      value={value}
      onChange={setValue}
      aria-label="Период работы"
    />
  );
}
```
