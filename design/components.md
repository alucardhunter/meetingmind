# MeetingMind Component Inventory

Complete specification for every reusable UI component.

---

## Button

### Variants

| Variant | Use Case | Colors |
|---------|----------|--------|
| `primary` | Main actions (Submit, Start Free) | bg: primary-500, hover: primary-600, active: primary-700, text: white |
| `secondary` | Secondary actions (Cancel, Back) | bg: gray-100, hover: gray-200, text: gray-700 |
| `ghost` | Tertiary actions (View All, Export) | bg: transparent, hover: gray-100, text: gray-600 |
| `danger` | Destructive actions (Delete) | bg: error-500, hover: error-600, text: white |

### Sizes

| Size | Padding | Font Size | Use Case |
|------|---------|-----------|----------|
| `sm` | 8px 16px | 14px | Nav links, inline actions |
| `md` | 12px 20px | 16px | Default buttons |
| `lg` | 16px 24px | 18px | Hero CTAs, primary actions |

### States

| State | Appearance |
|-------|------------|
| Default | Normal colors as per variant |
| Hover | Slightly darker bg, cursor: pointer |
| Active | Darker bg, scale: 0.98 |
| Disabled | opacity: 0.5, cursor: not-allowed |
| Loading | Spinner replaces text, disabled interaction |

### Behaviors
- Hover: 150ms ease-out transition
- Active: 75ms ease-in, scale 0.98
- Disabled: No pointer events
- Loading: Replace text with spinner, maintain button width

### Icon Support
- Left icon: 8px gap between icon and text
- Right icon: 8px gap, text then icon
- Icon-only: Square aspect ratio, centered icon

---

## Badge

### Variants

| Variant | Use Case | Colors |
|---------|----------|--------|
| `status-open` | Open commitment | bg: primary-100, text: primary-700 |
| `status-fulfilled` | Fulfilled commitment | bg: success-100, text: success-700 |
| `status-overdue` | Overdue commitment | bg: error-100, text: error-700 |
| `status-processing` | Meeting processing | bg: warning-100, text: warning-700 |
| `type-commitment` | Commitment label | bg: secondary-100, text: secondary-700 |
| `type-meeting` | Meeting label | bg: gray-100, text: gray-700 |
| `value` | Dollar value | bg: accent-100, text: accent-700 |
| `client` | Client name | bg: gray-100, text: gray-700 |

### Sizes
- `sm`: padding 2px 8px, font-size 11px
- `md`: padding 4px 12px, font-size 12px (default)
- `lg`: padding 6px 16px, font-size 14px

### Behaviors
- No interactive states (non-clickable badges)
- Clickable variant: hover with cursor: pointer, slight bg darken

---

## Card

### Variants

#### Commitment Card
| Element | Details |
|---------|---------|
| Container | white bg, shadow-md, radius-lg, 20px padding |
| Left border | 4px colored by status (primary/success/error) |
| Content | commitment text, owner, deadline, value |
| Actions | kebab menu top-right |

#### Meeting Card
| Element | Details |
|---------|---------|
| Container | white bg, shadow-sm, radius-md, 16px padding |
| Content | title, client, date, commitment count badge |
| Hover | shadow-md, translate -2px |

#### Stat Card
| Element | Details |
|---------|---------|
| Container | white bg, shadow-sm, radius-lg, 20px padding |
| Icon | 48px circle with colored bg |
| Number | h2, bold, gray-900 |
| Label | body-sm, gray-500 |

#### Feature Card (Landing)
| Element | Details |
|---------|---------|
| Container | white bg, shadow-md, radius-lg, 24px padding |
| Icon | 48px circle, primary-50 bg, centered |
| Title | h4, gray-900 |
| Description | body-sm, gray-600 |

#### Pricing Card
| Element | Details |
|---------|---------|
| Container | white bg, shadow-md, radius-lg, 24px padding |
| Popular state | primary-500 border, "Most Popular" badge |
| Price | h2, gray-900 |
| Features list | checkmarks + text |

