# WhereIsIt — Design System Master

> **Logic:** When building a specific page, first check `pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

**Project:** WhereIsIt
**Type:** Private Home Inventory Tracker (items, expiry dates, stock levels)
**Stack:** Next.js 16 + React 19 + Tailwind CSS 3 + Firebase + lucide-react
**Theme:** Dark-only — warm earth palette

---

## Brand Voice

Utility-first, warm, trustworthy, precise. Like a well-organized toolbox — everything has a place and you can find it instantly.

---

## Color Palette

All colors are defined in `tailwind.config.ts` under the `warm` key. Use Tailwind classes only (`text-warm-copper`, `bg-warm-card`, etc.) — never raw hex in components.

| Token | Hex | Usage |
|-------|-----|-------|
| `warm-bg` | `#111311` | Page background |
| `warm-card` | `#1E201C` | Card/surface background |
| `warm-border` | `#332E22` | Borders, dividers, subtle lines |
| `warm-copper` | `#D8A25E` | Primary accent, icons, links, CTAs |
| `warm-sage` | `#7A9D7E` | Success states, secondary decoration |
| `warm-cream` | `#F5F0E8` | Primary text, headings |
| `warm-greige` | `#9C9589` | Secondary/muted text |
| `warm-mustard` | `#E6B037` | Warning, expiring-soon, orange tone |
| `warm-rust` | `#CD5C5C` | Danger, expired, destructive actions |

### Color Semantics

| Purpose | Token |
|---------|-------|
| Page background | `bg-warm-bg` |
| Card/surface | `bg-warm-card` or `bg-warm-bg/70` with `.panel` |
| Borders | `border-warm-border` |
| Primary text | `text-warm-cream` |
| Secondary text | `text-warm-greige` |
| Links / CTAs / active icons | `text-warm-copper` |
| Warning / expiring | `text-warm-mustard` |
| Danger / expired / destructive | `text-warm-rust` |
| Success / consumption | `text-warm-sage` |
| Focus ring | `ring-warm-copper/50` |

### Surface Opacity

| Layer | Style |
|-------|-------|
| Card surface | `bg-warm-card/85 backdrop-blur` with `.panel` class |
| Elevated surface | `.panel` = `rounded-xl border border-warm-border bg-warm-card/85 shadow-glow backdrop-blur` |
| Modal/drawer backdrop | `bg-black/70 backdrop-blur` |
| Hover state (button/card) | `hover:bg-[#24251F]` |
| Disabled state | `opacity-55` |

### Background Gradient

```css
body {
  background:
    radial-gradient(circle at top left, rgba(216, 162, 94, 0.12), transparent 34rem),
    linear-gradient(180deg, #111311 0%, #171711 100%);
}
```

---

## Typography

| Property | Value |
|----------|-------|
| Font family | `Inter, ui-sans-serif, system-ui, sans-serif` |
| Body size | `16px` (1rem) base |
| Body weight | `400` |
| Line height | `1.5` (body), `1.25` (headings) |

### Type Scale

| Level | Size | Weight | Tracking |
|-------|------|--------|----------|
| h1 (page title) | `text-2xl` (24px) | `font-semibold` | `tracking-tight` |
| h2 (section) | `text-lg` (18px) | `font-semibold` | — |
| Section label | `text-sm font-medium` | — | — |
| Body | `text-sm` (14px) | — | — |
| Secondary text | `text-xs` (12px) | — | — |
| Badge/label | `text-xs font-medium` | — | — |

---

## Spacing System

Use Tailwind's built-in spacing scale (4px base). Common patterns:

| Context | Spacing |
|---------|---------|
| Page content padding (mobile) | `px-4 py-6` |
| Page content (sm+) | `sm:px-6 lg:px-8` |
| Section to section | `space-y-6` |
| Card to card in list | `gap-3` |
| Grid columns | `gap-4` or `gap-6` |
| Icon to text | `gap-2` |
| Header content | `gap-4` |
| Panel padding | `p-5` (`sm:p-6` for forms) |
| Section bottom border | `pb-2` + `border-b border-warm-border/50` |

