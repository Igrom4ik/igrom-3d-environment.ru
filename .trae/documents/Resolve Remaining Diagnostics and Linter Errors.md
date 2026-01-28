I will resolve the remaining diagnostics and linting errors across the project to ensure a clean build and type safety.

### **1. Type Definitions & Declarations**
*   **Create `src/types/declarations.d.ts`**: Add a declaration for `js-yaml` to resolve the "Could not find a declaration file" error.

### **2. Fix Imports (Biome & TypeScript)**
*   **`src/components/work/Projects.tsx`**: Add `type` keyword to `Metadata` import.
*   **`src/utils/utils.ts`**: Add `type` keyword to `Metadata` import.
*   **API Routes**: Add `type` keyword to `NextRequest`, `NextResponse`, etc., in:
    *   `src/app/api/portfolio/get/route.ts`
    *   `src/app/api/portfolio/save/route.ts`
    *   `src/app/api/upload/route.ts`
    *   `src/app/api/telegram/send/route.ts`

### **3. Keystatic Configuration**
*   **`keystatic.config.tsx`**:
    *   Remove the invalid `preview` property from the `marmoset` block definition (standard blocks do not support custom previews like document components do).
    *   Fix the empty SVG `<title>` element in the `marmoset` component block (if present elsewhere) or ensure it has content.
    *   Remove unused `React` import.

### **4. Component & Page Fixes**
*   **`src/app/admin/upload/page.tsx`**:
    *   Convert function expressions to arrow functions.
    *   Replace string concatenation with template literals.
    *   Fix optional chaining suggestions.
    *   Change the file selection `div` to use a semantic `<button>` or `<label>` to satisfy accessibility rules.
*   **`src/components/blocks/GalleryBlock.tsx`**:
    *   Fix the type mismatch for `orientation` by explicitly casting the mapped object to `GalleryImage`.
*   **`src/components/blog/BlogGalleryAlbum.tsx`**:
    *   Fix the property access error for `cover` (likely needs to be accessed via `publishing.cover`).
    *   Remove `any` types.

### **5. Logic & Syntax Improvements**
*   **`src/app/api/telegram/send/route.ts`**:
    *   Fix "assignment in expression" error.
    *   Remove unnecessary template literals.
*   **`src/app/api/projects/by-slugs/route.ts`**:
    *   Remove remaining `any` types and ensure strict typing.