### States
| State | Appearance |
|-------|------------|
| Default | Normal shadow, normal bg |
| Hover | shadow-lg, translate Y -2px |
| Active/Selected | Ring border, shadow-md |
| Disabled | opacity: 0.6, grayscale |
| Loading | Skeleton pulse animation |

### Behaviors
- Hover transition: 200ms ease-out
- Click feedback: scale 0.99
- Card grid: gap 16px mobile, 24px desktop

---

## Input

### Variants

| Variant | Use Case |
|---------|----------|
| `text` | General text input |
| `email` | Email address |
| `password` | Password (with toggle visibility) |
| `date` | Date picker |
| `search` | Search with icon |
| `textarea` | Multi-line text |

### Anatomy

```
┌────────────────────────────────────┐
│ Label (body-sm, gray-700)          │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ 👁️ (icon, if applicable)       │ │
│ │                                │ │
│ │ Input field                    │ │
│ └────────────────────────────────┘ │
│ Helper text (caption, gray-500)   │
└────────────────────────────────────┘
```

### States

| State | Appearance |
|-------|------------|
| Default | border: gray-300, bg: white |
| Focus | border: primary-500, ring: primary-100 |
| Filled | Same as default |
| Error | border: error-500, ring: error-100, error message below |
| Disabled | bg: gray-100, cursor: not-allowed |

### Sizes
- `sm`: padding 8px 12px, font-size 14px
- `md`: padding 12px 16px, font-size 16px (default)
- `lg`: padding 16px 20px, font-size 18px

### Behaviors
- Focus transition: 150ms ease-out
- Error message: fade in, 200ms
- Label animation: float up on focus/filled (for floating labels)

---

## Select

### Anatomy
Same as Input with dropdown arrow.

| Element | Details |
|---------|---------|
| Container | Same as Input |
| Arrow | Chevron down icon, gray-400, right side |
| Dropdown | white bg, shadow-lg, radius-md, max-height 300px scrollable |
| Option | Padding 12px 16px, hover: gray-50 |
| Selected | bg: primary-50, text: primary-700, checkmark |

### States
- Default, focus, open, disabled — same as Input
- Open: shadow-lg dropdown appears, 200ms ease-out

### Behaviors
- Open: slide down + fade in, 200ms
- Close: slide up + fade out, 150ms
- Click outside: close dropdown
- Keyboard: arrow keys navigate, enter selects, esc closes

---

## Toggle

### Anatomy
| Element | Details |
|---------|---------|
| Track | 44px × 24px, rounded-full |
| Thumb | 20px circle, white, shadow-sm |
| Icon (optional) | Circle (open) or checkmark (on) in thumb |

### States

| State | Track | Thumb | Icon |
|-------|-------|-------|------|
| Off/Open | bg: gray-300 | left position | empty circle |
| On/Fulfilled | bg: success-500 | right position | checkmark |
| Disabled | opacity: 0.5 | — | — |
| Hover | slight brightness | — | — |

### Behaviors
- Transition: 200ms ease-in-out
- Click: toggle state, animate thumb slide
- Disabled: no pointer events

---

## Avatar

### Variants

| Variant | Use Case |
|---------|----------|
| `initials` | Default, show first + last initial |
| `image` | If user has uploaded photo |
| `icon` | Fallback for no user |

### Sizes

| Size | Dimension | Font Size |
|------|-----------|-----------|
| `xs` | 24px | 10px |
| `sm` | 32px | 12px |
| `md` | 40px | 14px |
| `lg` | 48px | 16px |
| `xl` | 64px | 20px |

### Colors (for initials)
Rotate through: blue, purple, green, orange, pink, teal  
Deterministic based on name hash.

### States
- Default: colored bg with initials
- Image: rounded image
- Hover (if clickable): ring outline
- Loading: skeleton pulse

---

## Modal

### Anatomy

