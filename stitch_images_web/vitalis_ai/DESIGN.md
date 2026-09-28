---
name: Vitalis AI
colors:
  surface: '#111319'
  surface-dim: '#111319'
  surface-bright: '#373940'
  surface-container-lowest: '#0c0e14'
  surface-container-low: '#191b22'
  surface-container: '#1e1f26'
  surface-container-high: '#282a30'
  surface-container-highest: '#33343b'
  on-surface: '#e2e2eb'
  on-surface-variant: '#bccabb'
  inverse-surface: '#e2e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#869486'
  outline-variant: '#3d4a3e'
  surface-tint: '#4de082'
  primary: '#6bfb9a'
  on-primary: '#003919'
  primary-container: '#4ade80'
  on-primary-container: '#005e2d'
  inverse-primary: '#006d36'
  secondary: '#adc8f5'
  on-secondary: '#133155'
  secondary-container: '#2f4a70'
  on-secondary-container: '#9fbae6'
  tertiary: '#7cf994'
  on-tertiary: '#003914'
  tertiary-container: '#5fdc7b'
  on-tertiary-container: '#005e26'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6dfe9c'
  primary-fixed-dim: '#4de082'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005227'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#adc8f5'
  on-secondary-fixed: '#001c3b'
  on-secondary-fixed-variant: '#2d486d'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#111319'
  on-background: '#e2e2eb'
  surface-variant: '#33343b'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
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
  margin-mobile: 1rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies a calm, precise, and scientifically grounded aesthetic engineered for an AI Nutrition Assistant. It balances the technological intelligence of modern machine-learning interfaces with the restorative, organic vitality of nutritional health. 

The visual language draws on **Refined Minimalism** with functional data density:
- **Tone:** Methodical, encouraging, clinical yet welcoming, unobtrusive.
- **Visual Style:** High legibility against deep dark foundations, precise hairline borders, clean geometric structure, and vibrant botanical accents that denote energy, metabolic health, and clarity.
- **Emotional Response:** Inspires trust, mindfulness, control, and reduced cognitive load during dietary tracking and computational wellness consultations.

## Colors

The palette operates on a purposeful contrast between subterranean dark neutrals and vitalizing bio-greens, balanced by focused slate blues for conversational flow.

### Color Tokens & Semantic Usage
- **Primary Accent (`#4ade80`):** Fresh spring green representing metabolic vitality, positive nutritional values, confirmation states, and key call-to-actions. Hover states darken deliberately to `#16a34a`.
- **Canvas Base (`#0f1117`):** Near-black deep charcoal minimizing eye strain and highlighting data visualizations and content blocks.
- **Surface Elevation (`#1a1d27`):** Default card background, elevated side panels, and assistant chat bubbles.
- **Structural Outlines (`#2a2d3a`):** Hairline boundary borders defining hierarchy, structural divisions, and container containment without visual weight.
- **Secondary Tone (`#1e3a5f`):** Controlled muted navy dedicated to user chat bubbles, active input focal states, and user-initiated timeline markers.
- **Text & Hierarchy:**
  - **Primary Text (`#e2e8f0`):** High-contrast crisp light slate for headlines, body copy, and active metric values.
  - **Muted Text (`#64748b`):** Cool slate gray for timestamps, secondary nutritional labels, units, and structural metadata.

## Typography

The typography relies entirely on **Inter** to maintain neutral, objective, and frictionless communication across high-density nutrition logs and contextual conversational AI outputs.

- **Numbers & Metrics:** Tabular figures (`font-variant-numeric: tabular-nums`) must be enabled across all calorie counts, macro ratios, and physiological measurements to guarantee clean vertical scanning.
- **Hierarchy:** Strict two-tone hierarchy where headings and active metrics adopt `#e2e8f0`, while accompanying units (e.g., `kcal`, `g`, `mg`) and subheaders transition to `#64748b`.
- **Editorial Microcopy:** Small labels (`label-sm`) default to uppercase tracking for category tags (e.g., `PROTEIN`, `MICRONUTRIENTS`, `SYSTEM ALERT`).

## Layout & Spacing

The interface operates on a responsive fluid layout structured around an 8px rhythmic baseline.

- **Layout Structure:**
  - **Desktop (≥1024px):** 12-column dynamic grid. Conversational viewports utilize a dual-pane layout: a persistent left analytics rail (macros, daily caloric deficit/surplus, hydration) spanning 4 columns, and an expansive 8-column conversational stream.
  - **Tablet (768px – 1023px):** Collapsible contextual sheet for biometric analytics, allocating full-width focus to chat and food logging workflows.
  - **Mobile (<768px):** Single-column stacked stream with fixed bottom prompt input and sticky macro summary pills.
