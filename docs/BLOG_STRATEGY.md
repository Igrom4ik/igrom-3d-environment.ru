# Blog Strategy & Technical Plan 2024

## 1. Web Design Trends Analysis (2024-2025)

Based on an analysis of leading platforms (Medium, Dev.to, Hashnode, Linear Blog, Vercel Blog, and Stripe Press), the following trends are dominant:

### UI/UX Recommendations
1.  **Bento Grids**: Content organized in modular, rectangular blocks (bento box style). This allows for highlighting featured posts while maintaining a structured grid for standard feeds.
2.  **Liquid/Glass Aesthetics**: Deep, dark backgrounds with subtle, moving gradients and glassmorphism (blur effects) on overlays. This creates depth and a premium feel.
3.  **Typography**:
    *   **Headings**: Large, high-contrast sans-serif (Inter, Geist) or stylized serif for editorial feel.
    *   **Body**: Highly readable serif or monospace (JetBrains Mono) for technical content.
    *   **Scale**: Clamp-based responsive typography that scales fluidly with viewport width.
4.  **Micro-Interactions**: Subtle hover states (glow, lift, border reveal) and smooth page transitions (View Transitions API).
5.  **Reading Experience**:
    *   Estimated reading time.
    *   Table of Contents (sticky on desktop, drawer on mobile).
    *   Code blocks with syntax highlighting and "Copy" buttons.
    *   Progress bars.

### Color Palette (Dark Mode Focused)
*   **Background**: Deep Navy/Black (`#050712`, `#0B0B10`) rather than pure black.
*   **Surface**: Slightly lighter darks with transparency (`rgba(255,255,255,0.03)`).
*   **Accents**: Electric Blue (`#1E90FF`), Neon Purple, or Gold for primary actions/highlights.
*   **Text**: Off-white (`#F4F4F6`) for primary, gray-blue (`#9A9CAB`) for secondary to reduce eye strain.

### Animations
*   **Entry**: Staggered fade-in for list items.
*   **Scroll**: Parallax effects on hero images.
*   **Interaction**: Magnetic buttons and glowing borders on hover.

---

## 2. Technical Implementation Plan

### Phase 1: Core Management (Current Status: In Progress)
*   [x] **Custom Editor**: Mobile-first MDX editor with template insertion.
*   [x] **File System API**: Save/Read logic for MDX files.
*   [ ] **Trash System**: Soft delete and restore functionality (30-day retention logic).

### Phase 2: Advanced Organization (Est. 4 hours)
*   **Filtering Engine**:
    *   Client-side filtering for immediate feedback.
    *   Sort by: Date (Newest/Oldest), Title (A-Z).
    *   Filter by: Tags/Categories.
*   **Persistence**: Save user preferences to `localStorage`.
*   **Pagination**: Implement load-more or numeric pagination if post count > 20.

### Phase 3: Performance & SEO (Est. 3 hours)
*   **Caching**: Implement Redis (or in-memory cache for build time) to speed up `getBlogPosts`.
*   **SEO**: Auto-generate `sitemap.xml` and `robots.txt`.
*   **OG Images**: Dynamic Open Graph image generation using `@vercel/og`.

### Phase 4: Frontend Polish (Est. 5 hours)
*   **View Transitions**: Enable smooth navigation between list and details.
*   **Reading Progress**: Add a reading progress bar.
*   **Table of Contents**: Auto-generate TOC from MDX headings.

---

## 3. Technology Stack

*   **Frontend**: React 19 (Next.js 15+), TypeScript, Tailwind CSS / CSS Modules.
*   **Content**: MDX (next-mdx-remote), Gray-matter for frontmatter.
*   **State Management**: React Hooks (`useState`, `useReducer`) + `localStorage` for UI state.
*   **Backend**: Next.js API Routes (Node.js runtime).
*   **Database**: File System (Git-based CMS) - *Current choice, no PostgreSQL needed yet for this scale*.
*   **Styling**: CSS Modules with `lucide-react` icons.

## 4. Testing & Deploy
*   **Unit Tests**: Test Markdown parsing and API routes.
*   **E2E**: Verify Editor save flow and Mobile responsiveness.
*   **Deploy**: Vercel (Zero-config for Next.js).