```
┌────────────────────────────────────────────┐
│  Backdrop (black 50% opacity)              │
│  ┌────────────────────────────────────────┐ │
│  │ Header                                │ │
│  │ Title (h4)              X (close)      │ │
│  ├────────────────────────────────────────┤ │
│  │ Body (scrollable)                      │ │
│  │                                        │ │
│  │                                        │ │
│  ├────────────────────────────────────────┤ │
│  │ Footer                                 │ │
│  │ [Cancel]                    [Confirm]  │ │
│  └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

### Sizes

| Size | Max Width | Use Case |
|------|-----------|----------|
| `sm` | 400px | Confirm dialogs |
| `md` | 500px | Forms |
| `lg` | 700px | Content view |
| `xl` | 900px | Large content |
| `full` | 95vw | Edge-to-edge |

### States
| State | Appearance |
|-------|------------|
| Opening | Fade in backdrop 200ms, modal scale 0.95→1 + fade 200ms |
| Open | Fully visible |
| Closing | Fade out 150ms, scale 0.95 |

### Behaviors
- Backdrop click: close modal
- X button: close modal
- Escape key: close modal
- Focus trap: tab cycles within modal
- Body scroll lock when open

---

## Toast / Alert

### Variants

| Variant | Icon | Colors |
|---------|------|--------|
| `success` | ✓ checkmark | bg: success-50, border: success-200, icon: success-500 |
| `warning` | ⚠️ alert | bg: warning-50, border: warning-200, icon: warning-500 |
| `error` | ✕ alert circle | bg: error-50, border: error-200, icon: error-500 |
| `info` | ℹ️ info | bg: info-50, border: info-200, icon: info-500 |

### Anatomy

| Element | Details |
|---------|---------|
| Icon | 20px, left side |
| Message | body-sm, gray-700 |
| Close | X button, right side |
| Optional action | Text button, e.g., "Undo" |

### Position
- Desktop: top-right, 24px from edges
- Mobile: top-center, 16px from edges

### Behaviors
- Enter: slide in from right + fade, 300ms ease-out
- Duration: auto-dismiss after 4s (configurable)
- Hover: pause auto-dismiss timer
- Exit: fade out + slide up, 200ms ease-in
- Stack: multiple toasts stack vertically, 8px gap

---

## Spinner

### Variants

| Variant | Size | Use Case |
|---------|------|----------|
| `sm` | 16px | Inline, buttons |
| `md` | 24px | Default, cards |
| `lg` | 40px | Page loading |
| `xl` | 64px | Full-page overlay |

### Appearance
- Circular arc, not full circle
- Stroke width: 2px (sm/md), 3px (lg/xl)
- Color: primary-500 (or currentColor)

### Animation
- Rotate 360deg
- Duration: 750ms
- Easing: linear
- Infinite loop

### Usage
- Replace button text when loading
- Centered in container for section loading
- Full overlay with white 60% opacity backdrop for page loading

---

## EmptyState

### Anatomy

```
┌─────────────────────────────────────┐
│                                     │
│           [Icon - 64px]             │
│                                     │
│      Headline (h4, gray-700)        │
│                                     │
│    Message (body-sm, gray-500)      │
│                                     │
│     [Primary Button]                │
│                                     │
└─────────────────────────────────────┘
```

### Variants (by context)

| Context | Icon | Headline | Message |
|---------|------|----------|---------|
| No meetings | 🎙️ | "No meetings yet" | "Upload a recording or connect your calendar." |
| No commitments | 📋 | "No commitments yet" | "Commitments from your meetings will appear here." |
| No search results | 🔍 | "No results found" | "Try adjusting your search or filters." |
| No clients | 👥 | "No clients yet" | "Add your first client to get started." |

### Behaviors
- Centered in container
- CTA button optional
- Subtle, not alarming

---

## UploadZone

### Anatomy

```
┌─────────────────────────────────────────┐
│                                         │
│         📤 (icon - 48px, gray-400)      │
│                                         │
│     Drag & drop your audio file         │
│     or click to browse                  │
│                                         │
│     MP3, M4A, WAV, MP4 supported         │
│                                         │
└─────────────────────────────────────────┘
```

### States

| State | Appearance |
|-------|------------|
| Default | Dashed border gray-300, bg: gray-50 |
| Hover | Dashed border primary-500, bg: primary-50 |
| Dragging (over) | Solid border primary-500, bg: primary-50, scale: 1.02 |
| Uploading | Progress bar, file name, cancel button |
| Success | Solid border success-500, bg: success-50, checkmark icon |
| Error | Solid border error-500, bg: error-50, error message |

### Behaviors
- Click: open file picker
- Drag over: visual feedback, prevent default
- Drop: process file
- File type validation: show error for unsupported types
- Size limit: show error if file too large (e.g., > 500MB)

---

## AudioPlayer

### Anatomy

```
┌─────────────────────────────────────────────────────┐
│  ⏮️   ▶️/⏸️   ⏭️   ════════════●═══   12:34/45:00  🔊 │
└─────────────────────────────────────────────────────┘
```

| Element | Details |
|---------|---------|
| Play/Pause | 48px circle, primary-500 bg, white icon |
| Skip Back/Forward | 10s, gray-500 icon |
| Progress Bar | Full width, gray-200 track, primary-500 fill, draggable thumb |
| Time Display | Monospace, "current / total" |
| Volume | Speaker icon + optional slider |
| Download | Optional, right side |

### States

| State | Appearance |
|-------|------------|
| Default | Paused, play icon |
| Playing | Play icon replaced by pause, animated waveform optional |
| Loading | Spinner in play button area |
| Error | Error message, retry button |

### Behaviors
- Click play: start audio, icon → pause
- Click pause: pause audio, icon → play
- Drag progress: seek on release
- Click progress: jump to position
- Volume: click icon toggles mute, drag adjusts
- Keyboard: space = play/pause

---

## StatsCard

### Anatomy

```
┌─────────────────────────────────────┐
│  ┌──────┐                          │
│  │ Icon │  23                      │
│  └──────┘  Open Commitments         │
└─────────────────────────────────────┘
```

### Elements

| Element | Details |
|---------|---------|
| Icon Container | 40px × 40px circle, colored bg per metric type |
| Number | h2 size, bold, gray-900 |
| Label | body-sm, gray-500 |
| Trend (optional) | ↑/↓ arrow + percentage, green/red |

### Variants by Metric

| Metric | Icon | Icon BG Color |
|--------|------|---------------|
| Total | 📋 clipboard | gray-100, gray-600 |
| Open | 🔵 circle | primary-50, primary-500 |
| Fulfilled | ✅ check circle | success-50, success-500 |
| Overdue | ⚠️ alert triangle | error-50, error-500 |

### States
- Default: shadow-sm
- Hover: shadow-md, translate Y -2px
- Loading: skeleton pulse for number and label

### Behaviors
- Hover transition: 200ms ease-out
- Clickable variant: cursor pointer, hover effect

---

## Responsive Behavior

All components use Tailwind responsive prefixes:
- `sm:` (640px+)
- `md:` (768px+)
- `lg:` (1024px+)
- `xl:` (1280px+)

Key responsive patterns:
- Grid: 1 col mobile → 2 col tablet → 3-4 col desktop
- Sidebar: hidden → hamburger (mobile) → visible (desktop)
- Cards: stacked (mobile) → grid (desktop)
- Modals: full-screen (mobile) → centered (desktop)
- Tables: card view (mobile) → row view (desktop)

---

## Accessibility

| Component | Requirements |
|-----------|--------------|
| Button | `type="button"` (or submit/reset), aria-label if icon-only |
| Input | Associated `<label>`, aria-describedby for errors |
| Select | role="listbox", aria-selected for options |
| Toggle | role="switch", aria-checked |
| Modal | role="dialog", aria-modal, focus trap |
| Toast | role="alert" or "status", aria-live |
| Loading | aria-busy="true", aria-label="Loading" |
| All | Visible focus indicators (ring) |

---

## Dark Mode

All components support dark mode via Tailwind `dark:` classes:

| Element | Light | Dark |
|---------|-------|------|
| Background | white | gray-800 |
| Text | gray-900 | gray-100 |
| Border | gray-200 | gray-700 |
| Card bg | white | gray-800 |
| Input bg | white | gray-700 |
