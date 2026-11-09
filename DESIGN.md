---
version: alpha
name: "NestJS"
description: "A progressive Node.js framework with a bold developer-first identity: deep forest-green-black gradient canvas, massive Manrope headlines in crisp white, luminous mint green brand voltage on the logo and accents, monospaced Geist Mono for all body copy and code-adjacent text, generously rounded corners (20-24px) on interactive elements, and a glassmorphic nav bar floating over atmospheric gradient depth."

colors:
  # Brand
  primary: "#39E58C"
  primary-hover: "#65F2A8"
  primary-active: "#20B86C"
  accent: "#8FF5BD"

  # Surface
  canvas: "#F0F7F3"
  surface-soft: "#080F0D"
  surface: "#111C18"
  surface-strong: "#182B23"
  surface-elevated: "#20392D"
  surface-dark: "#06100B"
  gradient-start: "#080F0D"
  gradient-mid: "#146B49"
  gradient-end: "#080F0D"

  # Text
  ink: "#F0F7F3"
  body: "#8CA89B"
  muted: "rgba(255, 255, 255, 0.75)"
  muted-soft: "rgba(255, 255, 255, 0.5)"
  muted-faint: "rgba(255, 255, 255, 0.25)"
  on-primary: "#080F0D"
  on-dark: "#F0F7F3"
  on-surface: "#F0F7F3"
  inverse: "#080F0D"

  # Hairlines & Borders
  hairline: "rgba(255, 255, 255, 0.12)"
  hairline-soft: "rgba(255, 255, 255, 0.08)"
  border-strong: "rgba(255, 255, 255, 0.15)"
  border-focus: "#8FF5BD"

  # Semantic
  error: "#FF727B"
  success: "#39E58C"
  warning: "#E8B85B"
  info: "#8FF5BD"
  link: "#8FF5BD"
  link-active: "#65DFA0"

typography:
  display-xl:
    fontFamily: "Manrope, sans-serif"
    fontSize: "112px"
    fontWeight: "500"
    lineHeight: "106.4px"
    letterSpacing: "-0.02em"
  display-lg:
    fontFamily: "Manrope, sans-serif"
    fontSize: "112px"
    fontWeight: "500"
    lineHeight: "106.4px"
    letterSpacing: "-0.02em"
  title-md:
    fontFamily: "Manrope, sans-serif"
    fontSize: "48px"
    fontWeight: "500"
    lineHeight: "56px"
    letterSpacing: "0"
  title-sm:
    fontFamily: "Manrope, sans-serif"
    fontSize: "20px"
    fontWeight: "600"
    lineHeight: "28px"
    letterSpacing: "0"
  label-md:
    fontFamily: "\"Geist Mono\", monospace"
    fontSize: "12px"
    fontWeight: "300"
    lineHeight: "16px"
    letterSpacing: "1.2px"
  body-md:
    fontFamily: "\"Geist Mono\", monospace"
    fontSize: "14px"
    fontWeight: "300"
    lineHeight: "24px"
    letterSpacing: "0"
  body-sm:
    fontFamily: "\"Geist Mono\", monospace"
    fontSize: "13px"
    fontWeight: "400"
    lineHeight: "20px"
    letterSpacing: "0"
  mono:
    fontFamily: "\"Geist Mono\", monospace"
    fontSize: "13px"
    fontWeight: "400"
    lineHeight: "20px"
    letterSpacing: "0"
  button:
    fontFamily: "Manrope, sans-serif"
    fontSize: "16px"
    fontWeight: "700"
    lineHeight: "1.5"
    letterSpacing: "0"
  nav-link:
    fontFamily: "Manrope, sans-serif"
    fontSize: "16px"
    fontWeight: "400"
    lineHeight: "1.5"
    letterSpacing: "0"

rounded:
  sm: "4px"
  DEFAULT: "20px"
  md: "24px"
  lg: "32px"
  xl: "60px"
  xxl: "80px"
  pill: "9999px"
  full: "9999px"

spacing:
  xxs: "1px"
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "40px"
  section: "64px"
  section-xl: "80px"

extensions:
  shadows:
    sm: "0 4px 10px rgba(0, 0, 0, 0.2)"
    md: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
    lg: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.12)"
    glow: "0 0 40px rgba(57, 229, 140, 0.15)"
  motion:
    duration: "300ms"
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    level: "moderate"
  icons: "lucide"
  framework: "tailwind"
  mode: "dark"
  fontPairings:
    - head: "Manrope"
      sub: null
      body: "Geist Mono"

components:
  top-nav:
    backgroundColor: "rgba(0, 0, 0, 0.6)"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    height: "80px"
    rounded: "{rounded.lg}"
  top-nav-blur:
    backgroundColor: "rgba(17, 17, 17, 0.95)"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    height: "100vh"
    rounded: "0"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    padding: "8px 16px"
  nav-link-active:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
  nav-icon-btn:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    size: "24px"
    padding: "8px"
  logo-mark:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    size: "32px"
  hero-band:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    rounded: "{rounded.lg}"
    padding: "{spacing.section-xl}"
  hero-headline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
  hero-subhead:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.body-md}"
  hero-cta-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "{spacing.xl} 0"
  button-primary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.inverse}"
    typography: "{typography.button}"
    rounded: "{rounded.DEFAULT}"
    padding: "20px"
  button-primary-hover:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.inverse}"
    typography: "{typography.button}"
    rounded: "{roundeD.DEFAULT}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.DEFAULT}"
    padding: "20px"
  button-secondary-hover:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.DEFAULT}"
  button-dark:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.DEFAULT}"
    padding: "20px"
  button-dark-hover:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.DEFAULT}"
  text-input:
    backgroundColor: "rgba(255, 255, 255, 0.12)"
    textColor: "{colors.ink}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "24px 20px"
  text-input-focus:
    backgroundColor: "rgba(255, 255, 255, 0.15)"
    textColor: "{colors.ink}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.DEFAULT}"
    padding: "{spacing.xxl}"
  card-elevated:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.ink}"
    rounded: "{rounded.DEFAULT}"
    padding: "{spacing.xxl}"
  dropdown-menu:
    backgroundColor: "rgba(0, 0, 0, 0.6)"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px"
  dropdown-menu-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  dropdown-menu-item-hover:
    backgroundColor: "rgba(255, 255, 255, 0.08)"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.sm}"
  footer:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.body}"
    typography: "{typography.body-sm}"
    padding: "{spacing.section-xl}"
  social-icon:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    size: "20px"
    padding: "8px"
  badge:
    backgroundColor: "rgba(57, 229, 140, 0.15)"
    textColor: "{colors.primary}"
    typography: "{typography.mono}"
    rounded: "{rounded.sm}"
    padding: "4px 12px"
  code-inline:
    backgroundColor: "rgba(255, 255, 255, 0.08)"
    textColor: "{colors.accent}"
    typography: "{typography.mono}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  divider:
    backgroundColor: "{colors.hairline}"
    height: "1px"
    width: "100%"
