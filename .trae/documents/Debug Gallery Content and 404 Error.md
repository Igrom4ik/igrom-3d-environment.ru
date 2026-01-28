I will investigate why the gallery content cards are not displaying and why the album page might be returning a 404 error.

### Investigation Steps:
1.  **Verify Component Exports**: Check `src/components/ProjectBlocks.tsx` to ensure `VideoLoop`, `MarmosetViewer`, etc., are correctly exported and implemented.
2.  **Debug Data Flow**: Add `console.log` statements to `src/app/(site)/gallery/[slug]/page.tsx` and `src/utils/reader.ts` to inspect:
    -   The `slug` being received.
    -   The `album` data returned by the reader.
    -   The `images` array content.
    This will determine if the issue is missing data (leading to 404 or empty page) or a rendering problem.
3.  **Analyze Logs**: Run the dev server and check the terminal output to pinpoint where the data might be missing or incorrect.

### Goal:
Confirm if the data is reaching the page correctly and if the components are receiving the right props to render the content cards.