- **Rhythm & Padding:** Card components maintain generous internal breathing room (`space-lg` desktop, `space-md` mobile) to counteract dark-mode claustrophobia and compartmentalize analytical data cleanly.

## Elevation & Depth

Visual hierarchy uses a **layered surface model** backed by low-contrast borders rather than prominent drop shadows.

1. **Base Layer (`#0f1117`):** The ground level for page layouts and canvas viewports.
2. **Elevated Surface (`#1a1d27`):** Applied to cards, modular panels, bottom sheets, and assistant chat message containers.
3. **Hairline Separation (`#2a2d3a`):** A persistent 1px border surrounds all elevated cards, input fields, and assistant containers, defining clean edges against the dark background.
4. **Focused Depth & Ambient Glow:** Drop shadows are restrained. Primary buttons and active nutrient target gauges project a low-opacity botanical halo: `0 4px 20px rgba(74, 222, 128, 0.15)`. Modals and floating sheets utilize deep ambient diffusion: `0 12px 32px rgba(0, 0, 0, 0.45)`.

## Shapes

The interface blends structural geometry with soft, natural curves to balance technical accuracy with organic warmth:

- **Cards & Chat Bubbles:** 12px border-radius (`rounded-lg` level) for primary cards, conversational bubbles, and data modules.
- **Micro Elements:** 6px border-radius for input controls, checkboxes, table rows, and secondary utility badges.
- **Action Controls & Filters:** Complete pill geometry (`border-radius: 9999px`) reserved for tag chips, macro pill indicators, filter controls, and interactive primary floating actions.

## Components

### Buttons
- **Primary Button:** Background `#4ade80`, text `#0f1117` (bold weight for immediate contrast), pill-shaped (`9999px`), internal padding `0.75rem 1.5rem`. On hover, transitions to `#16a34a` with subtle upward micro-translation.
- **Secondary Button:** Surface `#1a1d27`, border 1px solid `#2a2d3a`, text `#e2e8f0`, pill-shaped. On hover, background shifts to `#2a2d3a`.
- **Ghost/Tertiary:** Transparent fill, text `#64748b`, hover color `#e2e8f0`.

### Chat Bubbles (AI & User)
- **User Bubble:** Background `#1e3a5f`, text `#e2e8f0`, border-radius 12px with bottom-right corner anchored to 4px. Max width 80% desktop, 88% mobile.
- **Assistant Bubble:** Background `#1a1d27`, 1px border `#2a2d3a`, text `#e2e8f0`, border-radius 12px with bottom-left corner anchored to 4px. Rich text nested inside (such as macro tables, breakdown lists, and ingredient lists) sits on sub-containers with subtle dark fills.

### Cards & Analytical Widgets
- Built on `#1a1d27` with 12px radius and 1px `#2a2d3a` border.
- Headers feature title text in `#e2e8f0` (`headline-sm`) accompanied by muted subtexts in `#64748b`.
- Metric blocks display primary numeric data in `#e2e8f0` alongside macro-specific accent badges (e.g., Protein in `#4ade80`, Carbs in muted cyan, Fats in warm amber).

### Chips & Filter Pills
- Pill-shaped (`9999px`), padding `0.375rem 0.875rem`, font size `12px`.
- Inactive: Background `#1a1d27`, border 1px solid `#2a2d3a`, text `#64748b`.
- Active: Background `rgba(74, 222, 128, 0.12)`, border 1px solid `#4ade80`, text `#4ade80`.

### Form Inputs & Chat Bar
- Chat input bar sits inside a fixed bottom container, background `#1a1d27`, border 1px solid `#2a2d3a`, rounded to 12px or pill geometry, text `#e2e8f0`, placeholder `#64748b`.
- Focused state transitions border to `#4ade80` with a clean `0 0 0 1px #4ade80` outer outline.

### Checkboxes & Selection Controls
- Base: 18px square box, 4px border-radius, background `#0f1117`, border 1px solid `#2a2d3a`.
- Checked: Background `#4ade80`, check icon filled `#0f1117`.

### Specialized Domain Components
- **Macro Progress Gauge:** Linear or radial tracks with track background `#2a2d3a` and indicator fill `#4ade80`.
- **Nutrient Tag:** Minimal inline badge for ingredients and food items, with `#1a1d27` background and `#64748b` typography, transitioning on tap to show detailed micronutrient modal breakdowns.