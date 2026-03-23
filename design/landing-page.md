# MeetingMind Landing Page

## Overview
A single-page marketing site. Clean, professional, trust-building. No carousels or clutter. The goal: communicate value fast and get users to sign up.

---

## Page Sections (Top to Bottom)

### 1. Navigation Bar (Sticky)

**Layout:** Full-width, sticky on scroll, white background with subtle bottom border.

| Element | Details |
|---------|---------|
| Logo | "MeetingMind" wordmark, left-aligned. Primary blue (`#2563EB`). |
| Nav Links | Features, Pricing, FAQ — center-aligned. |
| CTA Button | "Get Started Free" — right-aligned, primary button. |
| Mobile | Hamburger menu at < 768px. Slide-out drawer. |

**Components:** `Button` (primary, sm), `Avatar` (for user menu if logged in)

---

### 2. Hero Section

**Layout:** Centered content, max-width 800px, generous vertical padding.

| Element | Details |
|---------|---------|
| Eyebrow | Small badge: "Commitment Tracking" in `secondary-100` bg |
| Headline | "Stop losing commitments from meetings." — H1, bold, dark |
| Subheadline | "MeetingMind extracts every promise, deadline, and dollar value from your calls — then tracks them until they're done." — body-lg, gray-600 |
| Primary CTA | "Start Free Trial" — primary button, lg |
| Secondary CTA | "Watch Demo" — ghost button with play icon |
| Hero Visual | Right side (desktop) or below (mobile): abstract illustration of commitment cards floating, or a clean mockup of the dashboard |

**Layout Hint:** Two-column on desktop (text left, visual right). Single column on mobile.

**Components:** `Button` (primary, lg), `Button` (ghost, lg), badge, illustration/icon set

---

### 3. Social Proof / Logos

**Layout:** Centered row of company logos (grayscale). Builds trust.

| Element | Details |
|---------|---------|
| Headline | "Trusted by teams at" — small, gray-500, centered |
| Logos | 5–6 company logos (Acme, Globex, Initech, Umbrella, Stark Ind) — grayscale, 120px width max each |
| Spacing | `space-12` top/bottom padding |

**Components:** Logo grid (static images or SVG)

---

### 4. Features Section

**Layout:** Three-column card grid (stacks on mobile).

| Card | Icon | Title | Description |
|------|------|-------|-------------|
| Commitment Cards | 📋 (checklist icon) | "Extract Every Commitment" | "Our AI identifies promises, assigns owners, and captures deadlines — automatically." |
| Deadline Tracking | ⏰ (clock icon) | "Never Miss a Due Date" | "Get alerts before deadlines pass. Track what's overdue and what's coming up." |
| Client Ledger | 📊 (chart icon) | "See Your Commitments by Client" | "Organize commitments by client. Know exactly what you owe whom." |
| Export Anywhere | 📤 (export icon) | "Export to Notion, Slack & More" | "Push commitments to your existing tools. Keep your workflow, not a new one." |

**Card Design:**
- White background, `shadow-md`, `radius-lg`
- 20px padding, 16px gap between cards
- Icon in `primary-50` circle (48px)
- Title: h4, gray-900
- Description: body-sm, gray-600

**Components:** `Card` (feature card variant)

---

### 5. How It Works

**Layout:** Horizontal 3-step flow (vertical on mobile). Connected by dotted line or arrow.

| Step | Icon | Title | Description |
|------|------|-------|-------------|
| 1. Upload | 📤 (upload icon) | "Upload Your Recording" | "Drop an audio file or paste a Zoom/Meet link. We handle the rest." |
| 2. Extract | ✨ (sparkle icon) | "AI Does the Work" | "We transcribe, identify commitments, and extract deadlines and values." |
| 3. Track | ✅ (check icon) | "Track Until Fulfilled" | "Mark commitments complete. Get reminders. Build a record of reliability." |

**Visual:** 
- Numbered circles (1, 2, 3) connected by line
- Each step: 200px wide max, centered text
- Step icon in `primary-500` circle

