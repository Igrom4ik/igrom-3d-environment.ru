I will fix the `any` type issues and add the requested helper function.

### 1. Update `src/types/content.types.ts`
- Define and export `TeamMember` interface (extracting from `Metadata`).
- Define and export `MediaItem` interface for the media blocks.
- Update `Metadata` interface to use `TeamMember[]` and `MediaItem[]` instead of inline types and `any[]`.

### 2. Update `src/utils/utils.ts`
- Remove `eslint-disable @typescript-eslint/no-explicit-any`.
- Import `TeamMember` and `MediaItem` from `@/types`.
- Refactor `readMDXFile` to use these types instead of `any`.
- Add the `getQueryParam` helper function as requested (Variant 2) to handle `string | string[] | undefined` safe access.

### 3. Update `src/app/api/portfolio/save/route.ts`
- Replace `Record<string, any>` with `Record<string, unknown>` in `convertToMdoc`.
- Ensure safe type usage when processing `data`.

This addresses all the user's concerns: removing `any`, strict typing, and providing the `searchParams` helper.