### Safe Area Handling
- Bottom navigation: use `pb-24 lg:pb-0` + `pb-[calc(24*4px+env(safe-area-inset-bottom,0px))]` for notched devices
- Sticky header: `top-0` — use padding for content clearance
- Fixed elements must not overlap system UI (status bar, gesture bar)

---

## Animation Tokens

All animations defined in `tailwind.config.ts`:

| Animation | Duration | Easing | Use |
|-----------|----------|--------|-----|
| `animate-fade-in` | 300ms | ease-out | Overlay appear |
| `animate-fade-in-up` | 350ms | ease-out | Page content, card list items |
| `animate-slide-in-right` | 350ms | ease-out | Toast enter |
| `animate-slide-out-right` | 250ms | ease-in | Toast exit |
| `animate-slide-in-left` | 300ms | ease-out | Drawer enter |
| `animate-slide-out-left` | 200ms | ease-in | Drawer exit |
| `animate-scale-in` | 300ms | ease-out | Modal/sheet appear |
| `animate-shimmer` | 1.5s | linear | Skeleton loading |

### Rules
- Micro-interactions: 150-300ms
- Exit animations faster than enter (60-70% of enter duration)
- Use `transform` and `opacity` only — never animate width/height
- Respect `prefers-reduced-motion`
- Stagger entrance: 30-50ms per item via `style={{ animationDelay }}` (works because Tailwind animation classes apply to native CSS `animation` shorthand)
- Do NOT use `animationDirection: "reverse"` hack for exit animations — use dedicated exit animation classes instead

---

## Component Patterns

### Buttons (`components/ui/Button.tsx`)

| Variant | Classes |
|---------|---------|
| Primary | `bg-warm-copper text-warm-bg hover:bg-[#E7B877] hover:scale-[1.02] active:scale-[0.98]` |
| Secondary | `border border-warm-border bg-[#24251F] text-warm-cream hover:bg-warm-border` |
| Ghost | `text-warm-cream/85 hover:bg-[#24251F] hover:text-warm-cream` |
| Danger | `bg-warm-rust text-warm-cream hover:bg-[#DD7474]` |
| Base | `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150` |
| Disabled | `disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100` |

### Cards (`ItemCard`, general)

- `.panel` class: `rounded-xl border border-warm-border bg-warm-card/85 shadow-glow backdrop-blur`
- Hover: `hover:scale-[1.01] hover:border-warm-copper/50 hover:shadow-glow`
- Animation: `transition-all duration-250 will-change-transform`
- Focus visible: `focus-visible:ring-2 focus-visible:ring-warm-copper/50`
- Image container: `relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-warm-border bg-warm-bg`
- Quantity badge: `rounded-full bg-warm-bg px-2.5 py-1 text-xs font-medium text-warm-cream/85`

### Form Inputs

- `.input-shell` class: `w-full rounded-xl border border-warm-border bg-warm-bg/70 px-4 py-3 text-warm-cream outline-none transition placeholder:text-warm-greige/60 focus:border-warm-copper focus:ring-2 focus:ring-warm-copper/20`
- `.field-label` class: `text-sm font-medium text-warm-cream`
- Checkbox: `h-5 w-5 accent-warm-copper`
- Leading icon: `pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-greige/75` with `pl-10` on input
- Date input: `type="date"` with `.input-shell`
- Select: use `.input-shell` with `<select>`
- Textarea: `.input-shell min-h-32 resize-y`

### Modals & Sheets

- Overlay: `fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur`
- Content: `.panel w-full max-w-md p-5 animate-scale-in`
- Close button: `rounded-lg p-2 text-warm-greige transition-all duration-150 hover:bg-[#24251F] hover:text-warm-cream hover:rotate-90`
- Exit animation: apply `animate-scale-in` with `animation-direction: reverse` is NOT recommended. Instead, use a state machine (`closed | open | leaving`) and switch animation classes.

