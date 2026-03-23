# MeetingMind Dashboard Design

## Overview
The authenticated dashboard is the core product experience. Users arrive here after login to see their meetings and commitments at a glance.

**Goal:** Get users to their commitments fast. Minimize clicks. Show status clearly.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Sidebar (fixed, 240px)  │  Main Content Area                  │
│  ─────────────────────── │  ────────────────────────────────── │
│  Logo                    │  Top Bar (search + user menu)        │
│  ─────────────────────── │  ────────────────────────────────── │
│  Navigation:             │  Page Content:                      │
│  • Dashboard             │  • Stats Row                       │
│  • Meetings              │  • Alert Banner (conditional)       │
│  • Clients                │  • Commitment Feed                 │
│  • Calendar              │  • Recent Meetings (sidebar/bottom) │
│  • Settings              │                                     │
│  ─────────────────────── │                                     │
│  User menu (bottom)      │                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Mobile (< 768px):** Sidebar collapses to hamburger menu. Single column layout.

---

## Top Bar

| Element | Details |
|---------|---------|
| Page Title | "Dashboard" — h3, gray-900 |
| Search | Input field, placeholder "Search commitments...", search icon left |
| Notifications | Bell icon with red dot if overdue exist |
| User Menu | Avatar + name + chevron → dropdown (Profile, Settings, Log out) |

**Components:** `Input` (search), `Avatar` (user), `Badge` (notification dot)

---

## Stats Row

Four metric cards in a row (2x2 on tablet, 4x1 on desktop).

| Card | Icon | Color | Example Value |
|------|------|-------|---------------|
| Total | 📋 (clipboard list) | gray-500 | 47 |
| Open | 🔵 (circle icon) | primary-500 | 23 |
| Fulfilled | ✅ (check circle) | success-500 | 19 |
| Overdue | ⚠️ (alert triangle) | error-500 | 5 |

**Card Design:**
- White background, `shadow-sm`, `radius-lg`, 20px padding
- Icon: 40px circle with colored bg (e.g., `primary-50`)
- Number: h2 size, gray-900, bold
- Label: body-sm, gray-500
- Hover: `shadow-md`, translate -2px, 200ms ease

**Components:** `StatsCard`

**StatsCard States:**
- **Default:** Normal display
- **Hover:** Elevated shadow, slight lift
- **Loading:** Skeleton pulse for number and label

---

## Overdue Alert Banner

**Condition:** Display when `overdue count > 0`.

| Element | Details |
|---------|---------|
| Background | error-50 |
| Border | 1px error-200, `radius-md` |
| Icon | ⚠️ alert triangle in error-500 |
| Message | "You have X overdue commitments" — body, error-700 |
| CTA | "View Overdue" — ghost button, error-600 text, error-500 hover |

**Layout:** Full-width, above commitment feed, 16px margin bottom.

**Components:** `Alert` (warning variant), `Button` (ghost)

---

## Commitment Feed

**Primary content area.** Scrollable list of commitments.

### Section Header
- Title: "Recent Commitments" — h4
- Filter dropdown (right): "All Status" / "Open" / "Fulfilled" / "Overdue"
- Sort dropdown (right): "Newest" / "Deadline" / "Client"

### Commitment Item Row

| Element | Details |
|---------|---------|
| Status Toggle | Left side: toggle switch (open=blue, fulfilled=green) |
| Commitment Text | Truncated to 2 lines, body, gray-900 |
| Client Name | Small badge, gray-200 bg, gray-700 text |
| Deadline | Icon + date, gray-500 (red if overdue) |
| $ Value | Badge if exists, accent-500 bg, dark text |
| Actions | "..." kebab menu (edit, delete, view meeting) |

**Row Design:**
- White background, `shadow-sm`, `radius-md`
- Padding: 16px
- Border-bottom: 1px gray-100
- Hover: gray-50 background
- Gap between items: 8px

**Components:** `Toggle`, `Badge` (status, client), `Card` (commitment row), `Avatar` (owner)

### Empty State (No Commitments)

