---
name: LabExpress Clinical Home
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#43474f'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#737780'
  outline-variant: '#c3c6d1'
  surface-tint: '#3a5f94'
  primary: '#001e40'
  on-primary: '#ffffff'
  primary-container: '#003366'
  on-primary-container: '#799dd6'
  inverse-primary: '#a7c8ff'
  secondary: '#006497'
  on-secondary: '#ffffff'
  secondary-container: '#77c2ff'
  on-secondary-container: '#004f79'
  tertiary: '#00240e'
  on-tertiary: '#ffffff'
  tertiary-container: '#003c1b'
  on-tertiary-container: '#2cb163'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a7c8ff'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#1f477b'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#92ccff'
  on-secondary-fixed: '#001e31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#7efba4'
  tertiary-fixed-dim: '#61de8a'
  on-tertiary-fixed: '#00210c'
  on-tertiary-fixed-variant: '#005228'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-xl:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 30px
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1.25rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 1.75rem
  space-xl: 2.5rem
---

## Brand & Style
The design system establishes a clinical, reassuring, and impeccably organized aesthetic suited for home-visit laboratory diagnostics in Chile. Its identity balances medical rigor with domestic warmth, prioritizing accessibility, visual hygiene, and immediate cognitive clarity. 

The aesthetic leverages Modern Clinical Clarity: generous white space, strong structural rhythm, accessible affordances, and unmistakable color-coded semantic signals. Every touchpoint instills confidence for elderly demographics, caregivers, and patients undergoing diagnostic vulnerability, replacing clinical coldness with authoritative, human-centered hospitality.

## Colors
The palette is built strictly around clinical trust, clarity, and uncompromising contrast.

- **Primary (`#003366` - Deep Corporate Navy):** Delivers authority, institutional stability, and structural anchor across headers, primary CTAs, active states, and high-emphasis labels. Meets WCAG AAA compliance on light surfaces.
- **Secondary (`#2980B9` - Clinical Cerulean):** Represents medical technology, flow progression, secondary interactive triggers, and informational iconography.
- **Tertiary / Success (`#27AE60` - Clinical Emerald):** Dedicated strictly to validated actions, completed collections, confirmed sample statuses, and cold-chain/temperature integrity indications.
- **Alert / Fasting Warning (`#E0564C` - Soft Coral Red):** Specifically designated for strict clinical preparation cues (e.g., compulsory fasting, medication pauses) without evoking punitive panic.
- **Neutral Surface (`#F8F9FA` - Sanitized Off-White):** Provides an anti-glare, hygienic canvas that mitigates optical fatigue compared to pure harsh white.
- **Text & Contrast Standards:** Default body text uses `#142132` against `#F8F9FA` or white card surfaces to exceed AAA contrast targets (7:1+ ratio).

## Typography
The typographic architecture specifically accommodates elderly readers and people with diminished visual acuity.

- **Headline Font:** *Plus Jakarta Sans* brings human warmth, balanced apertures, and structural clarity, steering away from sterile technical forms without losing medical authority.
- **Body & Label Font:** *Atkinson Hyperlegible Next* ensures unambiguous character distinction (such as `1`, `I`, `l`, and `0`, `O`). This differentiation avoids errors when reading specimen numbers, preparation hours, and diagnostic profiles.
- **Scale Rules:** Minimum readable body size is locked at `16px`, with key instructional text scaling to `18px` (`body-lg`) or `20px` (`body-xl`). Line heights remain generous (1.5x minimum) to prevent line confusion during high-stress scheduling or specimen preparation reviews.

## Layout & Spacing
The layout follows a fluid-responsive grid system designed for effortless reading, scanning, and physical interaction on touchscreens:

- **Desktop (1024px+):** 12-column grid with 24px (`1.5rem`) gutters and a max-width container capped at 1200px to maintain comfortable reading line-lengths (max 65–70 characters).
- **Tablet (768px - 1023px):** 8-column grid with 20px gutters and 24px margins.
- **Mobile (< 768px):** 4-column layout with 16px (`1rem`) gutters and 20px (`1.25rem`) lateral margins.
- **Touch-First Hit Areas:** Element gaps and component tap areas systematically exceed standard 44px boundaries, enforcing an absolute minimum of 52px for all clickable and selectable clinical elements.