### Badges

- Base: `inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium`
- Warning (mustard): `border-warm-mustard/30 bg-warm-mustard/12 text-warm-mustard`
- Danger (rust): `border-warm-rust/30 bg-warm-rust/12 text-warm-rust`
- Neutral: `border-warm-border bg-[#24251F] text-warm-cream/85`
- Room/category chip: `rounded-full bg-warm-card px-2.5 py-1 text-xs text-warm-greige`
- Finished badge: `rounded-full bg-[#24251F] px-2 py-1 text-xs text-warm-greige`

### Toast/Notifications

- Position: `fixed right-4 top-4 z-50 w-[calc(100vw-2rem)] max-w-sm`
- Enter: `animate-slide-in-right`
- Exit: `animate-slide-out-right`
- Success: `border-warm-sage/30 bg-warm-sage/15 text-warm-sage`
- Error: `border-warm-rust/30 bg-warm-rust/15 text-warm-rust`
- Info: `border-warm-border bg-warm-card/95 text-warm-cream`

### PageTransition Wrapper

- Purpose: Wraps page content with entrance animation
- Class: `animate-fade-in-up`
- Usage: Wrap top-level content in each page client component
- Do NOT set animation delay on the PageTransition wrapper itself
- Do NOT add `will-change: transform` to PageTransition — it creates a CSS containing block that traps `position: fixed` descendants (modals, toasts) relative to the wrapper instead of the viewport

### FilterBar (Chip-style Tabs)

- Active state: `border-warm-copper/60 bg-warm-copper/15 text-warm-copper`
- Inactive state: `border-warm-border bg-transparent text-warm-greige hover:border-warm-copper/40 hover:text-warm-cream`
- Count badge: inline `span` with `tabular-nums`
- Base: `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150`
- Container: `flex flex-wrap gap-2` with `role="tablist"`

### Search Results

- Result row: `.panel flex items-center gap-4 p-3`
- Thumbnail: `relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-warm-bg`
- Staggered entrance: `style={{ animationDelay: \`${index * 40}ms\` }}` on each result link

### Item Form (`ItemForm`)

- Narrow form: `mx-auto max-w-3xl`
- Panel grid: `.panel grid gap-5 p-5 sm:grid-cols-2 sm:p-6`
- Full-width fields: `sm:col-span-2`
- Photo upload: dashes border `rounded-xl border border-dashed border-warm-border bg-warm-bg/70` with hover state
- Private toggle card: `rounded-xl border border-warm-border bg-warm-bg/50 p-4` with flex layout
- Action row: `flex justify-end gap-3` (Cancel + Save)

### Auth Pages (`/login`, `/signup`)

- Centered card layout: `flex min-h-screen items-center justify-center`
- Staggered entrance animations (icon → title → subtitle → form) using delay classes
- Icon in copper-toned box: `border border-warm-copper/30 bg-warm-copper/12`
- Inputs have leading icons with `pl-10`
- Full-width submit button
- AutoComplete attributes: `autoComplete="email"`, `autoComplete="current-password"`, `autoComplete="new-password"`, `autoComplete="name"`

### Vault (`/vault`)

- Lock state: centered unlock card with PIN modal — max-width `max-w-xl`
- Unlocked: title + lock button + search + item grid
- No PIN state: guidance to set up in Profile (mustard-toned guidance card)
- Search input: `.input-shell pl-12` with leading icon

---

## Layout Patterns

### Page Shell (`AppShell`)
- Sticky header with backdrop blur, search bar, nav
- Bottom tab bar on mobile (hidden lg+)
- Side drawer for secondary nav (Vault, Profile)
- Content max-width: `max-w-7xl`
- Safe area: bottom nav needs `pb-[calc(96px+env(safe-area-inset-bottom,0px))]` for content clearance