---

# NestJS Design System

## Overview

NestJS presents a striking, developer-centric visual identity built for a technical audience that values precision and performance. The system is anchored by a dramatic dark-mode canvas—specifically, a deep forest-green-black gradient that sweeps from `{colors.gradient-start}` (`#080F0D`) through a rich emerald midpoint `{colors.gradient-mid}` (`#146B49`) before returning to near-black. This gradient isn't merely decorative; it's the foundational atmosphere that makes every white headline pop with theatrical clarity.

Brand voltage concentrates in the signature luminous mint green `{colors.primary}` (`#39E58C`), which appears sparingly but memorably: on the NestJS bird logo mark, in brand emphasis contexts, and as a subtle depth in certain accent moments. The color is never allowed to dominate—it's a voltage spike against the darkness, not a wallpaper. This restraint gives the primary color genuine impact when it does appear.

The single typographic move that defines this system is the **monospaced body voice**. While headlines use the humanist geometric sans `Manrope` at massive scales (112px for the hero), every piece of running text, metadata, labels, descriptions, and code-adjacent content renders in `Geist Mono` at light weights (300–400). This creates a terminal-aesthetic that signals "this is for developers" without needing to say it explicitly. The contrast between the green, approachable `Manrope` headlines and the cool, precise `Geist Mono` body text is the system's defining duality.

Shape language leans heavily rounded: `{rounded.DEFAULT}` (20px) and `{rounded.md}` (24px) are the workhorses for buttons and inputs, while the nav bar itself carries `{rounded.lg}` (32px) corners, giving it a pill-like presence. Even the hero band container is rounded at 32px, softening what could otherwise be an intimidating wall of dark gradient.

Sub-systems observed include the main marketing landing page (hero + feature grid), a documentation dialect (implied by "Docs" nav item with darker surface cards `{colors.surface-strong}`), and an enterprise/support pathway ("Request enterprise support" CTA). Each maintains the same color and type foundation but adjusts density and surface elevation.

### Key Characteristics

- Dark-mode-first canvas using a horizontal forest-green gradient (`{colors.gradient-start}` → `{colors.gradient-mid}` → `{colors.gradient-end}`)
- Brand voltage in luminous mint green `{colors.primary}` (`#39E58C`) — used sparingly on logo and semantic elements only
- Dual-typeface system: `Manrope` for all display/headline text, `Geist Mono` for all body/label/code text
- Massive headline scale — `{typography.display-xl}` at 112px dominates the hero with `{colors.ink}` off-white text
- Generously rounded interactive elements — buttons and inputs use `{rounded.DEFAULT}` (20px) or `{rounded.md}` (24px)
- Glassmorphic nav bar with `{colors.hairline}` borders and backdrop blur, rounded to `{rounded.lg}`
- Light monospace body text at `{typography.body-md}` (14px / 300 weight) in `{colors.muted}` for secondary reading
- Primary CTA is inverted — pale mint background `{colors.canvas}` with black text `{colors.inverse}`
- Secondary/ghost CTAs use transparent background with off-white text, scaling down on hover to 0.9×
- Input fields use frosted-glass treatment with `{colors.hairline}` background at 12% white opacity

## Colors

### Brand & Accent