| Element | Details |
|---------|---------|
| Icon | 📋 in large gray-300 circle (64px) |
| Headline | "No commitments yet" — h4, gray-700 |
| Message | "Upload a meeting recording to extract your first commitments." — body-sm, gray-500 |
| CTA | "Upload Meeting" — primary button |

**Components:** `EmptyState`, `Button` (primary)

---

## Recent Meetings (Secondary Section)

**Layout:** Below commitment feed or in right sidebar (desktop).

### Section Header
- Title: "Recent Meetings" — h4
- Link: "View All" — text link, primary color

### Meeting Item Row

| Element | Details |
|---------|---------|
| Meeting Title | Truncated, body-bold, gray-900 |
| Client Name | body-sm, gray-500 |
| Date | caption, gray-400 |
| Commitment Count | Badge: "3 commitments" — secondary-100 bg |
| Status | Small dot: blue=processing, green=done |

**Row Design:**
- Similar to commitment rows but with different icon
- Click → navigate to meeting detail

**Components:** `Card` (meeting row), `Badge` (commitment count)

### Empty State

| Element | Details |
|---------|---------|
| Icon | 🎙️ in gray-300 circle |
| Headline | "No meetings yet" — h4, gray-700 |
| Message | "Connect your calendar or upload recordings to get started." — body-sm, gray-500 |
| CTA | "Upload Recording" — primary button |

---

## Sidebar Navigation (Desktop)

**Fixed left sidebar, 240px wide.**

| Element | Details |
|---------|---------|
| Logo | "MeetingMind" wordmark, top |
| Nav Items | Icon + label, vertical stack |
| Active State | primary-500 text, primary-50 bg |
| Hover State | gray-100 bg |
| User Section | Avatar + name + email at bottom, logout icon |

**Nav Items:**
- 📊 Dashboard
- 🎙️ Meetings
- 👥 Clients
- 📅 Calendar
- ⚙️ Settings

**Components:** `NavItem`, `Avatar`, `Button` (logout)

---

## Quick Actions

**Floating action button (FAB) or top bar action.**

| Element | Details |
|---------|---------|
| Button | "＋ New Meeting" — primary button, top right of content |
| Dropdown | Upload File, Paste Link, Import from Zoom |

**Components:** `Button` (primary), `Dropdown`

---

## Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| < 640px | Sidebar hidden (hamburger), single column, stats 2x2 grid |
| 640–1024px | Sidebar collapsible, stats 4x1 or 2x2 |
| > 1024px | Full sidebar, 3-column (sidebar + content + optional panel) |

---

## Sample Data (for Mockup)

### Stats
- Total: 47
- Open: 23
- Fulfilled: 19
- Overdue: 5

### Commitments
1. "Send revised proposal by Friday" — Acme Corp — Due Mar 21, 2026 — $15,000 — Open
2. "Confirm Q2 budget numbers" — Globex Industries — Due Mar 25, 2026 — Open
3. "Deliver sample product for testing" — Initech — Due Mar 20, 2026 — Fulfilled ✓
4. "Schedule follow-up call next week" — Stark Industries — Due Mar 18, 2026 — Overdue ⚠️
5. "Provide API documentation" — Umbrella Corp — Due Mar 28, 2026 — $3,200 — Open

### Meetings
1. "Acme Corp Q1 Review" — Mar 15, 2026 — 3 commitments
2. "Globex Kickoff Call" — Mar 14, 2026 — 5 commitments
3. "Stark Industries Weekly Sync" — Mar 18, 2026 — 2 commitments

---

## Component Summary

| Component | Usage |
|-----------|-------|
| `StatsCard` | Metric display with icon, number, label |
| `Alert` | Overdue warning banner |
| `Card` | Commitment row, meeting row |
| `Toggle` | Open/Fulfilled status switch |
| `Badge` | Status, client, value |
| `Avatar` | Owner initials |
| `Button` | Primary, ghost, secondary |
| `Input` | Search field |
| `EmptyState` | No data states |
| `NavItem` | Sidebar navigation |
| `Dropdown` | User menu, quick actions |
