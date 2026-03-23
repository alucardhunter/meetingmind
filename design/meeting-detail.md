# MeetingMind Meeting Detail Design

## Overview
The meeting detail page shows everything about a single meeting: the transcript, extracted commitments, audio player, and export options.

**Goal:** Give users a complete view of what was committed in a meeting, with full ability to track and export.

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                           │
├─────────────────────────────────────────────────────────────────┤
│  Header                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Meeting Title (h1)                        [Export ▾]    │   │
│  │ Client Name • Mar 15, 2026 • 45 min         [Status]    │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Stats Row (commitments from this meeting)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Total: 3 │ │ Open: 2  │ │ Done: 1  │ │ Overdue: 0│          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐ ┌───────────────────┐ │
│  │  Commitment Cards (Primary)         │ │  Sidebar           │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ │ │  ─────────────     │ │
│  │  │ Card 1  │ │ Card 2  │ │ Card 3  │ │ │  Audio Player     │ │
│  │  └─────────┘ └─────────┘ └─────────┘ │ │  ─────────────     │ │
│  │  ┌─────────┐ ┌─────────┐             │ │  Transcript       │ │
│  │  │ Card 4  │ │ Card 5  │             │ │  (scrollable)      │ │
│  │  └─────────┘ └─────────┘             │ │                    │ │
│  └─────────────────────────────────────┘ └───────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Mobile (< 768px):** Single column. Audio player above cards. Transcript below.

---

## Header Section

### Breadcrumb
- "← Back to Dashboard" — text link, gray-500, hover: gray-700

### Title Block
| Element | Details |
|---------|---------|
| Meeting Title | "Acme Corp Q1 Review" — h1, gray-900 |
| Meta Line | "Acme Corp • March 15, 2026 • 45 min" — body-sm, gray-500 |
| Status Badge | "Processed" (green) or "Processing" (yellow) — right-aligned |
| Export Button | "Export ▾" — dropdown with Copy / Notion / Slack options |

**Components:** `Breadcrumb`, `Badge` (status), `Dropdown` (export)

---

## Stats Row (Meeting-Level)

Compact version of dashboard stats, filtered to this meeting.

| Card | Value | Color |
|------|-------|-------|
| Total | 3 | gray-600 |
| Open | 2 | primary-500 |
| Fulfilled | 1 | success-500 |
| Overdue | 0 | error-500 |

**Design:** Horizontal row, smaller cards (no shadow, just border), `radius-md`

**Components:** `StatsCard` (compact variant)

---

## Commitment Cards Section (Primary)

**Grid layout:** 2 columns on desktop (≥ 1024px), 1 column on mobile.

### Individual Commitment Card

| Element | Position | Details |
|---------|----------|---------|
| Status Toggle | Top-left | Toggle switch: Open (blue) / Fulfilled (green) |
| Owner Avatar | Top-right | 32px circle, initials, colored bg |
| Commitment Text | Middle | Full text, body, gray-900 |
| Deadline | Bottom-left | ⏰ icon + date, or "No deadline" in gray-400 |
| $ Value Badge | Bottom-right | "$15,000" in accent-500 bg, or hidden if no value |
| Menu | Top-right corner | "..." kebab: Edit, Delete, Copy text |

**Card Design:**
- White background, `shadow-md`, `radius-lg`
- Padding: 20px
- Gap between cards: 16px (mobile), 24px (desktop)
- Hover: `shadow-lg`, 200ms ease

**Status Toggle States:**
- **Open:** Blue track (`primary-500`), white thumb, circle icon
- **Fulfilled:** Green track (`success-500`), white thumb, checkmark icon
- Transition: 200ms ease-in-out

**Deadline Colors:**
- Future: gray-500 text
- Today: warning-500 text, bold
- Overdue: error-500 text, bold

**Components:** `Card` (commitment), `Toggle`, `Avatar`, `Badge` (value)

### Card States

| State | Appearance |
|-------|------------|
| Default | White bg, shadow-md |
| Hover | Shadow-lg, translate -2px |
| Open | Blue left border (4px primary-500) |
| Fulfilled | Green left border (4px success-500), text slightly muted |
| Overdue | Red left border (4px error-500), error-50 bg tint |

### Sample Cards

