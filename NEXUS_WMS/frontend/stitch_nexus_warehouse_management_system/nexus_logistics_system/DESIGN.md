---
name: Nexus Logistics System
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fd'
  surface-container: '#ededf8'
  surface-container-high: '#e7e7f2'
  surface-container-highest: '#e1e2ec'
  on-surface: '#191b23'
  on-surface-variant: '#434654'
  inverse-surface: '#2e3038'
  inverse-on-surface: '#f0f0fb'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#404445'
  on-tertiary: '#ffffff'
  tertiary-container: '#585b5d'
  on-tertiary-container: '#d1d3d5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ec'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.05em
  mono-label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for high-velocity logistics and warehouse management environments where data density and clarity are paramount. The brand personality is **authoritative, precise, and dependable**, bridging the gap between rugged industrial utility and high-end enterprise software.

The visual style follows a **Modern Enterprise** aesthetic: a synthesis of systematic grid-based layouts and subtle modern refinements. It prioritizes functional minimalism to reduce cognitive load during complex inventory workflows. Key characteristics include:
- **Functional Density:** Information is packed tightly but remains legible through rigorous alignment and hierarchy.
- **Purposeful Chrome:** Navigation elements use deep, grounding tones to provide a stable frame for dynamic warehouse data.
- **Action-Oriented:** Primary interactions are clearly demarcated with high-contrast professional blues, while status-driven colors provide immediate "at-a-glance" situational awareness.

## Colors

The palette is anchored by **Deep Slate (#1E293B)** for structural navigation and headers, providing a "heavy" professional foundation. **Professional Blue (#0052CC)** is reserved strictly for primary actions and interactive states to ensure a clear path to task completion.

Functional colors are mapped to inventory states:
- **Success Green:** Indicates optimal stock levels and completed shipments.
- **Warning Amber:** Flags expiring batches or low-stock thresholds.
- **Danger Red:** Signals stock-outs, overdue orders, or critical system errors.
- **Neutral Grays:** Used for secondary text, borders, and subtle background shifts to define data groupings without adding visual noise.

## Typography

The typography system utilizes **Inter** exclusively, leaning on its exceptional legibility and robust OpenType features. 

For data-heavy tables and inventory counts, the design system employs **Tabular Numerals (`tnum`)** to ensure numerical values align vertically, facilitating rapid scanning of SKU quantities and weights. 
- **Hierarchy:** Headlines are bold and slightly condensed in tracking to maintain a modern look. 
- **Utility:** Small labels use uppercase with increased tracking for clear categorization in tight spaces. 
- **Mobile:** On smaller screens, `display-lg` scales down to 28px to prevent excessive wrapping in dashboard views.

## Layout & Spacing

This design system adheres to a **strict 8px grid** to ensure mathematical harmony across all components. 

- **Layout Model:** A 12-column fluid grid is used for the main content area, while the left-hand navigation remains a fixed 240px width (collapsible to 64px). 
- **Data Density:** In high-density views (e.g., Picking Lists), vertical spacing may be reduced to 4px (xs) to maximize information on a single screen. 
- **Breakpoints:** 
    - **Desktop (1280px+):** Full navigation, 32px outer margins. 
    - **Tablet (768px - 1279px):** Collapsed sidebar, 24px margins. 
    - **Mobile (<767px):** Single column stack, 16px margins, bottom navigation or "Hamburger" menu.

## Elevation & Depth

To maintain the professional "Modern Enterprise" feel, elevation is used sparingly to define functional planes rather than decorative depth.

1.  **Level 0 (Flat):** The main background surface, using `#F8FAFC`.
2.  **Level 1 (Card/Surface):** White backgrounds with a **1px solid border (#E2E8F0)**. Shadows are avoided here to keep the interface crisp.
3.  **Level 2 (Active/Interactive):** Subtle ambient shadows (0px 1px 3px rgba(0,0,0,0.1)) are used for hover states on buttons and cards.
4.  **Level 3 (Overlays):** Modals and dropdowns use a more pronounced shadow (0px 10px 15px -3px rgba(0,0,0,0.1)) to clearly separate them from the underlying data grid.

The design system uses **Tonal Layering** instead of heavy shadows to show hierarchy, where the side navigation and top header sit on a higher visual priority through color contrast rather than physical displacement.

## Shapes

The shape language is **Soft (4px / 0.25rem)**, reflecting a disciplined, industrial precision. 

- **Standard Elements:** Buttons, input fields, and status badges use the base 4px radius.
- **Large Containers:** Dashboard KPI cards and data tables use the `rounded-lg` (8px) setting to provide a slight visual softening of the complex layout.
- **Interactive States:** Checkboxes maintain a crisp 2px radius to maximize the interior "check" area for visibility.

## Components

### Data Tables
The centerpiece of the WMS. Features include:
- **Sticky Headers:** Always visible during scroll.
- **Zebra Striping:** Alternating rows using `#F8FAFC` for high-volume readability.
- **Inline Actions:** Hover-triggered icons to reduce visual clutter.

### KPI Cards & Sparklines
Dashboard summaries utilize large-format numbers (`headline-lg`) with an integrated 48px-high sparkline in the footer. Sparklines use success, warning, or danger colors based on the 24-hour trend.

### Status Badges
Used for stock levels and order status. Badges utilize a **subtle tint fill** (10% opacity of the base color) with a **high-contrast text color** for maximum legibility without the heaviness of solid blocks.

### Multi-Step Forms
For warehouse intake and shipping manifests. Utilizes a horizontal progress bar at the top with "Current," "Completed," and "Pending" states marked by Professional Blue, Success Green, and Neutral Slate respectively.

### Input Fields
Fields use a 1px border. On focus, they transition to a 2px Professional Blue border with a soft blue outer glow. Labels are always persistent (not floating) to ensure clear context during rapid data entry.