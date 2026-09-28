---
name: Vitality Dark
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
  tertiary: '#ffd9c1'
  on-tertiary: '#4f2500'
  tertiary-container: '#ffb47f'
  on-tertiary-container: '#794418'
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
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb784'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#6c3a0f'
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
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  metric-display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system establishes a high-precision, focused atmosphere tailored for personalized nutrition planning, dietary telemetry, and conversational intelligence. Combining Modern Minimalism with soft luminescent depth, the interface trades sterile medical aesthetics for an organic yet disciplined computational workspace.

### Target Audience & Emotional Intent
- **Audience:** Health-conscious individuals, performance athletes, and individuals managing clinical dietary protocols who require instant, data-backed meal breakdowns and AI-driven coaching.
- **Atmosphere:** Calm, scientific, non-judgmental, and vigilant. The deep background minimizes ocular strain during late-night journaling or dawn meal prep, while biological green accents trigger perceptions of renewal, vitality, and verified progress.

### Aesthetic Principles
- **Atmospheric Restraint:** Negative space dominates. Dense macronutrient data is balanced with generous paddings to avoid sensory fatigue.
- **Luminescent Hierarchy:** Pure white is avoided for large typographic elements; hierarchy relies on calibrated slates and high-contrast verdant highlights that emulate biological instrumentation readouts.
- **Physical Demarcation:** Form boundaries are anchored by razor-thin, low-contrast structural strokes (#2a2d3a) rather than aggressive drop shadows.

## Colors

The palette leverages a deep obsidian core, clinical slate typography, and energetic botanical accents to signify balance and physiological vitality.

### Color Roles & Implementation
- **Base Canvas (`#0f1117`):** The foundational viewport layer. Provides absolute contrast without the eye-straining harshness of pure `#000000`.
- **Card & Surface Background (`#1a1d27`):** Raised container surface used for cards, floating menus, and AI response modules.
- **Borders & Structural Grid (`#2a2d3a`):** 1px structural strokes separating dashboard sections, table rows, and card wrappers.
- **Primary / Active Highlight (`#4ade80`):** Vitality Green. Dedicated strictly to primary calls-to-action, success confirmations, active nutritional metric rings, and target completion states.
- **Primary Hover / Focus (`#16a34a`):** The interactive state for actionable primary surfaces, grounding the bright accent into a saturated deep emerald.
- **Primary Typography (`#e2e8f0`):** Slate 200. High-legibility, anti-glare textual content for headlines, active values, and primary responses.
- **Secondary & Muted Typography (`#64748b`):** Slate 500. Structural labels, timestamps, measurement units (e.g., "kcal", "g"), and placeholder cues.
- **User Conversation Bubble (`#1e3a5f`):** Muted Deep Navy. Establishes clear conversational orientation and ownership without competing with the primary green accent.
- **Assistant Conversation Bubble (`#1a1d27`):** Blends harmoniously with surface depth, backed by a subtle border to delineate structured recommendations from user inputs.

## Typography

The type system uses `Inter` throughout all hierarchy levels to create a clean, modern, and clinical aesthetic.

### Application Rules
- **Numerical Telemetry:** When rendering dietary quantities, macronutrient splits, and calorie goals, apply tabular figures (`font-variant-numeric: tabular-nums`) to ensure vertical column stability.
- **Letter Spacing Constraints:** Negative tracking is systematically applied to `headline-xl`, `headline-lg`, and `metric-display` to keep large type compact and deliberate. Labels under 12px require positive letter tracking (`0.02em` - `0.04em`) to maintain legibility against dark surfaces.
- **Line Heights:** Body copy line height is kept generous (minimum 1.55x) to maintain effortless parsing across lengthy dietary plans, ingredient logs, and multi-turn AI responses.

## Layout & Spacing

The interface implements a fluid 12-column layout on desktop viewports, condensing to an adaptive single-column conversation and telemetry stream on mobile devices.

### Layout Mechanics
- **Desktop (1024px+):** Max layout width capped at `1440px`. Two-tier visual composition: a sticky 360px sidebar/telemetry panel alongside a responsive conversation and analysis viewport. Gutters sit at `1.5rem` (`24px`) with outer canvas margin of `2rem` (`32px`).
- **Tablet (768px - 1023px):** Fluid column scaling with `1rem` (`16px`) gutters. Sidebars fold into an off-canvas drawer; nutritional targets pin to a top horizontal scrolling strip.
- **Mobile (< 768px):** Strict single-column stack. Margins collapse to `1rem` (`16px`) to maximize horizontal screen space for conversation cards and macro breakdowns.

### Spacing Cadence
Component internal layouts follow a strict 4px/8px rhythm:
- Use `space-xs` (6px) exclusively for pill badges, metric unit margins, and icon-to-label inline offsets.
- Use `space-sm` (12px) for form inputs, interactive chip padding, and conversational bubble internal offsets.
- Use `space-md` (16px) for intra-card sectioning, list row separation, and search bar padding.
- Use `space-lg` (24px) for card body padding and chart boundaries.
- Use `space-xl` (36px) to demarcate chronological message groupings and disparate dietary sections.

## Elevation & Depth

Visual depth avoids excessive skewing or blurry drop shadows in favor of crisp architectural tiers built from low-contrast outlines and tonal contrast.

### Stacking Hierarchy
- **Canvas Base (`#0f1117`):** The zero-level substrate. No shadow, no border.
- **Surface Elevation 1 (`#1a1d27`):** Standard resting state for cards, tables, and AI responses. Demarcated by a persistent `1px solid #2a2d3a` border and a faint ambient drop: `box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.45)`.
- **Surface Elevation 2 (`#202433`):** Active hover states, interactive dropdown menus, and popover tooltips. Retains the `1px solid #2a2d3a` outline, paired with a subtle vertical cast: `box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6)`.
- **Input & Control Wells (`#13151d`):** Sunken interior surfaces for text inputs, message composition bars, and toggle backgrounds. Features a soft inner border tone (`#232634`) and inset depth: `box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4)`.

### Accent Glow
Interactive success states or live AI analysis indicators can cast a focused soft emerald aura:
`box-shadow: 0 0 16px -2px rgba(74, 222, 128, 0.25)`.

## Shapes

The design system employs a calibrated dual-radius language to establish visual hierarchy between foundational containers and operational controls.

### Radius System
- **12px Radius (`rounded-lg` / `0.75rem`):** Applied systematically to macro containers—cards, assistant response cards, user chat bubbles, modal dialogs, and macro analytics panels.
- **6px Radius (`rounded-sm` / `0.375rem`):** Applied systematically to fine-grained micro-elements—inline status pills, individual food tag chips, button triggers, input fields, checkboxes, and micro progress bars.
- **Pill (Full Radius):** Reserved exclusively for live status chips (e.g., "Active Plan", "Logging"), avatar containers, and macro progress track limits.

## Components

### Buttons
- **Primary CTA:** Background `#4ade80`, text `#0f1117`, font-weight `600`, radius `6px`. Hover switches to `#16a34a` with zero color flash. Focused with a 2px offset ring of `#4ade80`.
- **Secondary / Ghost:** Background `transparent`, border `1px solid #2a2d3a`, text `#e2e8f0`. Hover transitions background to `rgba(255, 255, 255, 0.04)` and border to `#64748b`.
- **Padding:** Vertical `8px`, horizontal `16px` for standard controls; vertical `6px`, horizontal `12px` for compact table-row actions.

### Cards & Telemetry Containers
- Background `#1a1d27`, border `1px solid #2a2d3a`, border-radius `12px`, padding `24px`.
- Card headers feature an upper section with `label-md` uppercase text in `#64748b` paired with a top-right action icon or trend indicator.

### Conversational Interface (Chat Bubbles)
- **User Bubble:** Background `#1e3a5f`, border `1px solid #2b4c77`, radius `12px` with the bottom-right corner pulled to `4px`. Text `#e2e8f0`. Aligned right.
- **Assistant Bubble:** Background `#1a1d27`, border `1px solid #2a2d3a`, radius `12px` with the bottom-left corner pulled to `4px`. Text `#e2e8f0`. Aligned left. Integrated markdown tables and bulleted macro recommendations use a nested secondary border `#2a2d3a` with 6px internal radii.
- **Message Input Area:** Sticky bar anchored over the canvas with a background of `#13151d`, border `1px solid #2a2d3a`, text `#e2e8f0`, placeholder `#64748b`, radius `12px`, and a direct submit button styled as an emerald primary circle or 6px action icon.

### Form Inputs & Checkboxes
- **Text & Numeric Inputs:** Background `#13151d`, border `1px solid #2a2d3a`, text `#e2e8f0`, placeholder `#64748b`, radius `6px`, height `40px`, padding `0 12px`. Focus state transitions border to `#4ade80` without changing the surface background.
- **Checkboxes & Radios:** Size `18px x 18px`, radius `4px` (checkbox) or circular (radio), background `#13151d`, border `1px solid #2a2d3a`. Checked state switches background to `#4ade80` with a pure `#0f1117` checkmark glyph.

### Nutrition Chips & Badges
- **Nutrient Tag Chips (Protein, Carbs, Fats):** Background `rgba(30, 58, 95, 0.4)`, border `1px solid #2a2d3a`, radius `6px`, padding `4px 10px`. Value text rendered in `label-sm` (`#e2e8f0`) with nutrient identifier in `#64748b`.
- **Status Indicator Pill:** Background `rgba(74, 222, 128, 0.1)`, border `1px solid rgba(74, 222, 128, 0.3)`, text `#4ade80`, radius `9999px`, padding `2px 8px`. Accompanied by a 6px static dot.

### Lists & Data Rows
- Row items separated by a `1px solid #2a2d3a` bottom divider. 
- Interactive items feature a subtle hover background tint (`rgba(255, 255, 255, 0.02)`) with a smooth 150ms ease-out transition. Metric readouts align right using tabular figures.