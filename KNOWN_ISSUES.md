# Known Issues

## Admin UI / Theme Editor
- **Background Effect Isolation**: The canvas-based background effects (Constellation, Vortex, etc.) in the Theme Editor preview might not be strictly confined to the preview container in some scenarios, potentially leaking visually into the surrounding area or behaving inconsistently with the container boundaries. Attempts to isolate via `position: absolute` and `overflow: hidden` were made but may need further refinement (e.g., Shadow DOM or iframe isolation) in the future.