### Page Body
- Start with `PageTransition` (fade-in-up)
- Header: page title + description + action button (flex row on sm+)
- Content sections with `space-y-6`
- Two-column layouts: `grid gap-6 lg:grid-cols-[1fr_22rem]`
- Max-width for narrow pages: `mx-auto max-w-2xl` or `max-w-3xl`
- Error state: `.panel p-5 text-warm-rust`
- Empty state: `.panel p-6 text-sm text-warm-greige`

### Grid Cards
- 3-column stat grid: `grid gap-4 md:grid-cols-3`
- 2-column option grid: `grid gap-3 sm:grid-cols-2`
- Item list: `grid gap-3`

### Dashboard Sections
- Section header: `flex items-center gap-2 border-b border-warm-border/50 pb-2` with copper icon + heading
- Consumption reminder section: `.panel border-warm-mustard/30 bg-warm-mustard/10 p-5` with mustard icon

---

## Touch Targets

| Element | Min Size | Notes |
|---------|----------|-------|
| Buttons | `min-h-11` (44px) | All variants |
| Bottom nav items | `min-h-14` (56px) | Mobile tab bar |
| Nav links | `min-h-10` (40px) | Desktop nav |
| Avatar | `h-10 w-10` (40px) | Profile circle |
| Pin digit | `h-14 w-14` (56px) | PIN keypad |
| Close/icon buttons | `p-2` (32px + icon) | With padding, should aim for 44x44 via hit area |

---

## Accessibility Requirements

- Focus-visible rings: `2px solid #D8A25E` with `outline-offset: 2px`
- All interactive elements must be keyboard-navigable
- Icon-only buttons need `aria-label`
- Form inputs need associated labels with proper `autoComplete` attributes:
  - `autoComplete="email"` for email fields
  - `autoComplete="current-password"` for login password
  - `autoComplete="new-password"` for signup password
  - `autoComplete="name"` for name fields
- Toast messages: use `aria-live="polite"` region
- Color not used as only indicator (add icons)
- Support system font scaling — no fixed px for text
- Skip-to-content link recommended for keyboard users
- Form errors should use `aria-live` region or `role="alert"`
- Focus order must match visual order
- All icons in interactive elements must have accessible labels or be accompanied by text

---

## Common UI Patterns

### Loading States
- Skeleton variant: `.panel overflow-hidden p-6` with shimmer lines
- Spinner variant: `.panel flex min-h-48 items-center justify-center gap-2 text-warm-greige` with `Loader2` icon

### Empty States
- Always provide guidance + action, never blank
- Centered layout with icon in copper-toned circle
- Two-link grid for options: `grid gap-3 sm:grid-cols-2`

### Error States
- Use `.panel p-5 text-warm-rust` for inline errors
- Use toast for transient errors (network failures, action failures)
- Errors should provide a recovery path (retry button, refresh, or back navigation)

---

## Anti-Patterns (Do NOT Use)

- ❌ Emojis as icons — use lucide-react SVG icons
- ❌ Raw hex colors in components — use Tailwind warm-* classes
- ❌ Layout-shifting hover effects (scale transforms that overflow)
- ❌ Instant state changes without transitions
- ❌ Placeholder-only form labels (use Field component)
- ❌ Blocking user interaction during loading (use skeleton/spinner instead)
- ❌ Blank empty states — always provide guidance + action
- ❌ Horizontal scroll on mobile
- ❌ Fixed `100vh` — use `min-h-dvh` or `min-h-screen`
- ❌ `animationDirection: "reverse"` for exit animations — use dedicated exit classes
- ❌ `children` length checks that don't handle React fragments — use `React.Children.count` instead
- ❌ Missing `autoComplete` attributes on auth forms
- ❌ Inline styles where Tailwind utilities exist
- ❌ Hardcoded z-index values — maintain a consistent z-index scale