**Components:** `Card` (step card), numbered badges, connecting line

---

### 6. Pricing Section

**Layout:** Three-column card layout (stacks on mobile).

| Tier | Price | CTA | Features |
|------|-------|-----|----------|
| **Free** | $0/mo | "Start Free" | 5 meetings/mo, 10 commitments, 1 user, Email support |
| **Pro** | $19/mo | "Try Pro" | Unlimited meetings, unlimited commitments, 5 users, Slack integration, Priority support |
| **Team** | $49/mo | "Contact Sales" | Everything in Pro, unlimited users, SSO, API access, Dedicated support |

**Card Design:**
- Pro card: slightly larger, `primary-500` border, "Most Popular" badge
- Price: h2 size, bold
- Feature list: checkmarks in `success-500`, gray-600 text
- CTA: full-width button at bottom

**Components:** `Card` (pricing card), `Badge` (popular), `Button` (primary/secondary)

---

### 7. FAQ Section

**Layout:** Accordion style. Expandable questions.

| Question | Answer |
|----------|--------|
| "How does MeetingMind extract commitments?" | "We use speech-to-text to transcribe your recordings, then our AI identifies promise-like statements, deadlines, dollar amounts, and who made them." |
| "What audio formats are supported?" | "MP3, M4A, WAV, and MP4. We also support direct Zoom and Google Meet links." |
| "Is my meeting data secure?" | "Yes. All files are encrypted in transit and at rest. We never share your data. You can delete recordings anytime." |
| "Can I export to Notion or Slack?" | "Pro and Team plans include native integrations with Notion, Slack, and more. Free plan supports basic export." |

**Components:** Accordion component (not listed — design as expandable `Card` with chevron)

---

### 8. CTA Section (Before Footer)

**Layout:** Centered, full-width bg in `primary-500`, white text.

| Element | Details |
|---------|---------|
| Headline | "Ready to keep your commitments?" — h2, white |
| Subtext | "Start free. No credit card required." — body, white-80% |
| CTA | "Get Started Free" — white button (bg white, text primary-600) |

**Components:** `Button` (white variant)

---

### 9. Footer

**Layout:** Three-column on desktop, stacked on mobile.

| Column | Content |
|--------|---------|
| Brand | Logo + tagline "Keep your meeting promises." + social icons (Twitter, LinkedIn) |
| Product | Features, Pricing, Changelog, Roadmap |
| Company | About, Blog, Privacy Policy, Terms of Service |
| Support | Docs, Help Center, Contact |

**Bottom Bar:** Copyright "© 2026 MeetingMind. All rights reserved." + language selector (optional)

**Components:** Logo, link lists, social icons

---

## Copy Templates

### Hero
- **Headline:** Stop losing commitments from meetings.
- **Subheadline:** MeetingMind extracts every promise, deadline, and dollar value from your calls — then tracks them until they're done.

### Features (short)
- Extract Every Commitment
- Never Miss a Due Date
- See Your Commitments by Client
- Export to Notion, Slack & More

### How It Works
1. Upload Your Recording
2. AI Does the Work
3. Track Until Fulfilled

### CTA
- "Start Free Trial"
- "Get Started Free"
- "Ready to keep your commitments?"

---

## Responsive Breakpoints

| Breakpoint | Layout Adjustments |
|------------|-------------------|
| < 640px (sm) | Single column, stacked cards, hamburger nav |
| 640–1024px (md) | 2-column grids, condensed spacing |
| > 1024px (lg) | Full layout, 3-column grids, side-by-side hero |

---

## Technical Notes

- **Framework:** Static HTML/CSS with Tailwind CDN (for mockup)
- **Icons:** Lucide icons (via CDN or inline SVG)
- **Fonts:** Inter via Google Fonts
- **Images:** Use placeholder services (Unsplash, placehold.co) for mockups
- **Animations:** Minimal — fade-in on scroll using Intersection Observer