## Elevation & Depth
Elevation reinforces order and surgical cleanliness rather than dramatic visual flair.

- **Flat Sterile Substrates:** Base content rests on `#F8F9FA`. Interactive surfaces, clinical procedure forms, and exam bundles emerge on pure white (`#FFFFFF`) containers.
- **Micro-Contrast Outlines:** Instead of heavy drop shadows, cards use a subtle 1px border (`#E2E8F0` or `#CBD5E1`) paired with minimal ambient diffusion: `0 2px 8px rgba(0, 51, 102, 0.04)`.
- **Floating Modals & Dispatch Trays:** Crucial bottom sheets and schedule confirmations use elevated depth with a high-spread, low-opacity navy tincture: `0 12px 32px rgba(0, 51, 102, 0.12)`.

## Shapes
A roundedness factor of 2 provides a balanced, approachable contour:

- **Cards & Modal Layers:** 16px (`rounded-lg`) corner radii, visually softening the interface to reduce clinical anxiety while retaining architectural discipline.
- **Action Buttons & Form Controls:** 8px to 10px boundary radii, clearly defining interactive buttons without turning them into ambiguous pills.
- **Clinical Badges & Badging Chips:** Fully rounded pill-geometry (9999px) for discrete, stamp-like recognition across exam status cards.

## Components

### Buttons & Interactive Controls
- **Primary Button:** Filled `#003366` Navy with `#FFFFFF` text. Minimum height of 54px, bold `18px` typography, and minimum 24px horizontal padding. Focus states feature an unmistakable 3px double ring (`#2980B9` outer, `#FFFFFF` inner) for accessibility.
- **Secondary Button:** Outlined with a 2px border in `#003366`, transparent surface, `#003366` typography, transitioning to a light blue wash (`rgba(41, 128, 185, 0.08)`) on interaction.

### Clinical Badges & Flags (Insignias)
- **Fasting Required (Alerta de Ayuno):** Soft Coral background tint (`#FDEDEB`), 1.5px solid border `#E0564C`, `#9E2B25` high-contrast bold text with a prominent clock/cutlery icon.
- **Cold Chain Certified (Cadena de Frío):** Emerald tint (`#EAF8F0`), 1.5px solid border `#27AE60`, `#196F3D` high-contrast bold text accompanied by a temperature/snowflake indicator.
- **Special Instruction Chip:** Pale cerulean tint (`#EBF5FB`), `#2980B9` border, and `#1B4F72` text for routine instructions (e.g., first morning urine, hydration).

### Diagnostic Cards & Exam Bundles
- Background: `#FFFFFF` encased in a 1.5px `#E2E8F0` border.
- Layout: Large header indicating the exam name (e.g., *Perfil Lipídico*, *Hemograma Completo*), immediate preparation requirement badges docked visibly at the top right, clear price breakdown, and an immediate checkbox toggle or addition CTA.
- Mobile spacing: Internal card padding of at least 20px (`1.25rem`) to prevent accidental clicks.

### Form Inputs & Date/Time Selectors
- Standard inputs: 54px height with a 1.5px border (`#94A3B8`). Active input state transforms to a 2px `#003366` stroke with `#F0F6FA` background fill.
- Supporting label text sits permanently above the field in `label-lg` (no floating labels that disappear or shrink into low legibility).
- Slot selector (nurse arrival window): Card-based radio pills with direct, explicit text (e.g., "07:00 - 08:30 hrs • Ideal para ayuno") instead of compact dropdown pickers.

### Checkboxes & Radios
- Sized at a generous 24px × 24px bounding box centered inside a minimum 48px touch zone.
- Checked state uses solid `#003366` with high-contrast `#FFFFFF` check vectors.