- **Primary** (`{colors.primary}` — #39E58C): Luminous mint green brand color used for the NestJS logo mark, brand emphasis and high-voltage accent moments. Never used as a solid background for large areas.
- **Primary Hover** (`{colors.primary-hover}` — #65F2A8): Lightened mint green for hover states on primary-colored interactive elements.
- **Primary Active** (`{colors.primary-active}` — #20B86C): Deepened mint green for pressed/active states.
- **Accent Mint** (`{colors.accent}` — #8FF5BD): Cool soft mint used for links, focus rings, code highlights, and informational callouts. Provides tonal contrast to the green primary.

### Surface

- **Canvas** (`{colors.canvas}` — #F0F7F3): Soft off-white — used exclusively as the `{component.button-primary}` background and for any inverted/light-mode-adjacent elements.
- **Surface Soft** (`{colors.surface-soft}` — #080F0D): Near-black with imperceptible green undertone. The dominant page background and hero band base.
- **Surface** (`{colors.surface}` — #111C18): Slightly lighter black. Used for card backgrounds and content containers.
- **Surface Strong** (`{colors.surface-strong}` — #182B23): Medium-dark gray-black. Applied to `{component.button-dark}` and documentation-surface cards.
- **Surface Elevated** (`{colors.surface-elevated}` — #20392D): Noticeably lighter dark surface for hover states on dark buttons and elevated cards.
- **Surface Dark** (`{colors.surface-dark}` — #06100B): Deepest black variant, used for mobile menu overlay background.
- **Gradient Start** (`{colors.gradient-start}` — #080F0D): Left anchor of the hero gradient — identical to surface-soft.
- **Gradient Mid** (`{colors.gradient-mid}` — #146B49): Rich forest green-emerald midpoint of the horizontal hero gradient. The "temperature" source that greens the entire canvas.
- **Gradient End** (`{colors.gradient-end}` — #080F0D): Right anchor of the hero gradient — returns to near-black.

### Text

- **Ink** (`{colors.ink}` — #F0F7F3): Soft off-white. Primary text color for headlines, nav links, and high-emphasis content.
- **Body** (`{colors.body}` — #8CA89B): Medium gray. Default body copy color for readable but de-emphasized paragraphs.
- **Muted** (`{colors.muted}` — rgba(255, 255, 255, 0.75)): 75% opacity white. Secondary descriptive text, hero subhead.
- **Muted Soft** (`{colors.muted-soft}` — rgba(255, 255, 255, 0.5)): 50% opacity white. Tertiary text, timestamps, metadata.
- **Muted Faint** (`{colors.muted-faint}` — rgba(255, 255, 255, 0.25)): 25% opacity white. Very de-emphasized decorative or placeholder text.
- **On Primary** (`{colors.on-primary}` — #080F0D): Black text for rendering on `{colors.primary}` or `{colors.canvas}` backgrounds.
- **On Dark** (`{colors.on-dark}` — #F0F7F3): White text for any dark surface.
- **On Surface** (`{colors.on-surface}` — #F0F7F3): White text default for surface-level content.
- **Inverse** (`{colors.inverse}` — #080F0D): Black text specifically for inverted/button contexts.

### Hairlines & Borders

- **Hairline** (`{colors.hairline}` — rgba(255, 255, 255, 0.12)): 12% white. Default border for inputs, dividers, and subtle outlines.
- **Hairline Soft** (`{colors.hairline-soft}` — rgba(255, 255, 255, 0.08)): 8% white. Barely-visible borders for very subtle separation.
- **Border Strong** (`{colors.border-strong}` — rgba(255, 255, 255, 0.15)): 15% white. Dropdown menu borders, focus-visible outlines on glassmorphic surfaces.
- **Border Focus** (`{colors.border-focus}` — #8FF5BD): Soft mint. Explicit focus ring color for accessibility, matching `{colors.accent}`.

### Semantic

- **Error** (`{colors.error}` — #39E58C): Distinct soft red for validation errors and destructive actions.
- **Success** (`{colors.success}` — #39E58C): Bright green for success states, confirmations, status indicators.
- **Warning** (`{colors.warning}` — #E8B85B): Amber/orange for caution states, deprecation notices.
- **Info** (`{colors.info}` — #8FF5BD): Maps to accent mint. Informational notices, tooltips, external links.
- **Link** (`{colors.link}` — #8FF5BD): Soft mint for inline hyperlinks within body text.
- **Link Active** (`{colors.link-active}` — #65DFA0): Deeper mint tone for visited or active link states.

## Typography

### Font Family

The system employs a strict two-typeface pairing with zero overlap in responsibility. **Manrope** (a modern humanist geometric sans-serif available via Google Fonts) handles all display, headline, navigation, and UI-label text. It carries depth and approachability at large scales, with its slightly geometric letterforms feeling contemporary but not cold. The fallback stack is simply `"Manrope", sans-serif`.

**Geist Mono** (Vercel's monospace family, loaded via Google Fonts) owns every other textual role: body paragraphs, code snippets, labels, metadata, timestamps, and any text that should feel "technical." It renders at notably light weights (200–400) which, combined with the monospaced rhythm, creates a distinctive terminal/editor aesthetic that signals credibility to developer audiences. The fallback stack is `"Geist Mono", monospace`.

This bifurcation is absolute — you will never see `Geist Mono` in a headline, nor `Manrope` in a paragraph body, within this system.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 112px | 500 | 106.4px | -0.02em | Hero headline — the singular "More than just a Node framework" statement |
| `{typography.display-lg}` | 112px | 500 | 106.4px | -0.02em | Alternate display size (same value as XL in current implementation) |
| `{typography.title-md}` | 48px | 500 | 56px | 0 | Section headings, feature titles, card headers |
| `{typography.title-sm}` | 20px | 600 | 28px | 0 | Subsection headings, card titles, emphasized labels |
| `{typography.label-md}` | 12px | 300 | 16px | 1.2px | Overline labels, category tags, input placeholders |
| `{typography.body-md}` | 14px | 300 | 24px | 0 | Primary body copy, hero description paragraph |
| `{typography.body-sm}` | 13px | 400 | 20px | 0 | Secondary body text, footnotes, captions |
| `{typography.mono}` | 13px | 400 | 20px | 0 | Code fragments, technical metadata |
| `{typography.button}` | 16px | 700 | 1.5 | 0 | Button labels, CTA text |
| `{typography.nav-link}` | 16px | 400 | 1.5 | 0 | Navigation menu items |

### Principles

The typography system's hierarchy is carried almost entirely by **size and color**, not weight. Headlines hit 112px at weight 500 — distinctly not bold — relying on their massive scale to command attention. Body text drops to 14px at weight 300, creating a dramatic 8× size ratio between display and body (most systems manage 2–3×). This extreme contrast means the eye always knows what's important: if it's huge, it's the message; if it's small and monospaced, it's the details.

Weight is used sparingly for emphasis: `{typography.title-sm}` bumps to 600 for subsection headers, and `{typography.button}` hits 700 for CTAs. But even the boldest text in the system (700) would be considered "medium" in many brand guidelines — there is no 800 or 900 weight anywhere. The system trusts scale and color contrast over weight aggression.

Letter-spacing is nearly universal at `0` (normal), with one exception: `{typography.label-md}` uses `1.2px` tracking to give those tiny 12px labels breathability and a "technical spec" feel. Display text uses `-0.02em` slight tightening at large sizes to prevent letterspacing from looking excessive at 112px.

Color carries hierarchy too: `{colors.ink}` (soft off-white) for primary messages, `{colors.muted}` (75% white) for supporting text, `{colors.body}` (gray) for extended reading, and `{colors.accent}` (soft mint) for actionable links within text blocks.

### Note on Font Substitutes

Both `Manrope` and `Geist Mono` are available via Google Fonts and require no proprietary licensing. For `Manrope`, the Google Fonts URL is `https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap`. For `Geist Mono`: `https://fonts.googleapis.com/css2?family=Geist+Mono:wght@200..800&display=swap`. 

If substitution is absolutely required, `Manrope` can be replaced by **Inter** (similar geometric humanist quality, though slightly narrower) or **DM Sans** (more geometric). `Geist Mono` can be substituted with **JetBrains Mono** (very similar character, excellent ligature support) or **Fira Code** (more distinctive with programming ligatures). Define CSS variables `--font-heading` and `--font-body` to enable easy swapping.

## Layout

### Spacing System

- **Base unit:** 4px (with 1px and 8px as finer/coarser granularities).
- **Tokens:** 
  - `{spacing.xxs}` (1px): Hairline borders, minimal separators.
  - `{spacing.xs}` (4px): Tight internal gaps, icon-to-text spacing.
  - `{spacing.sm}` (8px): Small gaps between related elements, badge padding.
  - `{spacing.md}` (16px): Standard gap between adjacent elements, grid gutters at mobile.
  - `{spacing.lg}` (24px): Paragraph spacing, card internal gaps.
  - `{spacing.xl}` (32px): Section-internal major spacing, element-to-element breathing room.
  - `{spacing.xxl}` (40px): Button padding, input padding, card padding.
  - `{spacing.section}` (64px): Vertical section padding on desktop.
  - `{spacing.section-xl}` (80px): Hero band vertical padding, footer padding, major section breaks.
- **Section padding (vertical):** `{spacing.section-xl}` (80px) — used on `{component.hero-band}`, `{component.footer}`, and major content sections.
- **Card internal padding:** `{spacing.xxl}` (40px) — consistent across `{component.card}` and `{component.card-elevated}`.
- **Gutters:** Desktop container uses 80px horizontal padding ({spacing.section-xl}); mobile drops to 24px ({spacing.lg}).

### Grid & Container

- **Max content width:** 1458px for main sections, 1440px for header-level containers, 999px for nav-specific constraints.
- **Density choice:** Editorial-hero density — the above-fold area is dominated by a single massive headline with generous surrounding whitespace. Below the fold, the system shifts to a multi-column feature grid (5 columns on desktop, 4 on medium tablets).
- **Desktop grid behavior:** The hero uses a single centered column for the headline/subhead/CTA stack. Below that, a 5-column grid (`lg:grid-cols-5`) displays features or cards with `xl:gap-x-40` (160px!) horizontal gaps — extremely airy, almost gallery-like spacing.
- **Hero column split:** On desktop, the hero is effectively a single centered column (text-align center on large screens). No side-by-side text/image split in the traditional sense; the gradient background provides the visual interest while text remains central.

### Whitespace Philosophy

This system practices **aggressive, confident whitespace**. The 112px headline is surrounded by 80px+ of vertical padding on all sides. Grid column gaps reach 160px horizontally. This isn't "airy" in a luxury-editorial sense — it's *theatrical* whitespace designed to make the dark gradient canvas and massive white type feel immersive. The system refuses to cram information; it presents one idea at a time with room to breathe.

### Header Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ [LOGO]         Enterprise   Courses   Docs   Tools ▾   Jobs   [🌐][𝕏][🎮][in] │
│                                                                     │
│  ← 1440px max-width, 40px padding, rounded-32px container →        │
└─────────────────────────────────────────────────────────────────────┘
  ↑ backdrop-blur, bg-black/60, border-white/15, rounded-lg
```

The `{component.top-nav}` floats within the hero band with a glassmorphic treatment: `rgba(0, 0, 0, 0.6)` background with backdrop blur, a subtle `{colors.border-strong}` border, and `{rounded.lg}` (32px) corners. Logo sits flush left, navigation items center with even spacing, social/utility icons flush right. On mobile, this collapses to a full-screen overlay (`{component.top-nav-blur}`) with a hamburger trigger.

### Hero Section

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                                                                      │
│          More than just a                                           │
│          Node framework                                             │
│                                                                      │
│     Nest – the world's fastest-growing Node framework for...        │
│                                                                      │
│              [ Get started ]    Github                               │
│                                                                      │
│                                                              [code]  │
└──────────────────────────────────────────────────────────────────────┘
  ↑ gradient-bg: from #080F0D via #146B49 to #080F0D, rounded-32px
```

The `{component.hero-band}` is the signature moment: a massive rounded rectangle (32px corners) filled with the horizontal forest-green gradient. Inside, the `{component.hero-headline}` (112px Manrope white) centers vertically and horizontally. Below it, the `{component.hero-subhead}` (14px Geist Mono, `{colors.muted}`) provides the framework description. The `{component.hero-cta-row}` places `{component.button-primary}` (pale mint "Get started") next to `{component.button-secondary}` (transparent "Github"). A faint code snippet appears bottom-right in `{typography.mono}` at `{colors.muted-faint}` for atmospheric detail.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | No shadow, no border | Base surfaces (`{colors.surface-soft}`, `{colors.surface}`) |
| 1 — Hairline | 1px `{colors.hairline}` border | Input fields, dividers, subtle separators |
| 2 — Soft drop | `{extensions.shadows.sm}` — 0 4px 10px rgba(0,0,0,0.2) | Cards, small elevated containers |
| 3 — Modal/Dropdown | `{extensions.shadows.md}` + backdrop blur | `{component.dropdown-menu}`, modals, tooltips |
| 4 — Hero container | Gradient fill + no shadow | The hero band itself (depth comes from color, not shadow) |
| 5 — Nav float | Glassmorphism + `{extensions.shadows.sm}` + border | `{component.top-nav}` hovering over gradient |

The system favors **color-block depth over shadow depth**. The hero's visual layering comes from the gradient itself — the emerald midpoint `{colors.gradient-mid}` creates a "glow" that feels like ambient light, not a cast shadow. Shadows are reserved for functional elevation: dropdowns need to clear the content beneath them (`{extensions.shadows.md}`), and cards need to lift slightly from their parent (`{extensions.shadows.sm}`). The overall effect is layered but not heavy — shadows are neutral/black, never colored or dramatically diffuse.

### Decorative Depth

The hero gradient is the primary decorative depth element: a linear gradient from `{colors.gradient-start}` through `{colors.gradient-mid}` to `{colors.gradient-end}`. This creates a vignette-like depth in the center that fades to darkness at the edges, naturally drawing the eye toward the centered headline. Additionally, the system employs **glassmorphism** on the nav bar and dropdown menus — semi-transparent dark backgrounds with `backdrop-blur-lg` (or equivalent filter) and subtle white borders. This creates a "frosted glass" floating effect that separates UI chrome from the gradient canvas beneath.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.sm}` | 4px | Badges, code inline snippets, tiny tags |
| `{rounded.DEFAULT}` | 20px | **Primary button radius** — used on all standard buttons (primary, secondary, dark) |
| `{rounded.md}` | 24px | Input fields, dropdown menus, larger cards |
| `{rounded.lg}` | 32px | **Nav bar container**, hero band outer corners |
| `{rounded.xl}` | 60px | Special signature elements, pills, large feature cards |
| `{rounded.xxl}` | 80px | Ultra-rounded containers, possible avatar/image masks |
| `{rounded.pill}` / `{rounded.full}` | 9999px | Fully rounded (circles/ellipses) — avatars, icon circles |

The shape vocabulary is aggressively rounded. Even "sharp" corners (`{rounded.sm}` at 4px) soften the geometry. The dominant radius is `{rounded.DEFAULT}` (20px) — every button carries this friendly, approachable roundness. Inputs go slightly larger to `{rounded.md}` (24px) to feel more "container-like." The nav bar's `{rounded.lg}` (32px) makes it feel like a floating pill rather than a rectangular strip.

## Components

> **No hover states documented.** Hover behavior is unreliable to extract from a single screenshot. State variants live as separate entries in the `components:` frontmatter (e.g. `{component.button-primary-hover}`, `{component.text-input-focus}`); add hover styling at implementation time per your stack's conventions.

### Buttons

**`{component.button-primary}`** — The primary call-to-action with maximum visual weight. Background `{colors.canvas}` (soft off-white), text `{colors.inverse}` (black) in `{typography.button}` (16px/700 Manrope). Rounded to `{rounded.DEFAULT}` (20px) with `{spacing.xxl}` (40px) uniform padding. Used for "Get started," "Request enterprise support," and "Get certified today." Has a subtle scale transform on hover (observed `hover:scale` class). Its inverted scheme (light on dark page) makes it impossible to miss. State variant: `{component.button-primary-hover}`.

**`{component.button-secondary}`** — Ghost/link-style CTA with transparent background and `{colors.ink}` (white) text. Same typography and rounding as primary. Used for "Github" link and tertiary actions. On hover, it applies a subtle scale-down to ~0.9× (observed `hover:scale-[0.9]`) and potentially a faint background tint. State variant: `{component.button-secondary-hover}`.

**`{component.button-dark}`** — Dark-surface button for contexts where white would be inappropriate (e.g., "Official documentation" CTA on a dark card). Background `{colors.surface-strong}` (`#182B23`), off-white text. Same 20px radius, 40px padding, bold Manrope type. Hover state (`{component.button-dark-hover}`) lifts to `{colors.surface-elevated}` (`#20392D`) and scales to 0.98×. Includes a transition on transform (`transition-transform duration-100`).

### Cards & Containers

**`{component.card}`** — Standard content card with `{colors.surface}` (`#111C18`) background, off-white text, 20px corner radius, and 40px internal padding. Used for feature showcases, documentation previews, and grouped content below the hero. No visible border — relies on the subtle background difference from the parent `{colors.surface-soft}`.

**`{component.card-elevated}`** — Elevated card variant with `{colors.surface-elevated}` (`#20392D`) background for when a card needs to "lift" visually from a dark surface. Same dimensions and padding as standard card. Would carry `{extensions.shadows.sm}` shadow in context.

**`{component.dropdown-menu}`** — Glassmorphic dropdown container appearing below "Tools" nav item. Background `rgba(0, 0, 0, 0.6)` with `backdrop-blur-lg`, `{colors.border-strong}` border, 24px radius, 8px padding. Contains `{component.dropdown-menu-item}` entries. Shadow: `{extensions.shadows.md}`. Transitions opacity over 600ms (`duration-[600ms]`).

**`{component.dropdown-menu-item}`** — Individual menu item inside dropdown. Transparent background, off-white text, nav-link typography, 4px radius, 12px/16px padding. Hover variant (`{component.dropdown-menu-item-hover}`) shows `{colors.hairline-soft}` (8% white) background highlight.

**`{component.hero-band}`** — The signature hero container. Filled with the forest-green gradient, 32px rounded corners, 80px vertical padding. Contains the entire above-fold experience: nav (floating), headline, subhead, CTA row, and decorative code fragment. This is the most visually complex component — it establishes the entire brand mood in one viewport.

**`{component.footer}`** — Page footer with `{colors.surface-soft}` background, `{colors.body}` (gray) text, body-sm typography (13px Geist Mono), and 80px padding. Likely contains links, legal text, and social icons in a multi-column layout.

### Inputs & Forms

**`{component.text-input}`** — Email/text input with a frosted-glass appearance. Background is white at 12% opacity (`rgba(255, 255, 255, 0.12)`), text is white, typography is `{typography.label-md}` (12px/300 Geist Mono with 1.2px letter-spacing). Generously sized: 24px radius (pill-like), 24px vertical × 20px horizontal padding, 1px `{colors.hairline}` border. The light font weight and monospace face give it a "terminal input" feel. Focus state (`{component.text-input-focus}`) increases background opacity to 15% and would show a `{colors.border-focus}` (soft mint) ring.

### Navigation

**`{component.top-nav}`** — Floating navigation bar within the hero. Glassmorphic: `rgba(0, 0, 0, 0.6)` background with backdrop blur, `{colors.border-strong}` border, `{rounded.lg}` (32px) corners, 80px height, 40px internal padding. Contains `{component.logo-mark}` (left), `{component.nav-link}` items (center), and `{component.social-icon}` / `{component.nav-icon-btn}` utilities (right). Max-width constrained to 1440px, centered.

**`{component.nav-link}`** — Individual navigation menu item. Transparent background, off-white text, 16px/400 Manrope, 8px/16px padding. Active state (`{component.nav-link-active}`) may show underline or color shift. Items observed: "Enterprise," "Courses," "Docs," "Tools" (with dropdown indicator), "Jobs."

**`{component.logo-mark}`** — NestJS bird icon in `{colors.primary}` (luminous mint green). 32px size, positioned at the left edge of the nav bar. The single consistent use of the primary brand color in the header.

**`{component.nav-icon-btn}`** — Icon-only button in the nav (GitHub icon, X/Twitter icon, Discord icon, LinkedIn icon). 24px size, 8px padding, transparent background, white/icon-color. Uses Lucide icons.

**`{component.top-nav-blur}`** — Mobile navigation overlay. Full-screen (`height: 100vh`), `{colors.surface-dark}` (`#06100B`) background, z-index 50. Contains hamburger close button, large vertical nav links (uppercase, text-4xl, font-semibold), and bottom-aligned utilities. Replaces the floating nav on screens below the lg breakpoint.

**`{component.social-icon}`** — Social media link icon (appears in nav and possibly footer). 20px icon size, 8px padding, inherits text color (white). Renders GitHub, X, Discord, LinkedIn icons from Lucide set.

### Signature Components

**`{component.hero-headline}`** — The 112px Manrope headline "More than just a Node framework." Soft off-white (`{colors.ink}`), weight 500, line-height tightly managed at 106.4px (-0.02em tracking). Centered. This is the typographic centerpiece of the entire brand.

**`{component.hero-subhead}`** — Supporting paragraph below headline. `{typography.body-md}` (14px/300 Geist Mono), `{colors.muted}` (75% white), describing NestJS as "the world's fastest-growing Node framework..." Centered, max-width constrained for readability.

**`{component.hero-cta-row}`** — Horizontal flex container holding the primary and secondary CTAs. 32px top margin, centered alignment. Spacing between buttons handled by gap utility.

**`{component.badge}`** — Small categorical label. Background `{colors.primary}` at 15% opacity (mint green tint), text `{colors.primary}` (full mint green), `{typography.mono}` (13px/400), 4px radius, 4px×12px padding. Used for version tags, status indicators, or category labels.

**`{component.code-inline}`** — Inline code or technical reference. Background `{colors.hairline-soft}` (8% white), text `{colors.accent}` (soft mint), `{typography.mono}`, 4px radius, 2px×8px padding. Makes code fragments visibly distinct from prose.

**`{component.divider}`** — Horizontal rule. `{colors.hairline}` background, 1px height, 100% width. Used to separate sections without visual weight.

## Do's and Don'ts

### Do

- Do use `{typography.display-xl}` (112px Manrope) for the hero headline and nothing smaller — the scale is intentional and non-negotiable for brand impact.
- Do render ALL body text, labels, descriptions, and metadata in `{typography.body-md}` or `{typography.mono}` (Geist Mono) — never use Manrope for running text.
- Do apply `{rounded.DEFAULT}` (20px) to every button — the system has no sharp-cornered buttons.
- Do use the forest-green gradient (`{colors.gradient-start}` → `{colors.gradient-mid}` → `{colors.gradient-end}`) as the hero band background, not a flat color.
- Do keep `{colors.primary}` (luminous mint green) restricted to the logo, brand emphasis, and semantic accents — it should never form a solid background block.
- Do apply `backdrop-blur` and semi-transparent dark backgrounds to floating elements like `{component.top-nav}` and `{component.dropdown-menu}` for glassmorphic depth.
- Do use `{colors.muted}` (75% white) for supporting text like `{component.hero-subhead}` — soft off-white should be reserved for headlines and nav.
- Do maintain 40px (`{spacing.xxl}`) padding on all button variants for consistent tap targets and visual mass.
- Do set input backgrounds to low-opacity white (`rgba(255, 255, 255, 0.12)`) for the frosted-glass terminal aesthetic.
- Do use `{colors.accent}` (soft mint) for all links and focus rings — it's a complementary highlight color in the forest-dark palette.
- Do allow generous whitespace (80px+ section padding) around the hero headline — the system's drama comes from isolation, not density.

### Don't

- Don't use bold weights (700+) for anything other than `{typography.button}` — even headlines stop at weight 500.
- Don't substitute `{colors.link}` (soft mint) for `{colors.primary}` (mint green) — they serve completely different semantic roles.
- Don't flatten the hero gradient to a solid `{colors.surface-soft}` — the emerald midpoint is essential to the brand's depth.
- Don't use `{typography.body-md}` (Geist Mono) for navigation items or buttons — those are exclusively Manrope territory.
- Don't add visible shadows to the hero band or main page background — depth comes from color, not elevation.
- Don't reduce button radius below `{rounded.DEFAULT}` (20px) — even "sharp" UI elements in this system are noticeably rounded.
- Don't place white `{component.button-primary}` buttons on pale mint backgrounds — they're designed for contrast against dark surfaces.
- Don't use `{colors.ink}` (soft off-white) for body paragraphs — that's reserved for headlines; body text should be `{colors.body}` (gray) or `{colors.muted}`.
- Don't expand the radius vocabulary beyond the defined tokens — the system's shape consistency relies on the 4px → 20px → 24px → 32px → 60px → 80px scale.
- Don't add gradients to button backgrounds — buttons are flat `{colors.canvas}` (white), transparent, or `{colors.surface-strong}` (dark gray).

## Motion & Animation

### Transition Tokens

```css
/* Color/opacity transitions — standard duration */
--transition-opacity: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
--opacity-slow: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
--opacity-fast: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);

/* Transform interactions — snappy */
--transform-quick: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), translate 0.1s cubic-bezier(0.4, 0, 0.2, 1), scale 0.1s cubic-bezier(0.4, 0, 0.2, 1), rotate 0.1s cubic-bezier(0.4, 0, 0.2, 1);

/* Background transitions */
--bg-transition: background 0.3s ease-in-out;

/* Filter effects */
--filter-transition: filter 0.3s ease-in-out;

/* Dropdown reveal */
--dropdown-reveal: all 600ms cubic-bezier(0.4, 0, 0.2, 1);

/* Container opacity fade-in */
--container-fade: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
```

### Keyframe Animations

- **spin** — Continuous 360° rotation, likely for loading indicators or decorative spinning icons.
- **fadeOut** — Opacity transition from 1 to 0, used for element exit animations.
- **fadeIn** — Opacity transition from 0 to 1, used for element entrance (hero content, modals, dropdowns).
- **shine** — A sweeping highlight/sheen effect across surfaces (likely a linear-gradient position animation for button polish).
- **blob** — Organic morphing shape animation, possibly for background decorative blobs or gradient movement.
- **progressBar** — Width-based progress indication, likely for loading or step-indicator bars.

### Interaction Patterns

- **Button scale on hover**: Primary and secondary buttons apply a subtle `scale` transform (0.9×–1.05× range) via `{--transform-quick}` timing (100ms). This creates tactile feedback without layout shift.
- **Dropdown slide-fade**: The `{component.dropdown-menu}` reveals with a 600ms opacity/transform transition (`{--dropdown-reveal}`), fading in while potentially translating downward slightly.
- **Container fade-in**: Hero and section containers fade from opacity 0→1 over 500ms on mount/scroll-into-view (`--container-fade`).
- **Nav glassmorphism blur**: The `{component.top-nav}` backdrop-filter engages smoothly, though browser optimization handles most of this natively.
- **Filter transitions**: Any image or gradient filter changes (saturation, brightness) animate over 300ms (`--filter-transition`).
- **Background color shifts**: Button and card background changes (e.g., `{component.button-dark}` → `{component.button-dark-hover}`) transition over 300ms (`--bg-transition`).
- **Opacity-only micro-interactions**: Disabled states, tooltip visibility, and subtle hover hints use fast 150ms opacity transitions (`--opacity-fast`).
- **Shine sweep on CTA**: The primary button likely features a periodic or hover-triggered `{shine}` animation — a diagonal light streak traveling across the button face to draw attention.

## Imagery Style

- The current hero section relies on **gradient-and-typography** imagery rather than photography or illustration — the forest-green gradient canvas IS the visual.
- When imagery appears (implied by the framework's documentation sections), it would likely follow a **code-editor aesthetic**: dark screenshots, monospaced fonts, syntax-highlighted code blocks on `{colors.surface}` or `{colors.surface-strong}` backgrounds.
- The NestJS bird logo (visible in the nav) is a **stylized, simplified mark** in `{colors.primary}` mint green — clean vector art with no gradients or shading.
- **No photography** is visible in the hero or above-fold area — the brand communicates through type, color, and space, not stock imagery.
- **Illustration style** (if present in lower sections) would likely be **abstract-geometric or line-based**, fitting the technical/developer tone — possibly wireframe diagrams, architectural node trees, or minimalist icons.
- **Code snippets** are treated as imagery — rendered in `{typography.mono}` or `{typography.body-md}` Geist Mono on dark surfaces, often with `{colors.accent}` (mint) syntax highlighting.
- **Background texture** is achieved through the gradient alone — no noise overlays, dot patterns, or grain are detected in the CSS.
- **Icon imagery** is strictly line-based (Lucide icons) at 1.5–2px stroke width, rendered in `currentColor` (white or inherited).

## Icon System

- **Library:** Lucide (detected from framework analysis: `iconLibs: ["lucide"]`).
- **Specific icons observed:**
  - GitHub (repo/social link in nav)
  - X / Twitter (social link in nav)
  - Discord (community link in nav)
  - LinkedIn (professional/social link in nav)
  - Chevron down (dropdown indicator on "Tools" nav item)
  - GitHub (repeated in "Github" CTA context)
  - Menu/hamburger (mobile nav trigger, implied)
  - X/close (mobile nav close button, implied)
  - NestJS bird (custom SVG logo mark, not from Lucide)
- **Treatment:** Stroke-based icons (not filled), 1.5–2px stroke weight, `currentColor` for color inheritance (typically white/{colors.ink}). Sizes: 20px for social icons in nav, 24px for standalone icon buttons, 16px for inline icons.
- **Alignment:** Icons center vertically with adjacent text, with 4–8px gap between icon and label. Standalone icon buttons use 8px padding in all directions for adequate touch targets.

## Recommended Frontend Stack

```
- Framework:      Next.js (React Router detected in scripts — React-based SSR/SSG framework)
- Styling:        Tailwind CSS v3+ (utility classes detected: sm:p-10, rounded-[32px], bg-gradient-to-r, etc.)
- Fonts:          Google Fonts: Manrope (wght@200..800) + Geist Mono (wght@200..800)
- Animation:      CSS transitions + keyframes (defined in extracted CSS); Framer Motion optional for complex sequences
- Icons:          Lucide React (npm: lucide-react)
- Component lib:  Custom components (no shadcn/Radix detection — hand-rolled with Tailwind utilities)
```

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 640px | Single-column layout, 16–24px padding, stacked CTAs, hamburger nav |
| Tablet (sm) | 640px–1023px | 4-column feature grid, 40px nav padding, still stacked hero |
| Desktop (md/lg) | 1024px–1279px | 5-column grid emerges, centered hero text, full horizontal nav visible |
| Wide (xl/2xl) | ≥ 1280px | Max container widths (1440–1458px), 80px section padding, full grid gaps (160px) |

### Touch Targets

- `{component.button-primary}`: ~200px × ~80px (40px padding + 16px text ≈ 72px+ height) — **exceeds** WCAG AAA 44×44 minimum comfortably.
- `{component.button-secondary}`: Same dimensions as primary — **exceeds** minimum.
- `{component.button-dark}`: Same dimensions — **exceeds** minimum.
- `{component.text-input}`: ~320px+ wide × ~68px tall (24px padding × 2 + ~20px text) — **exceeds** minimum significantly.
- `{component.nav-link}`: Text-dependent width, ~40px tall — meets minimum when padding accounted for.
- `{component.social-icon}` / `{component.nav-icon-btn}`: 36px×36px (24px icon + 8px padding × 2) — **meets** 44×44 minimum (barely; consider increasing to 44px).

### Collapsing Strategy

- **Navigation**: The horizontal `{component.top-nav}` (with logo, links, social icons) collapses to a fullscreen `{component.top-nav-blur}` overlay on mobile (< lg breakpoint). A hamburger icon triggers the overlay, which shows large vertical uppercase links (text-4xl) with a close (X) button top-right.
- **Hero headline**: The 112px `{typography.display-xl}` scales down responsively — likely via `responsive-text-size` or fluid typography (not explicitly in extracted CSS, but implied by `sm:text-base text-[0.95rem]` patterns on buttons suggesting responsive sizing).
- **CTA row**: Horizontal button pair stacks vertically on mobile, maintaining order (primary on top, secondary below).
- **Grid**: The 5-column desktop feature grid collapses to 4 columns on medium tablets (`md:grid-cols-4`), then to 2 or 1 column on mobile with reduced gaps (`md:gap-y-20` vs `xl:gap-y-25 xl:gap-x-40`).
- **Padding**: Section padding reduces from 80px (`{spacing.section-xl}`) on desktop to 40px (`{spacing.xxl}`) or less on mobile. Container horizontal padding drops from 80px to 24px (`sm:p-10 p-4` pattern observed on header).
- **Nav bar rounding**: The 32px rounded corners on `{component.top-nav}` reduce to 16px on mobile (`sm:rounded-[32px] rounded-[16px]`).

### Image Behavior

- **Hero gradient**: The forest-green gradient background is `background-size: cover` or similar — it fills the `{component.hero-band}` container at all breakpoints, with the gradient anchors adjusting proportionally.
- **Logo mark**: The NestJS bird icon likely scales down slightly on mobile (from ~32px to ~24–28px) to fit the compressed nav height.
- **Code decoration**: The faint code snippet visible bottom-right of the hero likely hides on mobile to reduce visual noise, or repositions below the CTA row.
- **Dropdown menus**: On touch devices, the `{component.dropdown-menu}` likely converts to a tap-to-expand accordion pattern rather than a hover-reveal dropdown.

## Iteration Guide

1. Build a landing page that closely mimics the NestJS design system in this DESIGN.md. Use **Next.js** with **Tailwind CSS** as the styling layer — the extracted classes (`sm:p-10`, `rounded-[32px]`, `bg-gradient-to-r`, `hover:scale`) map directly to Tailwind utilities.

2. Pull every color, font, radius, and spacing value from the YAML frontmatter via the `{section.token}` paths. Define these as Tailwind theme extensions (e.g., `theme.colors.primary`, `theme.borderRadius.DEFAULT`). Never hard-code a hex or pixel value that has a token.

3. Add state variants (`-hover`, `-focus`, `-disabled`, `-active`) per Tailwind's variant conventions (e.g., `hover:bg-white`, `focus:ring-2 focus:ring-green-300`). The spec documents Default and Active/Pressed/Focus states as separate component entries — implement them as pseudo-class or data-state variants.

4. When adding a new component, decide first which sub-system it belongs to: **Marketing Landing** (hero, features, CTAs), **Documentation Surface** (darker cards, code blocks), or **Navigation Chrome** (nav, dropdowns, mobile menu). Each sub-system shares the same tokens but differs in density and surface elevation.

5. Variants of an existing component live as separate frontmatter entries (`button-primary-hover`, `text-input-focus`, `nav-link-active`) — never nest them. In your component code, accept a `variant` prop that maps to the appropriate token set.

6. Run `npx @google/design.md lint DESIGN.md` after edits — `broken-ref`, `contrast-ratio`, and `orphaned-tokens` warnings flag issues automatically. Pay special attention to `{colors.on-primary}` contrast against `{colors.primary}` (mint green-on-white must meet WCAG AA).

7. When in doubt about emphasis: bigger type before bolder type (the 112px headline carries more weight at 500 than any smaller text could at 700), signature gradient surface before solid accent color, and monospaced body text before sans-serif.

8. Implement the glassmorphic nav using Tailwind's `backdrop-blur-lg bg-black/60 border border-white/15 rounded-3xl` utilities — these directly map to `{component.top-nav}` specs.

9. For the hero gradient, use Tailwind's `bg-gradient-to-r from-[#080F0D] via-[#146B49] to-[#080F0D]` with `rounded-3xl` on the section container. Ensure the gradient spans full-width within the max-width-constrained parent.

10. Font setup: Import Manrope and Geist Mono from Google Fonts in your layout/root file. Define CSS custom properties:
    ```css
    :root {
      --font-heading: 'Manrope', sans-serif;
      --font-body: 'Geist Mono', monospace;
    }
    ```
    Apply `font-family: var(--font-heading)` to `h1`–`h4`, `nav`, `button`; apply `font-family: var(--font-body)` to `p`, `span`, `label`, `input`, `code`.

## Known Gaps

- **Hover state styling specifics**: While we know buttons scale on hover (0.9×–1.05×), the exact background color shifts for `{component.button-secondary-hover}` and `{component.nav-link-hover}` are inferred from partial CSS classes — implementers should test and refine.
- **Loading skeletons / pending states**: No loading spinner, skeleton placeholder, or suspense boundary styles were extractable from the static screenshot. Recommend implementing a pulse animation using `{colors.hairline-soft}` background.
- **Form validation states beyond focus**: Error (`{colors.error}`), warning (`{colors.warning}`), and success (`{colors.success}`) states for inputs are defined as color tokens but no specific component entries (e.g., `text-input-error`) were observable.
- **Authenticated-only flows / dashboard surfaces**: The screenshot shows only the public marketing landing page. Dashboard, admin, or authenticated user interfaces (if they exist) may introduce new surface elevations, sidebar components, or data-table patterns not captured here.
- **Mobile menu animation specifics**: We know the mobile nav is a fullscreen overlay (`{component.top-nav-blur}`), but the exact entrance/exit animation (slide-from-right? fade? scale?) is partially inferred from `fadeIn`/`fadeOut` keyframe names.
- **Pixel-exact gradient midpoint positioning**: The `{colors.gradient-mid}` (`#146B49`) forest green zone's horizontal position (40%? 50%? 60%?) affects the visual depth balance. Implementers should tune `via-` position in the Tailwind gradient class.
- **Accessibility focus-visible ring thickness/style**: While `{colors.border-focus}` is defined as the focus color, the exact ring offset (2px? 4px?), spread, and whether it uses `outline` or `box-shadow` was not explicitly extractable. Recommend `ring-2 ring-offset-2 ring-offset-black`.
- **Dark mode toggle**: The site appears to be dark-mode-only (no light mode variant detected). If a light mode is added later, it would require a complete surface/token inversion not covered by this spec.
- **Sub-brand palettes**: NestJS may have Enterprise, Courses, or Certified sub-brands with modified color treatments (e.g., Courses might use an alternate accent instead of mint green primary). These are not represented here.
- **3D / illustration assets**: No 3D renders, illustrations, or photographic assets appeared in the extracted DOM. If lower sections contain these, their treatment (border-radius, shadows, aspect ratios) is undocumented.