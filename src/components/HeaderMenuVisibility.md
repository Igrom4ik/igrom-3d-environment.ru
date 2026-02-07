# Header menu visibility API

`Header` supports an optional prop for limiting how many navigation items are visible at once on desktop.

## Props

### `menuMaxVisibleItems?: number`

- When omitted: desktop header renders navigation as before (no scroller UI).
- When set to a positive number and `links.length > menuMaxVisibleItems`:
  - Desktop navigation becomes a scrollable menu (`overflow-x: auto`) where only ~`menuMaxVisibleItems` items fit in the visible area.
  - Left/right buttons appear for mouse users.
  - Touch scrolling works on mobile devices.
  - Keyboard navigation is supported via ArrowLeft/ArrowRight/Home/End/PageUp/PageDown.

## Accessibility

- Desktop menu container uses `role="menu"`.
- Each navigation button uses `role="menuitem"`.
- Mobile trigger uses `aria-expanded` and `aria-controls`.
- Scroll buttons use `aria-controls` and toggle `aria-hidden` when disabled.

