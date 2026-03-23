# MeetingMind Design System

## Brand Personality

**Core Identity:** Professional yet approachable. Trust-focused. We help people *keep* their promises — that requires a design that feels reliable, clear, and human.

- **Professional:** Clean SaaS aesthetic, not flashy. We're a tool people use at work.
- **Approachable:** Warm accents, friendly copy, nothing cold or corporate.
- **Trust-focused:** High contrast, clear hierarchy, no ambiguity in interactions.

---

## Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `primary-500` | `#2563EB` | Primary actions, links, active states |
| `primary-600` | `#1D4ED8` | Primary button hover |
| `primary-700` | `#1E40AF` | Primary button active |
| `primary-50` | `#EFF6FF` | Primary backgrounds, highlights |
| `primary-100` | `#DBEAFE` | Light backgrounds, badges |

### Secondary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `secondary-500` | `#6366F1` | Secondary actions, accents |
| `secondary-600` | `#4F46E5` | Secondary hover |
| `secondary-50` | `#EEF2FF` | Secondary backgrounds |

### Accent / Highlight
| Token | Hex | Usage |
|-------|-----|-------|
| `accent-500` | `#F59E0B` | Attention grabbers, important callouts |
| `accent-600` | `#D97706` | Accent hover |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `success-500` | `#10B981` | Fulfilled status, positive states |
| `success-50` | `#ECFDF5` | Success backgrounds |
| `warning-500` | `#F59E0B` | Warning states, approaching deadlines |
| `warning-50` | `#FFFBEB` | Warning backgrounds |
| `error-500` | `#EF4444` | Error states, overdue, danger actions |
| `error-50` | `#FEF2F2` | Error backgrounds |
| `info-500` | `#3B82F6` | Info states |
| `info-50` | `#EFF6FF` | Info backgrounds |

### Neutral Grays
| Token | Hex | Usage |
|-------|-----|-------|
| `gray-900` | `#111827` | Primary text |
| `gray-700` | `#374151` | Secondary text |
| `gray-500` | `#6B7280` | Muted text, placeholders |
| `gray-400` | `#9CA3AF` | Disabled text |
| `gray-300` | `#D1D5DB` | Borders, dividers |
| `gray-200` | `#E5E7EB` | Subtle borders |
| `gray-100` | `#F3F4F6` | Card backgrounds |
| `gray-50` | `#F9FAFB` | Page background |
| `white` | `#FFFFFF` | Cards, modals, inputs |

---

## Typography

### Font Family
**Primary:** Inter (Google Fonts)  
Fallback: system-ui, -apple-system, sans-serif

**Monospace (for code/data):** JetBrains Mono  
Fallback: Consolas, monospace

### Type Scale
| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| `h1` | 2.25rem (36px) | 700 | 1.2 | -0.02em |
| `h2` | 1.875rem (30px) | 700 | 1.25 | -0.01em |
| `h3` | 1.5rem (24px) | 600 | 1.3 | 0 |
| `h4` | 1.25rem (20px) | 600 | 1.4 | 0 |
| `h5` | 1.125rem (18px) | 600 | 1.4 | 0 |
| `h6` | 1rem (16px) | 600 | 1.5 | 0 |
| `body-lg` | 1.125rem (18px) | 400 | 1.6 | 0 |
| `body` | 1rem (16px) | 400 | 1.6 | 0 |
| `body-sm` | 0.875rem (14px) | 400 | 1.5 | 0 |
| `small` | 0.75rem (12px) | 400 | 1.4 | 0.01em |
| `caption` | 0.6875rem (11px) | 500 | 1.3 | 0.02em |

---

## Spacing System

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0 | No space |
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Icon gaps, tight padding |
| `space-3` | 12px | Input padding |
| `space-4` | 16px | Standard padding |
| `space-5` | 20px | Card padding |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Large gaps |
| `space-10` | 40px | Section padding |
| `space-12` | 48px | Hero spacing |
| `space-16` | 64px | Large sections |
| `space-20` | 80px | Page sections |
| `space-24` | 96px | Hero sections |

### Component Spacing
- **Button padding:** 12px 20px (md), 8px 16px (sm), 16px 24px (lg)
- **Card padding:** 20px–24px
- **Input padding:** 12px 16px
- **Gap between cards:** 16px (mobile), 24px (desktop)

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Badges, small elements |
| `radius-md` | 8px | Buttons, inputs, cards |
| `radius-lg` | 12px | Modals, large cards |
| `radius-xl` | 16px | Hero sections |
| `radius-full` | 9999px | Avatars, pills, toggles |

---

## Shadows / Elevation

### Light Mode
| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift, inputs |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)` | Cards, dropdowns |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)` | Modals, elevated cards |
| `shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)` | Hero elements |

### Dark Mode
| Token | Value |
|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.4)` |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.5)` |
| `shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.6)` |

---

## Motion & Animation

### Durations
| Token | Value | Usage |
|-------|-------|-------|
| `duration-instant` | 75ms | Micro-interactions (checkbox) |
| `duration-fast` | 150ms | Hover states, toggles |
| `duration-normal` | 200ms | Standard transitions |
| `duration-slow` | 300ms | Page transitions, modals |
| `duration-slower` | 500ms | Loading states |

### Easing
| Token | Value | Usage |
|-------|-------|-------|
| `ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General transitions |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements entering |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements leaving |
| `ease-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Playful feedback |

### Animation Patterns
- **Hover:** Scale 1.02 + shadow lift, 150ms ease-out
- **Click/Active:** Scale 0.98, 75ms ease-in
- **Focus ring:** 2px primary-500 offset, 150ms
- **Modal enter:** Fade in + scale from 0.95, 200ms ease-out
- **Modal exit:** Fade out + scale to 0.95, 150ms ease-in
- **Toast enter:** Slide in from top-right, 300ms ease-out
- **Toast exit:** Fade out + slide up, 200ms ease-in
- **Skeleton loading:** Pulse opacity 0.5→1, 1.5s infinite
- **Spinner:** Rotate 360deg, 750ms linear infinite
- **Toggle:** Translate thumb, 200ms ease-in-out
- **Progress bar:** Width transition, 300ms ease-out

---

## Z-Index Scale
| Token | Value | Usage |
|-------|-------|-------|
| `z-0` | 0 | Default |
| `z-10` | 10 | Sticky headers |
| `z-20` | 20 | Dropdowns |
| `z-30` | 30 | Modals (backdrop: z-40) |
| `z-40` | 40 | Modal backdrop |
| `z-50` | 50 | Toast notifications |
| `z-auto` | auto | Stacking context |

---

## Dark Mode (Optional Enhancement)

When implementing dark mode:
- Background: `gray-900` (#111827)
- Surface: `gray-800` (#1F2937)
- Text: `gray-100` (#F3F4F6)
- Borders: `gray-700` (#374151)
- Keep primary/accent colors same hue, adjust lightness

---

## Accessibility

- **Contrast ratios:** All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- **Focus states:** Always visible, 2px primary-500 ring with 2px offset
- **Touch targets:** Minimum 44x44px on mobile
- **Motion:** Respect `prefers-reduced-motion` — disable animations
- **Screen readers:** Proper ARIA labels, semantic HTML