**Card 1:**
- Text: "Send revised proposal with updated pricing tiers"
- Owner: JD (John Doe) — blue avatar
- Deadline: March 22, 2026
- Value: $15,000
- Status: Open

**Card 2:**
- Text: "Confirm Q2 budget allocation with finance team"
- Owner: SM (Sarah Miller) — purple avatar
- Deadline: March 28, 2026
- Value: None
- Status: Open

**Card 3:**
- Text: "Schedule product demo for next week"
- Owner: JD (John Doe)
- Deadline: None
- Value: None
- Status: Fulfilled ✓

---

## Sidebar (Desktop)

### Audio Player

| Element | Details |
|---------|---------|
| Waveform | Visual audio bars (decorative), gray-300 |
| Progress Bar | Primary-500 fill, draggable thumb |
| Time Display | "12:34 / 45:00" — monospace, gray-500 |
| Controls | ⏮️ -10s, ▶️ Play/Pause, ⏭️ +10s, 🔊 Volume |
| Download | Download icon button, right side |

**Design:**
- White bg, `radius-lg`, shadow-sm
- Padding: 16px
- Play button: large circle, primary-500 bg

**Components:** `AudioPlayer`

### Transcript Section

| Element | Details |
|---------|---------|
| Header | "Transcript" — h5, with "Collapse ▾" toggle |
| Content | Scrollable container, max-height 400px |
| Text | body-sm, gray-700, proper paragraph spacing |
| Speaker Labels | Bold, gray-900 — "John:" "Sarah:" |
| Timestamps | Gray-400, inline — [00:12] |

**Design:**
- White bg, `radius-md`, border gray-200
- Padding: 16px
- Scrollbar: custom styled, thin, gray-300 thumb

**Components:** `Card` (transcript container), scrollable content area

---

## Export Bar

**Position:** Below commitment cards, or in header dropdown (desktop).

### Export Options

| Button | Icon | Action |
|--------|------|--------|
| Copy All | 📋 | Copy commitments as formatted text to clipboard |
| Export to Notion | 📓 | Open Notion OAuth flow, select page |
| Export to Slack | 💬 | Open Slack picker, select channel |
| Download PDF | 📄 | Generate PDF with meeting summary |

**Button Design:** Ghost buttons with icon + label, `radius-md`

**Toast on action:** "Copied!" / "Sent to Notion" / etc. — 2s auto-dismiss

**Components:** `Button` (ghost with icon), `Toast` (success)

---

## Mobile Layout

**Single column, stacked:**

1. Header (title, back link)
2. Status + Export (horizontal bar)
3. Audio Player (compact)
4. Stats Row (horizontal scroll or 2x2)
5. Commitment Cards (full width, stacked)
6. Transcript (collapsible, below cards)

**Audio Player Mobile:** Smaller, just play/pause and time.

---

## Sample Meeting Data

### Meeting Info
- **Title:** Acme Corp Q1 Review
- **Client:** Acme Corp
- **Date:** March 15, 2026
- **Duration:** 45 minutes
- **Attendees:** John Doe (CEO), Sarah Miller (Account Manager)
- **Status:** Processed

### Transcript (Excerpt)
```
[00:00] John: Thanks for joining, Sarah. Let's quick cover the Q1 numbers.

[00:12] Sarah: Absolutely. So Q1 was strong — we hit 112% of target.

[00:45] John: Great. We need to send them a revised proposal with updated pricing tiers. 
         Can you get that to me by Friday?

[00:58] Sarah: Yes, I'll have that ready. What about the budget conversation we owe them?

[01:15] John: Right. We also need to confirm Q2 budget allocation with our finance team. 
         Let's schedule a call next week.

[01:30] Sarah: I'll send a calendar invite. Anything else on their plate?
```

---

## Component Summary

| Component | Usage |
|-----------|-------|
| `Card` (commitment) | Individual commitment display |
| `Card` (transcript) | Scrollable transcript container |
| `Toggle` | Open/Fulfilled switch |
| `Avatar` | Owner initials |
| `Badge` | Value badge, deadline badge |
| `AudioPlayer` | Meeting audio with controls |
| `Button` | Export actions (ghost) |
| `Toast` | Export success/failure |
| `Dropdown` | Export menu, card menu |
| `StatsCard` | Meeting-level commitment stats |
