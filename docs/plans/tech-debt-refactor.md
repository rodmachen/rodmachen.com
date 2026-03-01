# Refactoring Plan: Readability, Maintainability & DRY

## Context

The codebase has grown through rapid feature development across multiple sessions. The biggest issue is significant CSS and markup duplication across 4 listing pages (archive, topics/[tag], [category]/index, byline/index), which all render nearly identical post lists with ~90% identical styles. Date formatting, type definitions, and tag styles are also repeated. This refactor consolidates duplicated code into shared components, utilities, and styles.

## Changes

### 1. Create shared `PostList.astro` component
**File:** `src/components/PostList.astro` (new)

Extract the duplicated post-list markup and styles into a reusable component. It will accept an array of items and render the date + title + subtitle + optional publication/category-badge/tags layout with all associated CSS.

**Props:**
```ts
interface Props {
  items: ListItem[];
  showCategoryBadge?: boolean;
  showTags?: boolean;
}
```

### 2. Create shared `PageHeader.astro` component
**File:** `src/components/PageHeader.astro` (new)

Extract the repeated `.page-header` markup and styles (h1 + subtitle/count) used identically across archive, topics/[tag], [category]/index, byline/index, and topics/index.

### 3. Create shared `ListItem` type and `formatDate` utility
**File:** `src/utils/posts.ts` (modify)

- Add a unified `ListItem` type replacing the duplicated `ArchiveItem` and `TagItem` types
- Add a `formatDate(date: Date): string` helper to replace the 4 identical `toLocaleDateString` calls
- Add a `postToListItem` and `bylineToListItem` helper to standardize the mapping logic duplicated across pages

### 4. Add missing CSS variables to global.css
**File:** `src/styles/global.css` (modify)

Add variables for hardcoded colors used in multiple places:
- `--color-bg-muted: #f0f0f0` (tag backgrounds in archive, PostLayout)
- `--color-bg-muted-hover: #e0e0e0` (tag hover in archive)

### 5. Simplify listing pages to use shared components
**Files to modify:**
- `src/pages/archive/[...page].astro` — Replace ~130 lines of duplicated markup+CSS with `PostList` and `PageHeader` components
- `src/pages/topics/[tag].astro` — Same (~90 lines removed)
- `src/pages/[category]/index.astro` — Same (~80 lines removed)
- `src/pages/byline/index.astro` — Same (~85 lines removed)

Each page keeps its unique data-fetching logic but delegates rendering to shared components.

### 6. Clean up content.config.ts tag transform duplication
**File:** `src/content.config.ts` (modify)

Extract the duplicated tag transform (used in both `posts` and `bylines` schemas) into a shared `tagTransform` constant.

### 7. Replace hardcoded colors with CSS variables
**Files:** `src/layouts/PostLayout.astro`, all listing pages

Replace `#f0f0f0` and `#e0e0e0` with `var(--color-bg-muted)` / `var(--color-bg-muted-hover)`.

## Files Summary

| File | Action |
|------|--------|
| `src/components/PostList.astro` | Create |
| `src/components/PageHeader.astro` | Create |
| `src/utils/posts.ts` | Modify (add types + helpers) |
| `src/styles/global.css` | Modify (add CSS variables) |
| `src/content.config.ts` | Modify (extract shared transform) |
| `src/pages/archive/[...page].astro` | Modify (use components) |
| `src/pages/topics/[tag].astro` | Modify (use components) |
| `src/pages/[category]/index.astro` | Modify (use components) |
| `src/pages/byline/index.astro` | Modify (use components) |
| `src/layouts/PostLayout.astro` | Modify (use CSS variable) |

## Verification

1. Run `npm run build` to ensure no build errors
2. Run `npm run dev` and check:
   - Homepage grid cards render correctly
   - Archive pages paginate and display all items
   - Category listing pages (newsletter, article, essay, review) show correct posts
   - Byline listing page renders with publications
   - Topic tag pages filter correctly
   - Individual post pages render with tags
3. Spot-check mobile responsive behavior at 500px breakpoint
